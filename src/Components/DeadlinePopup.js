import React from 'react';
import './DeadlinePopup.css';

function DeadlinePopup({ isOpen, onClose, meetTime, title, postId, type, onNavigate = () => {} }) {
  if (!isOpen) return null;

  const handleNavigate = () => {
    if (typeof onNavigate === 'function') {
      onNavigate(type, postId);
    }
    onClose();
  };

  return (
    <div className="deadline-popup-overlay" onClick={onClose}>
      <div className="deadline-popup-content" onClick={e => e.stopPropagation()}>
        <h3>마감 알림</h3>
        <p className="popup-title">{title}</p>
        <p className="popup-message">모집이 마감되었습니다!</p>
        <p className="popup-meet-time">거래 일시: {meetTime}</p>
        <div className="popup-buttons">
          <button className="popup-navigate-button" onClick={handleNavigate}>
            상세 페이지로 이동
          </button>
          <button className="popup-close-button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeadlinePopup;