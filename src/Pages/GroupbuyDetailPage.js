import React from 'react';

function GroupbuyDetailPage({ post, goBack }) {
  const perPersonPrice = Math.floor(Number(post.totalPrice.replace(/,/g, '')) / Number(post.goalPeople)).toLocaleString();

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={goBack} style={{ marginBottom: '10px' }}>← 목록으로</button>
      <h2>{post.title}</h2>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="상품 이미지"
          style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
        />
      )}

      <p><strong>목표 인원:</strong> {post.goalPeople}명</p>
      <p><strong>마감일:</strong> {post.deadline.replace('T', ' ')}</p>
      <p><strong>총 금액:</strong> {post.totalPrice} 원</p>
      <p><strong>1인당 금액:</strong> {perPersonPrice} 원</p>
      <p><strong>거래 위치:</strong> {post.location}</p>
      <p><strong>설명:</strong><br />{post.description}</p>
    </div>
  );
}

export default GroupbuyDetailPage;
