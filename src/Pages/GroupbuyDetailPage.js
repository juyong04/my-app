import React from 'react';
import { auth, db } from '../firebase';
import {
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  arrayUnion,
  addDoc,
  collection,
} from 'firebase/firestore';
import KakaoMapSearch from '../Components/KaKaoMapSearch.js';

function GroupbuyDetailPage({ post, goBack }) {
  const perPersonPrice = Math.floor(
    Number(post.totalPrice.replace(/,/g, '')) / Number(post.goalPeople)
  ).toLocaleString();

  const handleEdit = () => {
    alert('✏️ 수정 기능은 아직 준비 중입니다!');
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'groupbuys', post.id));
      alert('삭제되었습니다.');
      goBack();
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  const handleJoin = async () => {
    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    const postRef = doc(db, 'groupbuys', post.id);
    const postSnap = await getDoc(postRef);
    const postData = postSnap.data();

    if (!postData) return;

    const now = new Date();
    const deadline = new Date(postData.deadline);

    if (now > deadline) {
      alert('이미 마감된 모집입니다.');
      return;
    }

    const participants = postData.participants || [];
    if (participants.includes(auth.currentUser.uid)) {
      alert('이미 참여한 글입니다.');
      return;
    }

    try {
      // 1. groupbuys 문서 업데이트
      await updateDoc(postRef, {
        participants: arrayUnion(auth.currentUser.uid),
        currentPeople: (postData.currentPeople || 0) + 1,
      });

      // 2. 🔥 참여 기록 컬렉션에도 추가
      await addDoc(collection(db, 'groupbuyParticipants'), {
        userId: auth.currentUser.uid,
        postId: post.id,
        joinedAt: new Date(),
      });

      alert('참여가 완료되었습니다!');
    } catch (err) {
      console.error('참여 실패:', err);
      alert('참여 처리 중 오류가 발생했습니다.');
    }
  };

  const isAuthor = auth.currentUser?.uid === post.uid;

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={goBack} style={{ marginBottom: '10px' }}>
        ← 목록으로
      </button>
      <h2>{post.title}</h2>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="상품 이미지"
          style={{
            width: '100%',
            maxHeight: '300px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '12px',
          }}
        />
      )}

      <p><strong>목표 인원:</strong> {post.goalPeople}명</p>
      <p><strong>현재 인원:</strong> {post.currentPeople || 0}명</p>
      <p><strong>마감일:</strong> {post.deadline.replace('T', ' ')}</p>
      <p><strong>총 금액:</strong> {post.totalPrice} 원</p>
      <p><strong>1인당 금액:</strong> {perPersonPrice} 원</p>
      <p><strong>설명:</strong><br />{post.description}</p>
      <p><strong>거래 위치:</strong> {post.location} {post.locationDetail}</p>

      <KakaoMapSearch location={post.location} />

      {isAuthor ? (
        <div style={{ marginTop: '20px' }}>
          <button onClick={handleEdit} style={{ marginRight: '8px' }}>✏️ 수정</button>
          <button onClick={handleDelete}>🗑 삭제</button>
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          <button onClick={handleJoin}>🤝 참여하기</button>
        </div>
      )}
    </div>
  );
}

export default GroupbuyDetailPage;
