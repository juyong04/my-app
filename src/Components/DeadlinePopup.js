import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './DeadlinePopup.css';

function DeadlinePopup({ isOpen, onClose, meetTime, title, postId, type, onNavigate = () => {}, isHost = false }) {
  const [authorInfo, setAuthorInfo] = useState({
    accountNumber: '',
    displayName: '',
    studentId: ''
  });

  useEffect(() => {
    const fetchAuthorInfo = async () => {
      try {
        const postRef = doc(db, type === 'buy' ? 'groupbuys' : 'groupdeliveries', postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          const authorRef = doc(db, 'users', postSnap.data().uid);
          const authorSnap = await getDoc(authorRef);
          if (authorSnap.exists()) {
            const data = authorSnap.data();
            setAuthorInfo({
              accountNumber: data.accountNumber || '계좌번호가 등록되지 않았습니다.',
              displayName: data.displayName || '',
              studentId: data.studentId || ''
            });
          }
        }
      } catch (error) {
        console.error('작성자 정보 조회 실패:', error);
      }
    };

    if (isOpen && postId) {
      fetchAuthorInfo();
    }
  }, [isOpen, postId, type]);

  const maskName = (name) => {
    if (!name || name.length < 2) return name;
    return name.charAt(0) + '*' + name.slice(2);
  };

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
        
        {isHost ? (
          <>
            <p className="popup-message">작성하신 모집이 마감되었습니다!</p>
            <p className="popup-meet-time">만남 시간: {meetTime}</p>
          </>
        ) : (
          <>
            <p className="popup-message">참여하신 모집이 마감되었습니다!</p>
            <p className="popup-meet-time">만남 시간: {meetTime}</p>
            <p className="popup-author-info">작성자: {maskName(authorInfo.displayName)} ({authorInfo.studentId})</p>
            <p className="popup-account-number">입금 계좌번호: {authorInfo.accountNumber}</p>
          </>
        )}

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