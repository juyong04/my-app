import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase';

// 학번 뒤 4자리 추출
function getLast4Digits(studentId) {
  if (!studentId || studentId.length < 4) return '';
  return studentId.slice(-4);
}
async function hasAlreadyReviewed(post, reviewerId, reviewTargetId) {
  const reviewPath =
    post.type === '구매'
      ? `groupbuys/${post.id}/reviews`
      : `groupdeliveries/${post.id}/reviews`;
  const reviewsRef = collection(db, reviewPath);
  const q = query(
    reviewsRef,
    where('reviewerId', '==', reviewerId),
    where('reviewTargetId', '==', reviewTargetId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
async function hasAlreadyReported(post, reporterId, reportedUserId) {
  const reportPath =
    post.type === '구매'
      ? `groupbuys/${post.id}/reports`
      : `groupdeliveries/${post.id}/reports`;
  const reportsRef = collection(db, reportPath);
  const q = query(
    reportsRef,
    where('reporterId', '==', reporterId),
    where('reportedUserId', '==', reportedUserId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          width: '360px',
          maxWidth: '90vw',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}
const getInitialReviewForm = () => ({
  timeRating: 0,
  priceRating: 0,
  placeRating: 0,
  comment: '',
});
const getInitialReviewModal = () => ({
  open: false,
  post: null,
  hostInfo: null,
  participants: [],
  selectedParticipant: null,
});
const getInitialReportForm = () => ({
  reason: '',
  comment: '',
});
const getInitialReportModal = () => ({
  open: false,
  post: null,
  hostInfo: null,
  participants: [],
  selectedParticipant: null,
});
const getInitialEvalModal = () => ({
  open: false,
  comments: [],
  loading: false,
  post: null,
});

function usePreserveCursorTextarea(value, setValue) {
  const textareaRef = useRef(null);
  const cursorPos = useRef(null);

  const handleChange = useCallback((e) => {
    // 커서 위치 저장
    cursorPos.current = e.target.selectionStart;
    setValue(prev => ({ ...prev, comment: e.target.value }));
  }, [setValue]);

  useLayoutEffect(() => {
    if (textareaRef.current && cursorPos.current !== null) {
      textareaRef.current.setSelectionRange(cursorPos.current, cursorPos.current);
    }
  }, [value]);

  return [textareaRef, handleChange];
}

function ParticipationHistoryPage() {
  const [tab, setTab] = useState('participated'); // 'participated' | 'written'
  const [participatedPosts, setParticipatedPosts] = useState([]);
  const [writtenPosts, setWrittenPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(getInitialReviewModal());
  const [reviewForm, setReviewForm] = useState(getInitialReviewForm());
  const [reportModal, setReportModal] = useState(getInitialReportModal());
  const [reportForm, setReportForm] = useState(getInitialReportForm());
  const [evalModal, setEvalModal] = useState(getInitialEvalModal());
  const [reviewTextareaRef, handleReviewTextareaChange] = usePreserveCursorTextarea(
  reviewForm.comment,
  (updater) => setReviewForm(prev => (typeof updater === 'function' ? updater(prev) : updater))
);

  // 신고 textarea 커서 보존 훅
  const [reportTextareaRef, handleReportTextareaChange] = usePreserveCursorTextarea(
    reportForm.reason,
    (updater) => setReportForm(prev => (typeof updater === 'function' ? updater(prev) : updater))
  );

  // 평균 평점 계산
  const calculateAverage = reviews => {
    if (!reviews.length) return 0;
    const total = reviews.reduce(
      (acc, cur) =>
        acc +
        ((cur.timeRating || 0) +
          (cur.priceRating || 0) +
          (cur.placeRating || 0)) / 3,
      0
    );
    return total / reviews.length;
  };

  // 참여한 거래 불러오기
  useEffect(() => {
    const fetchParticipationPosts = async () => {
      try {
        const uid = auth.currentUser.uid;
        const groupbuySnap = await getDocs(
          query(collection(db, 'groupbuyParticipants'), where('userId', '==', uid))
        );
        const deliverySnap = await getDocs(
          query(collection(db, 'groupdeliveryParticipants'), where('userId', '==', uid))
        );
        const processPost = async (docSnap, type) => {
          const postId = docSnap.data().postId;
          const postRef = doc(db, `${type === 'groupbuy' ? 'groupbuys' : 'groupdeliveries'}`, postId);
          const postDoc = await getDoc(postRef);
          if (!postDoc.exists()) return null;
          const reviewsRef = collection(db, `${type === 'groupbuy' ? 'groupbuys' : 'groupdeliveries'}/${postId}/reviews`);
          const reviewsSnap = await getDocs(reviewsRef);
          const reviews = reviewsSnap.docs.map(d => d.data());
          const avgRating = calculateAverage(reviews);
          return {
            id: postId,
            type: type === 'groupbuy' ? '구매' : '배달',
            ...postDoc.data(),
            avgRating,
            participantId: docSnap.id,
          };
        };
        const groupbuyPosts = await Promise.all(
          groupbuySnap.docs.map(d => processPost(d, 'groupbuy'))
        );
        const deliveryPosts = await Promise.all(
          deliverySnap.docs.map(d => processPost(d, 'groupdelivery'))
        );
        setParticipatedPosts([...groupbuyPosts, ...deliveryPosts].filter(Boolean));
      } catch (err) {
        console.error('🔥 참여 내역 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipationPosts();
  }, []);

  // 내가 작성한 글 불러오기
  useEffect(() => {
    const fetchWrittenPosts = async () => {
      try {
        const uid = auth.currentUser.uid;
        const groupbuySnap = await getDocs(
          query(collection(db, 'groupbuys'), where('uid', '==', uid))
        );
        const deliverySnap = await getDocs(
          query(collection(db, 'groupdeliveries'), where('uid', '==', uid))
        );
        const processPost = async (docSnap, type) => {
          const postId = docSnap.id;
          const data = docSnap.data();
          const reviewsRef = collection(db, `${type}s/${postId}/reviews`);
          const reviewsSnap = await getDocs(reviewsRef);
          const reviews = reviewsSnap.docs.map(d => d.data());
          const avgRating = calculateAverage(reviews);
          return {
            id: postId,
            type: type === 'groupbuy' ? '구매' : '배달',
            ...data,
            avgRating,
          };
        };
        const groupbuyPosts = await Promise.all(
          groupbuySnap.docs.map(d => processPost(d, 'groupbuy'))
        );
        const deliveryPosts = await Promise.all(
          deliverySnap.docs.map(d => processPost(d, 'groupdelivery'))
        );
        setWrittenPosts([...groupbuyPosts, ...deliveryPosts].filter(Boolean));
      } catch (err) {
        console.error('🔥 내가 쓴 글 불러오기 실패:', err);
      }
    };
    fetchWrittenPosts();
  }, []);

  // 참여자 목록 + 이름/학번 동기화
  const fetchParticipantsWithUserInfo = async post => {
    const collectionName = post.type === '구매'
      ? 'groupbuyParticipants'
      : 'groupdeliveryParticipants';
    const q = query(collection(db, collectionName), where('postId', '==', post.id));
    const snap = await getDocs(q);

    // 각 참여자 userId로 users 컬렉션에서 정보 fetch
    const participants = await Promise.all(
      snap.docs.map(async docSnap => {
        const participant = { id: docSnap.id, ...docSnap.data() };
        const userSnap = await getDoc(doc(db, 'users', participant.userId));
        if (userSnap.exists()) {
          const userData = userSnap.data();
          return {
            ...participant,
            displayName: userData.displayName,
            studentId: userData.studentId,
            userId: participant.userId,
          };
        }
        return participant;
      })
    );
    return participants;
  };

  // ===== 평가확인 모달 =====
  const handleOpenEvalModal = async post => {
    setEvalModal({ open: true, loading: true, comments: [], post });
    try {
      const reviewPath =
        post.type === '구매'
          ? `groupbuys/${post.id}/reviews`
          : `groupdeliveries/${post.id}/reviews`;
      const reviewsRef = collection(db, reviewPath);
      const snapshot = await getDocs(reviewsRef);
      const comments = snapshot.docs
        .map(doc => doc.data().comment)
        .filter(Boolean);
      setEvalModal({ open: true, loading: false, comments, post });
    } catch (err) {
      setEvalModal({ open: true, loading: false, comments: [], post });
      alert('평가 정보를 불러오는 데 실패했습니다.');
    }
  };
  const handleCloseEvalModal = () => {
    setEvalModal(getInitialEvalModal());
  };

  // ===== 리뷰/신고 모달 =====
  // 참여한 거래: 바로 평가/신고, 내가 작성한 글: 참여자 선택 → 평가/신고
  // 리뷰
  const handleOpenReviewModal = async post => {
    if (tab === 'participated') {
      // 바로 판매자 평가
      try {
        const reviewerId = auth.currentUser.uid;
        const reviewTargetId = post.uid;
        const already = await hasAlreadyReviewed(post, reviewerId, reviewTargetId);
        if (already) {
          alert('이미 리뷰를 작성한 거래입니다!');
          return;
        }
        const userSnap = await getDoc(doc(db, 'users', post.uid));
        if (!userSnap.exists()) return alert('거래 상대방 정보를 찾을 수 없습니다.');
        setReviewModal({
          open: true,
          post,
          hostInfo: userSnap.data(),
          participants: [],
          selectedParticipant: { userId: post.uid, ...userSnap.data() },
        });
        setReviewForm(getInitialReviewForm());
      } catch (err) {
        alert('리뷰 기능을 불러오는 중 오류가 발생했습니다.');
      }
    } else {
      // 내가 작성한 글: 참여자 선택
      try {
        const participants = await fetchParticipantsWithUserInfo(post);
        if (participants.length === 0) {
          alert('참여자가 없는 거래입니다!');
          return;
        }
        setReviewModal({
          open: true,
          post,
          hostInfo: null,
          participants,
          selectedParticipant: null,
        });
        setReviewForm(getInitialReviewForm());
      } catch (err) {
        alert('참여자 목록을 불러오는 중 오류가 발생했습니다.');
      }
    }
  };
  const handleSelectReviewParticipant = async participant => {
    const reviewerId = auth.currentUser.uid;
    const reviewTargetId = participant.userId;
    const already = await hasAlreadyReviewed(reviewModal.post, reviewerId, reviewTargetId);
    if (already) {
      alert('이미 리뷰를 작성한 참여자입니다!');
      return;
    }
    setReviewModal(prev => ({
      ...prev,
      selectedParticipant: participant,
    }));
  };
  const handleCloseReviewModal = () => {
    setReviewModal(getInitialReviewModal());
    setReviewForm(getInitialReviewForm());
  };
  const handleRatingChange = (category, rating) => {
    setReviewForm(prev => ({
      ...prev,
      [category]: rating,
    }));
  };
  const handleReviewSubmit = async e => {
    e.preventDefault();
    if (!reviewForm.timeRating || !reviewForm.priceRating || !reviewForm.placeRating) {
      alert('모든 평가 항목을 선택해주세요.');
      return;
    }
    if (!reviewForm.comment.trim()) {
      alert('코멘트를 입력해주세요.');
      return;
    }
    try {
      const post = reviewModal.post;
      const reviewerId = auth.currentUser.uid;
      const reviewTargetId = reviewModal.selectedParticipant.userId;
      const reviewPath =
        post.type === '구매'
          ? `groupbuys/${post.id}/reviews`
          : `groupdeliveries/${post.id}/reviews`;
      await addDoc(collection(db, reviewPath), {
        reviewerId,
        reviewTargetId,
        timeRating: reviewForm.timeRating,
        priceRating: reviewForm.priceRating,
        placeRating: reviewForm.placeRating,
        comment: reviewForm.comment,
        createdAt: new Date(),
      });
      alert('리뷰가 등록되었습니다!');
      handleCloseReviewModal();
    } catch (err) {
      alert('리뷰 제출 중 오류가 발생했습니다.');
    }
  };

  // 신고
  const handleOpenReportModal = async post => {
    if (tab === 'participated') {
      try {
        const reporterId = auth.currentUser.uid;
        const reportedUserId = post.uid;
        const already = await hasAlreadyReported(post, reporterId, reportedUserId);
        if (already) {
          alert('이미 신고한 사용자입니다!');
          return;
        }
        const userSnap = await getDoc(doc(db, 'users', post.uid));
        if (!userSnap.exists()) return alert('거래 상대방 정보를 찾을 수 없습니다.');
        setReportModal({
          open: true,
          post,
          hostInfo: userSnap.data(),
          participants: [],
          selectedParticipant: { userId: post.uid, ...userSnap.data() },
        });
        setReportForm(getInitialReportForm());
      } catch (err) {
        alert('신고 기능을 불러오는 중 오류가 발생했습니다.');
      }
    } else {
      try {
        const participants = await fetchParticipantsWithUserInfo(post);
        if (participants.length === 0) {
          alert('참여자가 없는 거래입니다!');
          return;
        }
        setReportModal({
          open: true,
          post,
          hostInfo: null,
          participants,
          selectedParticipant: null,
        });
        setReportForm(getInitialReportForm());
      } catch (err) {
        alert('참여자 목록을 불러오는 중 오류가 발생했습니다.');
      }
    }
  };
  const handleSelectReportParticipant = async participant => {
    const reporterId = auth.currentUser.uid;
    const reportedUserId = participant.userId;
    const already = await hasAlreadyReported(reportModal.post, reporterId, reportedUserId);
    if (already) {
      alert('이미 신고한 참여자입니다!');
      return;
    }
    setReportModal(prev => ({
      ...prev,
      selectedParticipant: participant,
    }));
  };
  const handleCloseReportModal = () => {
    setReportModal(getInitialReportModal());
    setReportForm(getInitialReportForm());
  };
  const handleReportSubmit = async e => {
    e.preventDefault();
    if (!reportForm.reason.trim()) {
      alert('신고 사유를 입력해주세요.');
      return;
    }
    try {
      const post = reportModal.post;
      const reporterId = auth.currentUser.uid;
      const reportedUserId = reportModal.selectedParticipant.userId;
      const reportPath =
        post.type === '구매'
          ? `groupbuys/${post.id}/reports`
          : `groupdeliveries/${post.id}/reports`;
      await addDoc(collection(db, reportPath), {
        reporterId,
        reportedUserId,
        reason: reportForm.reason,
        comment: reportForm.comment,
        createdAt: new Date(),
      });
      alert('신고가 접수되었습니다.');
      handleCloseReportModal();
    } catch (err) {
      alert('신고 제출 중 오류가 발생했습니다.');
    }
  };

  const renderList = posts =>
    posts.length === 0 ? (
      <div style={{ textAlign: 'center', color: '#aaa', marginTop: 40 }}>
        거래 내역이 없습니다.
      </div>
    ) : (
      <div>
        {posts.map(post => {
          const deadline = new Date(post.deadline);
          return (
            <div
              key={post.id + post.type}
              style={{
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: 0,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'stretch',
                gap: 0,
                position: 'relative',
              }}
            >
              {/* 본문 */}
              <div
                style={{
                  flex: 1,
                  padding: '16px 16px 16px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: 13, color: '#aaa', fontWeight: 500 }}>
                  {deadline.toISOString().slice(0, 10)}
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      color: '#f39c12',
                      background: '#fffbe8',
                      borderRadius: 8,
                      padding: '2px 8px',
                      verticalAlign: 'middle',
                      fontWeight: 600,
                    }}
                  >
                    ★ {post.avgRating ? post.avgRating.toFixed(1) : '0.0'}
                  </span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, margin: '4px 0 2px' }}>
                  {post.title}
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>
                  모집인원 {post.goalPeople}명
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>
                  예상가격 {Number(post.totalPrice?.replace(/,/g, '')).toLocaleString()}원
                </div>
                {/* 버튼 */}
                {tab === 'participated' && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleOpenReviewModal(post)}
                      style={{
                        background: '#222',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      리뷰쓰기
                    </button>
                    <button
                      onClick={() => handleOpenReportModal(post)}
                      style={{
                        background: '#fff3f3',
                        color: '#d32f2f',
                        border: '1px solid #d32f2f',
                        borderRadius: 8,
                        padding: '6px 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      🚨 신고하기
                    </button>
                  </div>
                )}
                {tab === 'written' && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleOpenReviewModal(post)}
                      style={{
                        background: '#222',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      리뷰쓰기
                    </button>
                    <button
                      onClick={() => handleOpenReportModal(post)}
                      style={{
                        background: '#fff3f3',
                        color: '#d32f2f',
                        border: '1px solid #d32f2f',
                        borderRadius: 8,
                        padding: '6px 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      🚨 신고하기
                    </button>
                    <button
                      onClick={() => handleOpenEvalModal(post)}
                      style={{
                        background: '#e8f4ff',
                        color: '#1976d2',
                        border: '1px solid #1976d2',
                        borderRadius: 8,
                        padding: '6px 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      평가확인
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );

  const ReviewModalContent = () => {
    if (tab === 'written' && reviewModal.open && !reviewModal.selectedParticipant) {
      return (
        <div style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>참여자 선택</h3>
          {reviewModal.participants.map(participant => (
            <div
              key={participant.userId}
              style={{
                padding: 12,
                marginBottom: 8,
                border: '1px solid #eee',
                borderRadius: 8,
                cursor: 'pointer',
              }}
              onClick={() => handleSelectReviewParticipant(participant)}
            >
              {participant.displayName}
              {participant.studentId && ` (${getLast4Digits(participant.studentId)})`}
            </div>
          ))}
        </div>
      );
    }
    // 평가 폼
    if (
      (tab === 'written' && reviewModal.selectedParticipant) ||
      (tab === 'participated' && reviewModal.selectedParticipant)
    ) {
      const target = reviewModal.selectedParticipant;
      return (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #f0f0f0',
              background: '#fff',
            }}
          >
            <button
              onClick={handleCloseReviewModal}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 18,
                cursor: 'pointer',
                marginRight: 12,
                color: '#333',
                padding: 0,
              }}
              aria-label="뒤로가기"
            >
              ←
            </button>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#333',
              }}
            >
              {tab === 'written' ? '참여자 평가하기' : '판매자 평가하기'}
            </div>
          </div>
          {/* 평가 대상자 정보 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f3f6ff',
              borderRadius: 12,
              padding: 12,
              margin: 20,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: '#1976d2',
              }}
            >
              {target.displayName}
              {target.studentId && ` (${getLast4Digits(target.studentId)})`}
            </div>
          </div>
          <form onSubmit={handleReviewSubmit} style={{ padding: '20px' }}>
            {/* 거래 시간을 잘 지켜요 */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 12,
                  color: '#333',
                }}
              >
                거래 시간을 잘 지켰어요
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingChange('timeRating', rating)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor:
                        reviewForm.timeRating === rating ? '#fbbf24' : '#f5f5f5',
                      color: reviewForm.timeRating === rating ? '#fff' : '#999',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
            {/* 예상 가격과 일치해요 */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 12,
                  color: '#333',
                }}
              >
                예상 가격과 일치했어요
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingChange('priceRating', rating)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor:
                        reviewForm.priceRating === rating ? '#fbbf24' : '#f5f5f5',
                      color: reviewForm.priceRating === rating ? '#fff' : '#999',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
            {/* 약속한 장소에서 수령했어요 */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 12,
                  color: '#333',
                }}
              >
                약속한 장소에서 수령했어요
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingChange('placeRating', rating)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor:
                        reviewForm.placeRating === rating ? '#fbbf24' : '#f5f5f5',
                      color: reviewForm.placeRating === rating ? '#fff' : '#999',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
            {/* 기타 건의 사항 */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 12,
                  color: '#333',
                }}
              >
                기타 건의 사항
              </div>
              <textarea
                ref={reviewTextareaRef}
                value={reviewForm.comment}
                onChange={handleReviewTextareaChange}
                
                placeholder="거래에 대한 후기를 자유롭게 남겨주세요"
                style={{
                  width: '100%',
                  minHeight: 80,
                  borderRadius: 8,
                  border: '1px solid #e0e0e0',
                  padding: '12px',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  lineHeight: '1.4',
                  fontFamily: 'inherit',
                  background: '#fff',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '14px 0',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              평가하기
            </button>
          </form>
        </div>
      );
    }
    return null;
  };

  const ReportModalContent = () => {
    if (tab === 'written' && reportModal.open && !reportModal.selectedParticipant) {
      return (
        <div style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>참여자 선택</h3>
          {reportModal.participants.map(participant => (
            <div
              key={participant.userId}
              style={{
                padding: 12,
                marginBottom: 8,
                border: '1px solid #eee',
                borderRadius: 8,
                cursor: 'pointer',
              }}
              onClick={() => handleSelectReportParticipant(participant)}
            >
              {participant.displayName}
              {participant.studentId && ` (${getLast4Digits(participant.studentId)})`}
            </div>
          ))}
        </div>
      );
    }
    if (
      (tab === 'written' && reportModal.selectedParticipant) ||
      (tab === 'participated' && reportModal.selectedParticipant)
    ) {
      const target = reportModal.selectedParticipant;
      return (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #f0f0f0',
              background: '#fff',
            }}
          >
            <button
              onClick={handleCloseReportModal}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 18,
                cursor: 'pointer',
                marginRight: 12,
                color: '#333',
                padding: 0,
              }}
              aria-label="뒤로가기"
            >
              ←
            </button>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#d32f2f',
              }}
            >
              {tab === 'written' ? '참여자 신고하기' : '판매자 신고하기'}
            </div>
          </div>
          {/* 신고 대상자 정보 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#fff3f3',
              borderRadius: 12,
              padding: 12,
              margin: 20,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: '#d32f2f',
              }}
            >
              {target.displayName}
              {target.studentId && ` (${getLast4Digits(target.studentId)})`}
            </div>
          </div>
          <form onSubmit={handleReportSubmit} style={{ padding: 20 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 12,
                color: '#333',
              }}
            >
              신고 사유
            </div>
            <textarea
              ref={reportTextareaRef}
              value={reviewForm.comment}
              onChange={handleReviewTextareaChange}
              
              placeholder="신고 사유를 입력해 주세요."
              
              style={{
                width: '100%',
                minHeight: 80,
                borderRadius: 8,
                border: '1px solid #e0e0e0',
                padding: 12,
                fontSize: 14,
                marginBottom: 12,
                boxSizing: 'border-box',
                resize: 'vertical',
                lineHeight: '1.4',
                fontFamily: 'inherit',
                background: '#fff',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button
                type="button"
                onClick={handleCloseReportModal}
                style={{
                  flex: 1,
                  background: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '14px 0',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                취소
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: '#d32f2f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '14px 0',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                신고하기
              </button>
            </div>
          </form>
        </div>
      );
    }
    return null;
  };

  const EvalModalContent = () => (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#1976d2',
            flex: 1,
          }}
        >
          평가 코멘트 모아보기
        </div>
        <button
          onClick={handleCloseEvalModal}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            color: '#333',
            padding: 0,
          }}
          aria-label="닫기"
        >
          ×
        </button>
      </div>
      <div style={{ maxHeight: 320, overflowY: 'auto', padding: 20 }}>
        {evalModal.loading ? (
          <div style={{ textAlign: 'center', color: '#888', margin: '40px 0' }}>
            불러오는 중...
          </div>
        ) : evalModal.comments.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', margin: '40px 0' }}>
            아직 등록된 평가 코멘트가 없습니다.
          </div>
        ) : (
          evalModal.comments.map((comment, idx) => (
            <div
              key={idx}
              style={{
                background: '#f7fafd',
                borderRadius: 8,
                padding: '12px 14px',
                marginBottom: 14,
                fontSize: 14,
                color: '#222',
                whiteSpace: 'pre-line',
              }}
            >
              {comment}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        background: '#fafbfc',
        minHeight: '100vh',
        padding: 16,
      }}
    >
      <div>
        <br></br>
        <br></br>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setTab('participated')}
          style={{
            flex: 1,
            background: tab === 'participated' ? '#222' : '#f4f4f4',
            color: tab === 'participated' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            padding: '12px 0',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          참여한 거래
        </button>
        <button
          onClick={() => setTab('written')}
          style={{
            flex: 1,
            background: tab === 'written' ? '#222' : '#f4f4f4',
            color: tab === 'written' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            padding: '12px 0',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          내가 작성한 글
        </button>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 40 }}>로딩 중...</div>
      ) : tab === 'participated' ? (
        renderList(participatedPosts)
      ) : (
        renderList(writtenPosts)
      )}

      <Modal open={reviewModal.open} onClose={handleCloseReviewModal}>
        <ReviewModalContent />
      </Modal>
      <Modal open={reportModal.open} onClose={handleCloseReportModal}>
        <ReportModalContent />
      </Modal>
      <Modal open={evalModal.open} onClose={handleCloseEvalModal}>
        {evalModal.open && <EvalModalContent />}
      </Modal>
    </div>
  );
}

export default ParticipationHistoryPage;