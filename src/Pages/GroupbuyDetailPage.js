import React, { useEffect, useState } from 'react';
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
import './GroupbuyDetailPage.css';
import PageLayout from '../Layout/PageLayout';

function GroupbuyDetailPage({ post, goBack }) {
  const [authorInfo, setAuthorInfo] = useState(null);
  const [deadlinePopup, setDeadlinePopup] = useState({
    isOpen: false,
    meetTime: '',
    title: '',
    postId: '',
    type: 'buy'
  });
  const [isParticipant, setIsParticipant] = useState(false);
  const [participantsInfo, setParticipantsInfo] = useState([]);
  const [showParticipantsInfo, setShowParticipantsInfo] = useState(false);

  useEffect(() => {
    const fetchAuthorInfo = async () => {
      if (!post?.uid) return;
      const userRef = doc(db, 'users', post.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const user = userSnap.data();
        const avg = (
          (user.avgTimeRating || 0) +
          (user.avgPriceRating || 0) +
          (user.avgPlaceRating || 0)
        ) / 3;
        setAuthorInfo({
          displayName: user.displayName || '익명',
          avgRating: avg,
        });
      }
    };
    fetchAuthorInfo();
  }, [post?.uid]);

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

  const handleShowParticipantsInfo = async () => {
    try {
      const postRef = doc(db, 'groupbuys', post.id);
      const postSnap = await getDoc(postRef);
      const postData = postSnap.data();
      if (!postData || !postData.participants) {
        alert('참여자 정보가 없습니다.');
        return;
      }
      const participantsData = await Promise.all(
        postData.participants.map(async (userId) => {
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          const participantQuery = query(
            collection(db, 'groupbuyParticipants'),
            where('userId', '==', userId),
            where('postId', '==', post.id)
          );
          const participantSnap = await getDocs(participantQuery);
          const participantData = participantSnap.docs[0]?.data();
          return {
            ...userData,
            joinedAt: participantData?.joinedAt
          };
        })
      );
      setParticipantsInfo(participantsData);
      setShowParticipantsInfo(true);
    } catch (error) {
      console.error('참여자 정보 조회 실패:', error);
      alert('참여자 정보를 불러오는데 실패했습니다.');
    }
  };

  const isAuthor = auth.currentUser?.uid === post.uid;
  const isDeadlinePassed = new Date() > new Date(post.deadline);
  const isJoinDisabled = isAuthor || isDeadlinePassed || isParticipant;

  return (
    <PageLayout>
      <div className="groupbuy-detail-container">
        <div className="top-bar">
          <button className="back-button" onClick={goBack}>← 목록으로</button>
          {isAuthor && !isDeadlinePassed && (
            <button className="delete-btn-inline" onClick={handleDelete}>🗑 삭제</button>
          )}
        </div>
        <h2 className="post-title">{post.title}</h2>

        <div className="info-block">
          <div className="info-item"><strong>모집 인원</strong><div>{post.goalPeople}명 중 {post.currentPeople || 0}명 모집 완료 </div></div>
          <div className="info-item"><strong>모집 마감일</strong><div>{post.deadline?.replace('T', ' ')}</div></div>
          <div className="info-item"><strong>총 금액</strong><div>{post.totalPrice} 원</div></div>
          <div className="info-item"><strong>1인당 금액</strong><div>{perPersonPrice} 원</div></div>
          <div className="info-item"><strong>설명</strong><div>{post.description}</div></div>
        </div>

        <div className="meeting-map-card">
          <p className="meeting-label">📍 거래 일시</p>
          <p className="meeting-time">{post.meetTime?.replace('T', ' ')}</p>
          <p className="meeting-label">📌 거래 위치</p>
          <p className="meeting-location">{post.location} {post.locationDetail}</p>
          <div className="map-container">
            <KakaoMapSearch location={post.location} />
          </div>
        </div>

        {isAuthor && (
          <div className="action-buttons">
            {isDeadlinePassed && (
              <button className="info-btn" onClick={handleShowParticipantsInfo}>참여자 정보 보기</button>
            )}
          </div>
        )}

        <div className="author-card">
          <div className="author-row">
            <strong>{authorInfo?.displayName || '익명'}</strong>
            {authorInfo?.avgRating && (
              <span className="author-rating">⭐ {authorInfo.avgRating.toFixed(1)}</span>
            )}
          </div>
        </div>

        {!isAuthor && (
          <button
            className={`floating-join-btn ${isJoinDisabled ? 'disabled' : ''}`}
            onClick={!isJoinDisabled ? handleJoin : null}
            disabled={isJoinDisabled}
          >
            {isJoinDisabled ? '참여 불가' : '🤝 참여하기'}
          </button>
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
    </PageLayout>
  );
}

export default GroupbuyDetailPage;
