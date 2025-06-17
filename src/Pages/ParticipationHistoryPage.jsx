import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import '../Pages/ParticipationHistoryPage.css';

import Modal from '../Components/Modal';
import ReviewModalContent from '../Components/ReviewModal';
import ReportModalContent from '../Components/ReportModal';
import EvalModalContent from '../Components/EvalModal';

import usePreserveCursorTextarea from '../hooks/usePreserveCursorTextarea';
import { hasAlreadyReviewed, hasAlreadyReported, fetchParticipantsWithUserInfo } from '../utils/firebaseHelpers';
import { getLast4Digits } from '../utils/common';

import { getInitialReviewForm, getInitialReviewModal, getInitialReportForm, getInitialReportModal, getInitialEvalModal, calculateAverage, getStatus } from '../utils/participationHelpers';

function ParticipationHistoryPage() {
  const [tab, setTab] = useState('participated');
  const [participatedPosts, setParticipatedPosts] = useState([]);
  const [writtenPosts, setWrittenPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [depositConfirmed, setDepositConfirmed] = useState({});

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

  // 데이터 fetch useEffect 등은 기존과 동일
  useEffect(() => {
    // ...fetchParticipationPosts (참여한 거래)
  }, []);
  useEffect(() => {
    // ...fetchWrittenPosts (내가 쓴 글)
  }, []);

  // 아래 핸들러들은 기존 ParticipationHistoryPage.js에서 그대로 복사
  // handleCancel, handleDepositConfirm, handleOpenEvalModal, handleCloseEvalModal, handleOpenReviewModal, handleSelectReviewParticipant, handleCloseReviewModal, handleRatingChange, handleReviewSubmit, handleOpenReportModal, handleSelectReportParticipant, handleCloseReportModal, handleReportSubmit

  // 거래 카드 렌더링 함수
  const renderList = posts =>
    posts.length === 0 ? (
      <div className="history-empty">거래 내역이 없습니다.</div>
    ) : (
      <div>
        {posts.map(post => {
          const deadline = new Date(post.deadline);
          const { canCancel, isClosed, isCompleted } = getStatus(post);
          const isParticipated = tab === 'participated';
          const hasConfirmedDeposit = depositConfirmed[post.id];
          return (
            <div className="history-card" key={post.id + post.type}>
              {/* 카드 내부 UI는 그대로, 버튼/안내 등은 props/핸들러로 분리 */}
              {/* ... */}
              <div className="history-btn-row">
                <ParticipationCardButtons
                  post={post}
                  tab={tab}
                  isClosed={isClosed}
                  isCompleted={isCompleted}
                  isParticipated={isParticipated}
                  canCancel={canCancel}
                  hasConfirmedDeposit={hasConfirmedDeposit}
                  handleCancel={handleCancel}
                  handleDepositConfirm={handleDepositConfirm}
                  handleOpenReviewModal={handleOpenReviewModal}
                  handleOpenReportModal={handleOpenReportModal}
                  handleOpenEvalModal={handleOpenEvalModal}
                />
              </div>
            </div>
          );
        })}
      </div>
    );

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
