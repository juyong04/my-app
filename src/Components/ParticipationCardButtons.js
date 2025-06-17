import React from 'react';

export default function ParticipationCardButtons({
  post,
  tab,
  isClosed,
  isCompleted,
  isParticipated,
  isWriter,
  canCancel,
  hasConfirmedDeposit,
  handleCancel,
  handleDepositConfirm,
  handleOpenReviewModal,
  handleOpenReportModal,
  handleOpenEvalModal,
  deadline
}) {
  return (
    <div>
      {/* 모집 중: 취소 버튼 */}
      {isParticipated && !isClosed && canCancel && (
        <button className="btn btn-cancel" onClick={() => handleCancel(post)}>
          취소
        </button>
      )}

      {/* 모집 마감: 참여자 입금확인 */}
      {isParticipated && isClosed && !isCompleted && (
        <div className="payment-info">
          <div>입금 계좌: {post.bankAccount || '계좌정보 없음'}</div>
          <div>금액: {Number(post.totalPrice?.replace(/,/g, '')).toLocaleString()}원</div>
          <div>
            거래 시간: {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div>장소: {post.place || '장소 정보 없음'}</div>
          {!hasConfirmedDeposit ? (
            <button className="btn btn-deposit" onClick={() => handleDepositConfirm(post)}>
              입금 확인
            </button>
          ) : (
            <span className="deposit-confirmed">✔️ 입금 완료</span>
          )}
        </div>
      )}

      {/* 모집 마감: 작성자 안내 */}
      {isWriter && isClosed && !isCompleted && (
        <div className="transaction-completed">
          참여 모집이 완료되었습니다.
        </div>
      )}

      {/* 거래 완료 안내 */}
      {isClosed && isCompleted && (
        <div className="transaction-completed">
          거래가 완료되었습니다.
        </div>
      )}

      {/* 리뷰/신고/평가확인 버튼 (거래 완료 후) */}
      {isClosed && isCompleted && (
        <div className="action-buttons">
          <button onClick={() => handleOpenReviewModal(post)} className="btn btn-review">
            리뷰쓰기
          </button>
          <button onClick={() => handleOpenReportModal(post)} className="btn btn-report">
            🚨 신고하기
          </button>
          {isWriter && (
            <button onClick={() => handleOpenEvalModal(post)} className="btn btn-eval">
              평가확인
            </button>
          )}
        </div>
      )}
    </div>
  );
}
