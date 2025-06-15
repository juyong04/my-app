import React from 'react';
import './HomePage.css';
import PageLayout from '../Layout/PageLayout';

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
      <h2 className="section-title">{title}</h2>
      {posts.length === 0 ? (
        <p className="no-posts">표시할 글이 없습니다.</p>
      ) : (
        <div className="horizontal-scroll-container">
          {posts.map((post, idx) => (
            <div key={idx} className="scroll-card" onClick={() => onSelect(post)}>
              {/* 1. 딱지 */}
              <div className={`type-badge ${post.type === 'groupbuy' ? 'buy' : 'delivery'}`}>
                {post.type === 'groupbuy' ? '공동구매' : '공동배달'}
              </div>

              {/* 2. 제목 */}
              <div className="card-title">{post.title}</div>

              {/* 3. 여백 */}
              <div className="spacer" />

              {/* 4. 가격 정보 */}
              <div className="price-info">
                {post.type === 'groupbuy' ? (
                  <>
                    1인당<br />
                    <span className="price-value">{post.perPersonPrice || '-'}</span>원
                  </>
                ) : (
                  <>
                    예상 배달비<br />
                    <span className="price-value">{post.deliveryFee || '-'}</span>원
                  </>
                )}
              </div>

              {/* 5. 참여 인원 */}
              <div className="participant-info">{post.currentPeople || 0}명 참여중</div>

              {/* 6. 마감 정보 */}
              <div className="countdown">{formatCountdown(post.deadline)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HomePage({ groupbuyPosts, groupdeliveryPosts, onSelect }) {
  const now = new Date();

  const processedGroupbuyPosts = groupbuyPosts.map((p) => {
    const price = Number(p.totalPrice?.replace(/,/g, '')) || 0;
    const people = Number(p.goalPeople) || 1;
    return {
      ...p,
      type: 'groupbuy',
      perPersonPrice: Math.floor(price / people).toLocaleString(),
    };
  });

  const processedGroupdeliveryPosts = groupdeliveryPosts.map((p) => ({
    ...p,
    type: 'groupdelivery',
  }));

  const mergedPosts = [...processedGroupbuyPosts, ...processedGroupdeliveryPosts];

  const recentPosts = mergedPosts
    .filter((p) => p.createdAt?.seconds)
    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
    .slice(0, 5);

  const upcomingPosts = mergedPosts
    .filter((p) => new Date(p.deadline) > now)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return (
    <PageLayout>
      <div className="home-container">
        <HomePostList title="🆕 방금 올라온 글" posts={recentPosts} onSelect={onSelect} />
        <HomePostList title="⏰ 마감 임박" posts={upcomingPosts} onSelect={onSelect} />
      </div>
    </PageLayout>
  );
}

export default HomePage;
