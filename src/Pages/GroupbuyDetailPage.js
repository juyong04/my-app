// GroupbuyDetailPage.js - 수정 버튼 제거됨
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  arrayUnion,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import KakaoMapSearch from '../Components/KaKaoMapSearch.js';
import DeadlinePopup from '../Components/DeadlinePopup';

function GroupbuyDetailPage({ post, goBack }) {
  const [deadlinePopup, setDeadlinePopup] = useState({
    isOpen: false,
    meetTime: '',
    title: '',
    postId: '',
    type: 'buy'
  });
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    const checkParticipation = async () => {
      if (!auth.currentUser) return;
      
      try {
        const q = query(
          collection(db, 'groupbuyParticipants'),
          where('userId', '==', auth.currentUser.uid),
          where('postId', '==', post.id)
        );
        const querySnapshot = await getDocs(q);
        setIsParticipant(!querySnapshot.empty);
      } catch (error) {
        console.error('참여 여부 확인 실패:', error);
      }
    };

    checkParticipation();
  }, [post.id]);

  const perPersonPrice = Math.floor(
    Number(post.totalPrice.replace(/,/g, '')) / Number(post.goalPeople)
  ).toLocaleString();

  const handleOpenDeadlinePopup = () => {
    setDeadlinePopup({
      isOpen: true,
      meetTime: post.meetTime?.replace('T', ' '),
      title: post.title,
      postId: post.id,
      type: 'buy'
    });
  };

  const handleCloseDeadlinePopup = () => {
    setDeadlinePopup({
      isOpen: false,
      meetTime: '',
      title: '',
      postId: '',
      type: 'buy'
    });
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
      await updateDoc(postRef, {
        participants: arrayUnion(auth.currentUser.uid),
        currentPeople: (postData.currentPeople || 0) + 1,
      });

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
  const isDeadlinePassed = new Date() > new Date(post.deadline);

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
      <p><strong>모집 마감일:</strong> {post.deadline?.replace('T', ' ')}</p>
      
      <p><strong>총 금액:</strong> {post.totalPrice} 원</p>
      <p><strong>1인당 금액:</strong> {perPersonPrice} 원</p>
      <p><strong>설명:</strong><br />{post.description}</p>
      <p><strong>거래 일시:</strong> {post.meetTime?.replace('T', ' ')}</p>
      <p><strong>거래 위치:</strong> {post.location} {post.locationDetail}</p>
      
      <KakaoMapSearch location={post.location} />

      {isAuthor ? (
        <div style={{ marginTop: '20px' }}>
          <button onClick={handleDelete}>🗑 삭제</button>
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {isDeadlinePassed && isParticipant ? (
            <button 
              onClick={handleOpenDeadlinePopup}
              style={{
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 14,
                color: '#495057',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              작성자 정보 보기
            </button>
          ) : !isDeadlinePassed && (
            <button onClick={handleJoin}>🤝 참여하기</button>
          )}
        </div>
      )}

      <DeadlinePopup
        isOpen={deadlinePopup.isOpen}
        onClose={handleCloseDeadlinePopup}
        meetTime={deadlinePopup.meetTime}
        title={deadlinePopup.title}
        postId={deadlinePopup.postId}
        type={deadlinePopup.type}
      />
    </div>
  );
}

export default GroupbuyDetailPage;