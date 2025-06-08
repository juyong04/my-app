import React from 'react';

function formatCountdown(deadline) {
  const now = new Date();
  const target = new Date(deadline);
  const diff = target - now;
  if (diff <= 0) return '마감';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  return `D-${days}일 ${hours}시간`;
}

function HomePostList({ title, posts, onSelect }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2>{title}</h2>
      {posts.length === 0 ? (
        <p style={{ color: '#888' }}>표시할 글이 없습니다.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {posts.map((post, idx) => (
            <li key={idx}
              onClick={() => onSelect(post)}
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '14px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                background: '#eee',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt="썸네일"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ fontSize: '11px', color: '#888', padding: '8px' }}>
                    이미지 없음
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{post.title}</div>
                <div style={{ fontSize: '13px', color: '#555' }}>
                  {formatCountdown(post.deadline)} / {post.currentPeople || 0}명 참여중
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HomePage({ groupbuyPosts, groupdeliveryPosts, onSelect }) {
  const now = new Date();

  const mergedPosts = [
    ...groupbuyPosts.map((p) => ({ ...p, type: 'groupbuy' })),
    ...groupdeliveryPosts.map((p) => ({ ...p, type: 'groupdelivery' })),
  ];

  const recentPosts = mergedPosts
    .filter((p) => p.createdAt?.seconds)
    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
    .slice(0, 3);

  const upcomingPosts = mergedPosts
    .filter((p) => new Date(p.deadline) > now)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  const handleSelect = (post) => {
    onSelect(post);
  };

  return (
    <div style={{ padding: '20px' }}>
      <HomePostList title="🆕 방금 올라온 글" posts={recentPosts} onSelect={handleSelect} />
      <HomePostList title="⏰ 마감 임박" posts={upcomingPosts} onSelect={handleSelect} />
    </div>
  );
}

export default HomePage;
