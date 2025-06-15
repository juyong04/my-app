import React from 'react';
import PageLayout from '../Layout/PageLayout';
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
    return <PageLayout><p className="empty-message">등록된 공동배달 글이 없습니다.</p></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="groupdelivery-list-container">
        <h2><br /></h2>
        <ul className="groupdelivery-list">
          {posts.map((post, index) => {
            const deliveryFee = parseInt(post.deliveryFee?.replace(/,/g, '') || '0');
            const currentPeople = (post.currentPeople || 0) + 1;
            const perPersonFee = Math.ceil(deliveryFee / currentPeople).toLocaleString();

            return (
              <li
                key={index}
                onClick={() => onSelect({ ...post, type: 'groupdelivery' })}
                className="groupdelivery-item"
              >
                <div className="item-info">
                  <div className="card-title-row">
                    <h3>{post.title}</h3>
                  </div>

                  <div className="meta-second-row">
                    <div></div>
                    <p className="min-order">
                      최소 주문금액 <strong>{post.minOrderPrice}원</strong>
                    </p>
                  </div>

                  <div className="meta-third-row">
                    <p className={`deadline ${new Date(post.deadline) < new Date() ? 'closed' : 'open'}`}>
                      {formatDeliveryCountdown(post.deadline)}
                    </p>
                    <p className="per-fee">
                      예상 배달비 <strong>{perPersonFee}원</strong>
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </PageLayout>
  );
}

export default GroupdeliveryListPage;
