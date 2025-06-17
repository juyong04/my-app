import React from 'react';
import { getLast4Digits } from '../utils/common';

export default function ReviewModalContent({
  tab,
  reviewModal,
  reviewForm,
  reviewTextareaRef,
  handleReviewTextareaChange,
  handleCloseReviewModal,
  handleRatingChange,
  handleReviewSubmit,
  handleSelectReviewParticipant
}) {
  // 참여자 선택 모드 (내가 작성한 글인 경우)
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
              transition: 'background 0.2s'
            }}
            onClick={() => handleSelectReviewParticipant(participant)}
          >
            <div style={{ fontWeight: 500 }}>
              {participant.displayName}
              {participant.studentId && (
                <span style={{ marginLeft: 8, color: '#666' }}>
                  ({getLast4Digits(participant.studentId)})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 리뷰 작성 모드
  if ((tab === 'written' && reviewModal.selectedParticipant) || 
      (tab === 'participated' && reviewModal.selectedParticipant)) {
    const target = reviewModal.selectedParticipant;
    
    return (
      <div>
        {/* 헤더 영역 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fff'
        }}>
          <button
            onClick={handleCloseReviewModal}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
              marginRight: 12,
              color: '#333',
              padding: 0
            }}
            aria-label="뒤로가기"
          >
            ←
          </button>
          <div style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#333'
          }}>
            {tab === 'written' ? '참여자 평가하기' : '판매자 평가하기'}
          </div>
        </div>

        {/* 평가 대상 정보 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f3f6ff',
          borderRadius: 12,
          padding: 12,
          margin: 20
        }}>
          <div style={{
            fontWeight: 600,
            fontSize: 14,
            color: '#1976d2'
          }}>
            {target.displayName}
            {target.studentId && ` (${getLast4Digits(target.studentId)})`}
          </div>
        </div>

        {/* 평가 폼 */}
        <form onSubmit={handleReviewSubmit} style={{ padding: '0 20px 20px' }}>
          {/* 시간 준수 평가 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
              color: '#333'
            }}>
              거래 시간을 잘 지켰어요
            </div>
            <div style={{ 
              display: 'flex', 
              gap: 16, 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
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
                    backgroundColor: reviewForm.timeRating === rating 
                      ? '#fbbf24' 
                      : '#f5f5f5',
                    color: reviewForm.timeRating === rating 
                      ? '#fff' 
                      : '#999',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          {/* 가격 평가 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
              color: '#333'
            }}>
              예상 가격과 일치했어요
            </div>
            <div style={{ 
              display: 'flex', 
              gap: 16, 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
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
                    backgroundColor: reviewForm.priceRating === rating 
                      ? '#fbbf24' 
                      : '#f5f5f5',
                    color: reviewForm.priceRating === rating 
                      ? '#fff' 
                      : '#999',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          {/* 장소 평가 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
              color: '#333'
            }}>
              약속한 장소에서 수령했어요
            </div>
            <div style={{ 
              display: 'flex', 
              gap: 16, 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
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
                    backgroundColor: reviewForm.placeRating === rating 
                      ? '#fbbf24' 
                      : '#f5f5f5',
                    color: reviewForm.placeRating === rating 
                      ? '#fff' 
                      : '#999',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          {/* 코멘트 입력 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
              color: '#333'
            }}>
              기타 의견 (선택)
            </div>
            <textarea
              ref={reviewTextareaRef}
              value={reviewForm.comment}
              onChange={handleReviewTextareaChange}
              placeholder="거래에 대한 추가 의견을 자유롭게 남겨주세요"
              style={{
                width: '100%',
                minHeight: 100,
                borderRadius: 8,
                border: '1px solid #e0e0e0',
                padding: 12,
                fontSize: 14,
                lineHeight: 1.5,
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '14px 0',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={e => e.target.style.opacity = 0.8}
            onMouseOut={e => e.target.style.opacity = 1}
          >
            평가 완료
          </button>
        </form>
      </div>
    );
  }

  return null;
}