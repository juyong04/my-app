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
  const [selectedPost, setSelectedPost] = useState(null);
  const [hostInfo, setHostInfo] = useState(null);
  const [participantDetail, setParticipantDetail] = useState(null);

  useEffect(() => {
    const fetchParticipationPosts = async () => {
      try {
        const uid = auth.currentUser.uid;

        const groupbuySnap = await getDocs(
          query(collection(db, 'groupbuyParticipants'), where('userId', '==', uid))
        );
        const groupbuyPosts = await Promise.all(
          groupbuySnap.docs.map(async (docSnap) => {
            const postId = docSnap.data().postId;
            const postRef = doc(db, 'groupbuys', postId);
            const post = await getDoc(postRef);
            return post.exists() ? { id: post.id, type: '구매', ...post.data() } : null;
          })
        );

        const deliverySnap = await getDocs(
          query(collection(db, 'groupdeliveryParticipants'), where('userId', '==', uid))
        );
        const deliveryPosts = await Promise.all(
          deliverySnap.docs.map(async (docSnap) => {
            const postId = docSnap.data().postId;
            const postRef = doc(db, 'groupdeliveries', postId);
            const post = await getDoc(postRef);
            return post.exists()
              ? { id: post.id, type: '배달', participantId: docSnap.id, ...post.data() }
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

  const isCancelable = (post) => {
    if (post.type === '배달') return false;
    const deadline = new Date(post.deadline);
    const now = new Date();
    const oneDayBefore = new Date(deadline);
    oneDayBefore.setDate(deadline.getDate() - 1);
    return now < oneDayBefore;
  };

  const handleCancelParticipation = async (post) => {
    if (!auth.currentUser) return;
    try {
      const uid = auth.currentUser.uid;

      await updateDoc(doc(db, 'groupbuys', post.id), {
        participants: arrayRemove(uid),
        currentPeople: Math.max((post.currentPeople || 1) - 1, 0),
      });

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
      setPosts((prev) => prev.filter((p) => p.id !== post.id || p.type !== post.type));
    } catch (err) {
      console.error('취소 실패:', err);
      alert('취소 중 오류가 발생했습니다.');
    }
  };

  const handleShowPaymentInfo = async (post) => {
    try {
      const userSnap = await getDoc(doc(db, 'users', post.uid));
      if (!userSnap.exists()) return alert('작성자 정보를 찾을 수 없습니다.');

      let participant = null;
      if (post.type === '배달' && post.participantId) {
        const participantSnap = await getDoc(doc(db, 'groupdeliveryParticipants', post.participantId));
        if (participantSnap.exists()) {
          participant = participantSnap.data();
        }
      }

      setSelectedPost(post);
      setHostInfo(userSnap.data());
      setParticipantDetail(participant);
    } catch (err) {
      console.error('입금 정보 조회 실패:', err);
      alert('입금 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
    setHostInfo(null);
    setParticipantDetail(null);
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
            const meetTime = new Date(post.meetTime);
            const now = new Date();
            const isBeforeDeadline = now < deadline;
            const isBeforeMeetTime = now < meetTime;

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
                <div>거래일시: {meetTime.toLocaleString('ko-KR')}</div>
                <div>
                  1인당 금액: {Math.floor(Number(post.totalPrice?.replace(/,/g, '')) / Number(post.goalPeople || 1)).toLocaleString()} 원
                </div>

                {!isBeforeMeetTime ? (
                  <button onClick={() => alert('📝 리뷰 기능은 준비 중입니다!')}>📝 리뷰쓰기</button>
                ) : isBeforeDeadline ? (
                  isCancelable(post) ? (
                    <button onClick={() => handleCancelParticipation(post)}>❌ 취소하기</button>
                  ) : post.type === '구매' ? (
                    <p style={{ color: 'gray' }}>마감 하루 전까지만 취소 가능</p>
                  ) : null
                ) : (
                  <>
                    <p style={{ color: 'gray' }}>모집 마감</p>
                    {isBeforeMeetTime && (
                      <button onClick={() => handleShowPaymentInfo(post)}>💳입금 및 거래 정보</button>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {selectedPost && hostInfo && (
        <div className="modal-overlay" onClick={handleCloseModal} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: '#fff',
            padding: '24px',
            borderRadius: '12px',
            width: '320px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            <h3>입금 정보</h3>
            <p><strong>작성자 이름:</strong> {hostInfo.displayName}</p>
            <p><strong>계좌번호:</strong> {hostInfo.accountNumber}</p>
            <p><strong>입금 금액:</strong> {
              Math.floor(Number(selectedPost.totalPrice?.replace(/,/g, '')) / Number(selectedPost.goalPeople || 1)).toLocaleString()
            } 원</p>
            <br />

            <h3>거래 정보</h3>
            <p><strong>거래 일시:</strong> {new Date(selectedPost.meetTime).toLocaleString('ko-KR')}</p>
            <p><strong>거래 장소:</strong> {selectedPost.location} {selectedPost.locationDetail}</p>
            {selectedPost.type === '배달' && participantDetail && (
              <>
                <p><strong>주문 메뉴:</strong> {participantDetail.menu}</p>
                <p><strong>결제 금액:</strong> {participantDetail.price} 원</p>
                <p><strong>입금자명:</strong> {participantDetail.depositor}</p>
              </>
            )}
            <button onClick={handleCloseModal} style={{ marginTop: '12px' }}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParticipationHistoryPage;
