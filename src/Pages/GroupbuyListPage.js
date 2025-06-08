import React from 'react';

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
    return <p style={{ padding: '20px' }}>등록된 공동구매 글이 없습니다.</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>공동구매 목록</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map((post, index) => {
          const total = Number(post.totalPrice?.replace(/,/g, '') || 0);
          const people = Number(post.goalPeople) || 1;
          const perPersonPrice = Math.floor(total / people).toLocaleString();

          return (
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt="상품 이미지"
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
                      color: '#888',
                      padding: '8px',
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
                  모집인원 {post.currentPeople || 0}/{post.goalPeople}
                </p>
                <p
                  style={{
                    color: new Date(post.deadline) < new Date() ? 'gray' : 'red',
                    fontSize: '13px',
                  }}
                >
                  {formatCountdown(post.deadline)}
                </p>
              </div>

              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '15px',
                  whiteSpace: 'nowrap',
                }}
              >
                {perPersonPrice} 원
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default GroupbuyListPage;
