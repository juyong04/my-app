import React from 'react';
import './HomePage.css';

function formatCountdown(deadline) {
  const now = new Date();
  const target = new Date(deadline);
  const diff = target - now;
  if (diff <= 0 || isNaN(diff)) return '마감';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  return `D-${days}일 ${hours}시간`;
}

function HomePostList({ title, posts, onSelect }) {
  return (
    <div className="post-section">
      <h2>{title}</h2>
      {posts.length === 0 ? (
        <p className="no-posts">표시할 글이 없습니다.</p>
      ) : (
        <div className="horizontal-scroll-container">
          {posts.map((post, idx) => (
            <div key={idx} className="scroll-card" onClick={() => onSelect(post)}>
              <div className="card-title">{post.title}</div>
              <div className="card-info">
                <span className="deadline">{formatCountdown(post.deadline)}</span>
                <br />
                {post.currentPeople || 0}명 참여중
              </div>
            </div>
          ))}
        </div>
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
    .slice(0, 10); // ← 최대 10개 보기 좋게

  const upcomingPosts = mergedPosts
    .filter((p) => new Date(p.deadline) > now)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 10);

  const handleSelect = (post) => {
    onSelect(post);
  };

  return (
    <div className="home-container">
      <HomePostList title="🆕 방금 올라온 글" posts={recentPosts} onSelect={handleSelect} />
      <HomePostList title="⏰ 마감 임박" posts={upcomingPosts} onSelect={handleSelect} />
    </div>
  );
}

export default HomePage;
