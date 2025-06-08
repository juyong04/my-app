import React from 'react';

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
    return <p style={{ padding: '20px' }}>등록된 공동배달 글이 없습니다.</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>공동배달 목록</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map((post, index) => (
          <li
            key={index}
            onClick={() => onSelect(post)}
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px',
              borderBottom: '1px solid #ddd',
              paddingBottom: '12px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                background: '#eee',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt="썸네일"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: '12px',
                    padding: '8px',
                    color: '#888',
                    textAlign: 'center',
                  }}
                >
                  이미지 없음
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0 }}>{post.title}</h3>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                최소 주문금액: {post.minOrderPrice}원 / 배달비: {post.deliveryFee}원
              </p>
              <p style={{ fontSize: '13px', color: 'red' }}>
                {formatDeliveryCountdown(post.deadline)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroupdeliveryListPage;
