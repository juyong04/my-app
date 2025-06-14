import React from 'react';
import './GroupdeliveryListPage.css';

function formatDeliveryCountdown(deadline) {
  const now = new Date();
  const target = new Date(deadline);
  const diff = target - now;

  if (diff <= 0) return '모집마감';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;

  return `D-${days}일 ${hours}시간 ${minutes}분`;
}

function GroupdeliveryListPage({ posts, onSelect }) {
  if (!posts || posts.length === 0) {
    return <p className="empty-message">등록된 공동배달 글이 없습니다.</p>;
  }

  return (
    <div className="groupdelivery-list-container">
      <h2>공동배달 목록</h2>
      <ul className="groupdelivery-list">
        {posts.map((post, index) => (
          <li
            key={index}
            onClick={() => onSelect(post)}
            className="groupdelivery-item"
          >
            <div className="item-info">
              <h3>{post.title}</h3>

              

              <div className="price-block">
                <span className="price-label">최소 주문금액</span>
                <div className="price">{post.minOrderPrice} 원</div>
              </div>
              <div className="bottom-row">
                <p className={`deadline ${new Date(post.deadline) < new Date() ? 'closed' : 'open'}`}>
                  {formatDeliveryCountdown(post.deadline)}
                </p>
                <p className="delivery-fee">배달비 {post.deliveryFee}원</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroupdeliveryListPage;
