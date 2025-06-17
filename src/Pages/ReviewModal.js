import React from 'react';

function ReviewModalContent({
  tab,
  reviewModal,
  reviewForm,
  reviewTextareaRef,
  handleReviewTextareaChange,
  handleCloseReviewModal,
  handleRatingChange,
  handleReviewSubmit,
  handleSelectReviewParticipant,
}) {
  function getLast4Digits(studentId) {
    if (!studentId || studentId.length < 4) return '';
    return studentId.slice(-4);
  }

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
          {['timeRating', 'priceRating', 'placeRating'].map((category, idx) => {
            const labels = [
              '거래 시간을 잘 지켰어요',
              '예상 가격과 일치했어요',
              '약속한 장소에서 수령했어요',
            ];
            return (
              <div key={category} style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 12,
                    color: '#333',
                  }}
                >
                  {labels[idx]}
                </div>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingChange(category, rating)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor:
                          reviewForm[category] === rating ? '#fbbf24' : '#f5f5f5',
                        color: reviewForm[category] === rating ? '#fff' : '#999',
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
            );
          })}
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
}

export default ReviewModalContent;