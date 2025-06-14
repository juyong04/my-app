// GroupbuyDetailPage.js - 작성자 닉네임 및 평점 표시 개선
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
      // 먼저 게시물의 참여자 목록을 가져옵니다
      const postRef = doc(db, 'groupbuys', post.id);
      const postSnap = await getDoc(postRef);
      const postData = postSnap.data();

      if (!postData || !postData.participants) {
        alert('참여자 정보가 없습니다.');
        return;
      }

      // 참여자들의 정보를 가져옵니다
      const participantsData = await Promise.all(
        postData.participants.map(async (userId) => {
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();

          // 참여 시간 정보를 가져옵니다
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

  const maskName = (name) => {
    if (!name || name.length < 2) return name;
    return name.charAt(0) + '*' + name.slice(2);
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

      <p>
        <strong>작성자:</strong> {authorInfo?.displayName || '익명'}
        {authorInfo?.avgRating && (
          <span style={{ marginLeft: '8px', color: '#666' }}>
            ⭐ {authorInfo.avgRating.toFixed(1)}
          </span>
        )}
      </p>
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
          {isDeadlinePassed && (
            <button 
              onClick={handleShowParticipantsInfo}
              style={{
                background: '#2ecc71',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                marginRight: '10px',
                cursor: 'pointer'
              }}
            >
              참여자 정보 보기
            </button>
          )}
          <button 
            onClick={handleDelete}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🗑 삭제
          </button>
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
            <button 
              onClick={handleJoin}
              style={{
                background: '#2ecc71',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              🤝 참여하기
            </button>
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

      {showParticipantsInfo && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowParticipantsInfo(false)}
        >
          <div 
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '90%',
              width: '400px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '20px' }}>참여자 정보</h3>
            {participantsInfo.map((participant, index) => (
              <div 
                key={index}
                style={{
                  padding: '15px',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}
              >
                <p><strong>이름:</strong> {maskName(participant.displayName)}</p>
                <p><strong>학번:</strong> {participant.studentId}</p>
                <p><strong>계좌번호:</strong> {participant.accountNumber || '등록된 계좌번호 없음'}</p>
                <p><strong>참여일시:</strong> {participant.joinedAt?.toDate().toLocaleString()}</p>
              </div>
            ))}
            <button
              onClick={() => setShowParticipantsInfo(false)}
              style={{
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                width: '100%',
                marginTop: '20px',
                cursor: 'pointer'
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupbuyDetailPage;