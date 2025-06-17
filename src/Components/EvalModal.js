import React from 'react';

function EvalModalContent({ evalModal, handleCloseEvalModal }) {
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
}

export default EvalModalContent;