import React from 'react';
import './styles.css';

export default function TransactionDetailModal({ 
  post, 
  onClose,
  onDepositConfirm 
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
        <h2>🔍 거래 상세 정보</h2>
        
        <div className="info-section">
          <label>입금 계좌</label>
          <p>{post.bankAccount || '등록된 계좌 없음'}</p>
        </div>

        <div className="info-section">
          <label>거래 시간</label>
          <p>{new Date(post.meetTime).toLocaleString('ko-KR')}</p>
        </div>

        <div className="info-section">
          <label>거래 장소</label>
          <p>{post.location} {post.locationDetail}</p>
        </div>

        <button 
          className="confirm-btn"
          onClick={() => {
            onDepositConfirm(post);
            onClose();
          }}
        >
          입금 완료 확인
        </button>
      </div>
    </div>
  );
}
