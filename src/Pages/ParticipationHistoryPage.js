import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  deleteDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase';

function ParticipationHistoryPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipationPosts = async () => {
      try {
        const uid = auth.currentUser.uid;

        // 공동구매 참여
        const groupbuySnap = await getDocs(
          query(collection(db, 'groupbuyParticipants'), where('userId', '==', uid))
        );
        const groupbuyPosts = await Promise.all(
          groupbuySnap.docs.map(async (docSnap) => {
            const postId = docSnap.data().postId;
            const postRef = doc(db, 'groupbuys', postId);
            const post = await getDoc(postRef);
            return post.exists()
              ? { id: post.id, type: '구매', ...post.data() }
              : null;
          })
        );

        // 공동배달 참여
        const deliverySnap = await getDocs(
          query(collection(db, 'groupdeliveryParticipants'), where('userId', '==', uid))
        );
        const deliveryPosts = await Promise.all(
          deliverySnap.docs.map(async (docSnap) => {
            const postId = docSnap.data().postId;
            const postRef = doc(db, 'groupdeliveries', postId);
            const post = await getDoc(postRef);
            return post.exists()
              ? { id: post.id, type: '배달', ...post.data() }
              : null;
          })
        );

        const allPosts = [...groupbuyPosts, ...deliveryPosts].filter(Boolean);
        setPosts(allPosts);
      } catch (err) {
        console.error('🔥 참여 내역 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipationPosts();
  }, []);

  // 🔍 취소 가능 여부 판단 함수
  const isCancelable = (post) => {
    if (post.type === '배달') return false;

    const deadline = new Date(post.deadline);
    const now = new Date();
    const oneDayBefore = new Date(deadline);
    oneDayBefore.setDate(deadline.getDate() - 1);

    return now < oneDayBefore;
  };

  // ❌ 취소 처리 함수 (공동구매 전용)
  const handleCancelParticipation = async (post) => {
    if (!auth.currentUser) return;

    try {
      const uid = auth.currentUser.uid;

      // 1. groupbuys 문서 업데이트
      const postRef = doc(db, 'groupbuys', post.id);
      const postSnap = await getDoc(postRef);
      const postData = postSnap.data();

      if (!postData) return;

      await updateDoc(postRef, {
        participants: arrayRemove(uid),
        currentPeople: Math.max((postData.currentPeople || 1) - 1, 0),
      });

      // 2. groupbuyParticipants 문서 삭제
      const q = query(
        collection(db, 'groupbuyParticipants'),
        where('userId', '==', uid),
        where('postId', '==', post.id)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async (docSnap) => {
        await deleteDoc(doc(db, 'groupbuyParticipants', docSnap.id));
      });

      alert('참여가 취소되었습니다.');
      setPosts((prev) => prev.filter((p) => p.id !== post.id || p.type !== post.type)); // UI 갱신
    } catch (err) {
      console.error('취소 실패:', err);
      alert('취소 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>내 참여 내역</h2>
      {loading ? (
        <p>로딩 중...</p>
      ) : posts.length === 0 ? (
        <p>참여한 거래가 없습니다.</p>
      ) : (
        <ul>
          {posts.map((post) => {
            const deadline = new Date(post.deadline);
            const now = new Date();
            const isBeforeDeadline = now < deadline;
            const isDone = post.status === 'done'; // 거래 완료 여부 (향후 확장 가능)

            return (
              <li key={`${post.id}-${post.type}`} style={{
                marginBottom: '16px',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <div><strong>[{post.type}] {post.title}</strong></div>
                <div>마감일: {deadline.toLocaleString('ko-KR')}</div>
                <div>
                  1인당 금액: {Math.floor(Number(post.totalPrice?.replace(/,/g, '')) / Number(post.goalPeople || 1)).toLocaleString()} 원
                </div>

                {/* 상태별 액션 버튼 */}
                {isDone ? (
                  <button>📝 리뷰쓰기</button>
                ) : isBeforeDeadline ? (
                  isCancelable(post) ? (
                    <button onClick={() => handleCancelParticipation(post)}>❌ 취소하기</button>
                  ) : post.type === '구매' ? (
                    <p style={{ color: 'gray' }}>마감 하루 전까지만 취소 가능</p>
                  ) : null
                ) : (
                  <p style={{ color: 'gray' }}>모집 마감</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ParticipationHistoryPage;
