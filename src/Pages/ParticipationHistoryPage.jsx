import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import '../Pages/ParticipationHistoryPage.css';

import Modal from '../Components/Modal';
import ReviewModalContent from '../Components/ReviewModal';
import ReportModalContent from '../Components/ReportModal';
import EvalModalContent from '../Components/EvalModal';

import usePreserveCursorTextarea from '../hooks/usePreserveCursorTextarea';
import { hasAlreadyReviewed, hasAlreadyReported, fetchParticipantsWithUserInfo } from '../utils/firebaseHelpers';
import { getLast4Digits } from '../utils/common';

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

function ParticipationHistoryPage() {
  const [tab, setTab] = useState('participated');
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
          const postRef = doc(db, `${type}s`, postId);
          const postDoc = await getDoc(postRef);
          if (!postDoc.exists()) return null;
          const reviewsRef = collection(db, `${type}s/${postId}/reviews`);
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

  // ===== 리뷰 모달 =====
  const handleOpenReviewModal = async post => {
    if (tab === 'participated') {
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

  // ===== 신고 모달 =====
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

  // ===== 리스트 렌더링 =====
  const renderList = posts =>
    posts.length === 0 ? (
      <div className="history-empty">거래 내역이 없습니다.</div>
    ) : (
      <div>
        {posts.map(post => {
          const deadline = new Date(post.deadline);
          return (
            <div className="history-card" key={post.id + post.type}>
              <div className="history-thumb">
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="" />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#eee' }} />
                )}
              </div>
              <div className="history-body">
                <div className="history-date">
                  {deadline.toISOString().slice(0, 10)}
                  <span className="history-rating-badge">
                    ★ {post.avgRating ? post.avgRating.toFixed(1) : '0.0'}
                  </span>
                </div>
                <div className="history-title-text">{post.title}</div>
                <div className="history-info">모집인원 {post.goalPeople}명</div>
                <div className="history-info">
                  예상가격 {Number(post.totalPrice?.replace(/,/g, '')).toLocaleString()}원
                </div>
                {tab === 'participated' && (
                  <div className="history-btn-row">
                    <button
                      onClick={() => handleOpenReviewModal(post)}
                      className="review-btn"
                    >
                      리뷰쓰기
                    </button>
                    <button
                      onClick={() => handleOpenReportModal(post)}
                      className="report-btn"
                    >
                      🚨 신고하기
                    </button>
                  </div>
                )}
                {tab === 'written' && (
                  <div className="history-btn-row">
                    <button
                      onClick={() => handleOpenReviewModal(post)}
                      className="review-btn"
                    >
                      리뷰쓰기
                    </button>
                    <button
                      onClick={() => handleOpenReportModal(post)}
                      className="report-btn"
                    >
                      🚨 신고하기
                    </button>
                    <button
                      onClick={() => handleOpenEvalModal(post)}
                      className="eval-btn"
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

  // ===== 렌더링 =====
  return (
    <div className="history-root">
      <div className="history-title">거래내역</div>
      <div className="history-tab-bar">
        <button
          className={`history-tab-btn${tab === 'participated' ? ' active' : ''}`}
          onClick={() => setTab('participated')}
        >
          참여한 거래
        </button>
        <button
          className={`history-tab-btn${tab === 'written' ? ' active' : ''}`}
          onClick={() => setTab('written')}
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
        <ReviewModalContent
          tab={tab}
          reviewModal={reviewModal}
          reviewForm={reviewForm}
          reviewTextareaRef={reviewTextareaRef}
          handleReviewTextareaChange={handleReviewTextareaChange}
          handleCloseReviewModal={handleCloseReviewModal}
          handleRatingChange={handleRatingChange}
          handleReviewSubmit={handleReviewSubmit}
          handleSelectReviewParticipant={handleSelectReviewParticipant}
        />
      </Modal>
      <Modal open={reportModal.open} onClose={handleCloseReportModal}>
        <ReportModalContent
          tab={tab}
          reportModal={reportModal}
          reportForm={reportForm}
          reportTextareaRef={reportTextareaRef}
          handleReportTextareaChange={handleReportTextareaChange}
          handleCloseReportModal={handleCloseReportModal}
          handleReportSubmit={handleReportSubmit}
          handleSelectReportParticipant={handleSelectReportParticipant}
        />
      </Modal>
      <Modal open={evalModal.open} onClose={handleCloseEvalModal}>
        {evalModal.open && (
          <EvalModalContent evalModal={evalModal} handleCloseEvalModal={handleCloseEvalModal} />
        )}
      </Modal>
    </div>
  );
}

export default ParticipationHistoryPage;