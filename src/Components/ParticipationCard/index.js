import React from 'react';
import useTransactionStatus from '../../hooks/useTransactionStatus';
import './styles.css';

export default function ParticipationCard({ post, onClick }) {
  const { isOngoing, isClosed, isCompleted, canCancel } = useTransactionStatus(post);
  const isAuthor = post.uid === auth.currentUser?.uid;

  return (
    <div className="participation-card" onClick={onClick}>
      <div className="card-header">
        <h3>{post.title}</h3>
        <span className={`status-badge ${isOngoing ? 'ongoing' : 'closed'}`}>
          {isOngoing ? '진행중' : '종료'}
        </span>
      </div>

      <div className="card-body">
        <p>💳 1인당 금액: {calculatePerPerson(post)}원</p>
        <p>⏰ 마감일: {formatDate(post.deadline)}</p>
        
        {isAuthor && (
          <div className="author-actions">
            <button className="detail-btn">상세 관리</button>
          </div>
        )}

        {!isAuthor && isOngoing && (
          <button 
            className={`action-btn ${canCancel ? 'cancel' : 'disabled'}`}
            onClick={(e) => {
              e.stopPropagation();
              canCancel && handleCancel(post);
            }}
          >
            {canCancel ? '참여 취소' : '취소 불가'}
          </button>
        )}
      </div>
    </div>
  );
}

const calculatePerPerson = (post) => 
  Math.floor(Number(post.totalPrice) / post.goalPeople).toLocaleString();

const formatDate = (timestamp) => 
  new Date(timestamp?.toDate()).toLocaleDateString('ko-KR');
