import React from 'react';
import './GroupbuyListPage.css';

function formatCountdown(deadline) {
  const now = new Date();
  const target = new Date(deadline);
  const diff = target - now;

  if (diff <= 0) return '모집마감';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;

  return `D-${days}일 ${hours}시간 ${minutes}분`;
}

function GroupbuyListPage({ posts, onSelect }) {
  if (!posts || posts.length === 0) {
    return <p className="empty-message">등록된 공동구매 글이 없습니다.</p>;
  }

  return (
    <div className="groupbuy-list-container">
      <h2>공동구매 목록</h2>
      <ul className="groupbuy-list">
        {posts.map((post, index) => {
          const total = Number(post.totalPrice?.replace(/,/g, '') || 0);
          const people = Number(post.goalPeople) || 1;
          const perPersonPrice = Math.floor(total / people).toLocaleString();

          return (
            <li
              key={index}
              onClick={() => onSelect(post)}
              className="groupbuy-item"
            >
              <div className="item-info">
                <h3>{post.title}</h3>
                <p className="people-count">
                  모집인원 {post.currentPeople || 0}/{post.goalPeople}
                </p>
                <div className="bottom-row">
                  <p
                    className={`deadline ${new Date(post.deadline) < new Date() ? 'closed' : 'open'}`}
                  >
                    {formatCountdown(post.deadline)}
                  </p>
                  <div className="price-block">
                    <span className="price-label">1인당 금액</span>
                    <div className="price">{perPersonPrice} 원</div>
                  </div>
                </div>

              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default GroupbuyListPage;
