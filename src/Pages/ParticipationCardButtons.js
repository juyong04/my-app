import React from 'react';
import PropTypes from 'prop-types'; // 타입 검증 추가

function ParticipationCardButtons({
  post,
  tab,
  isClosed,
  isCompleted,
  isParticipated,
  canCancel,
  hasConfirmedDeposit,
  handleCancel,
  handleDepositConfirm,
  handleOpenReviewModal,
  handleOpenReportModal,
  handleOpenEvalModal,
  deadline // ✅ Date 객체로 전달받아야 함
}) {
  // deadline이 유효한지 확인 (Firestore Timestamp → Date 변환 필수)
  const safeDeadline = deadline instanceof Date ? deadline : new Date(deadline);

  return (
    <>
      {/* 참여자 취소 버튼 (모집 마감 24시간 전까지) */}
      {isParticipated && !isClosed && canCancel && (
        <button 
          className="btn btn-cancel" 
          onClick={(e) => {
            e.stopPropagation(); // 상위 요소 클릭 이벤트 방지
            handleCancel(post);
          }}
        >
          취소
        </button>
      )}

      {/* 입금 안내 및 입금확인 버튼 (모집 마감 후, 거래 완료 전) */}
      {isParticipated && isClosed && !isCompleted && (
        <div className="payment-info">
          <div>입금 계좌: {post.bankAccount || '계좌정보 없음'}</div>
          <div>금액: {Number(post.totalPrice?.replace(/,/g, '')).toLocaleString()}원</div>
          <div>
            거래 시간: {safeDeadline.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          <div>장소: {post.place || '장소 정보 없음'}</div>
          {!hasConfirmedDeposit ? (
            <button 
              className="btn btn-deposit" 
              onClick={(e) => {
                e.stopPropagation();
                handleDepositConfirm(post);
              }}
            >
              입금 확인
            </button>
          ) : (
            <span className="deposit-confirmed">✔️ 입금 완료</span>
          )}
        </div>
      )}

      {/* 작성자 안내 (모집 마감 시) */}
      {tab === 'written' && isClosed && !isCompleted && (
        <div className="author-notice">
          참여 모집이 완료되었습니다.
        </div>
      )}

      {/* 거래 완료 안내 */}
      {(isClosed && isCompleted) && (
        <div className="transaction-completed">
          {isParticipated ? '거래가 완료되었습니다.' : '거래가 종료되었습니다.'}
        </div>
      )}

      {/* 액션 버튼 그룹 */}
      <div className="button-group">
        {/* 참여자: 거래 완료 후 리뷰/신고 */}
        {isParticipated && isClosed && isCompleted && (
          <>
            <button 
              className="btn btn-review" 
              onClick={(e) => {
                e.stopPropagation();
                handleOpenReviewModal(post);
              }}
            >
              리뷰쓰기
            </button>
            <button 
              className="btn btn-report" 
              onClick={(e) => {
                e.stopPropagation();
                handleOpenReportModal(post);
              }}
            >
              🚨 신고하기
            </button>
          </>
        )}

        {/* 작성자: 항상 리뷰/신고/평가확인 가능 */}
        {tab === 'written' && (
          <>
            <button 
              className="btn btn-review" 
              onClick={(e) => {
                e.stopPropagation();
                handleOpenReviewModal(post);
              }}
            >
              리뷰쓰기
            </button>
            <button 
              className="btn btn-report" 
              onClick={(e) => {
                e.stopPropagation();
                handleOpenReportModal(post);
              }}
            >
              🚨 신고하기
            </button>
            <button 
              className="btn btn-eval" 
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEvalModal(post);
              }}
            >
              평가확인
            </button>
          </>
        )}
      </div>
    </>
  );
}

// PropTypes 검증 추가
ParticipationCardButtons.propTypes = {
  post: PropTypes.object.isRequired,
  tab: PropTypes.oneOf(['participated', 'written']).isRequired,
  isClosed: PropTypes.bool.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  isParticipated: PropTypes.bool.isRequired,
  canCancel: PropTypes.bool.isRequired,
  hasConfirmedDeposit: PropTypes.bool.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleDepositConfirm: PropTypes.func.isRequired,
  handleOpenReviewModal: PropTypes.func.isRequired,
  handleOpenReportModal: PropTypes.func.isRequired,
  handleOpenEvalModal: PropTypes.func.isRequired,
  deadline: PropTypes.instanceOf(Date).isRequired // ✅ Date 객체 강제
};

export default ParticipationCardButtons;
