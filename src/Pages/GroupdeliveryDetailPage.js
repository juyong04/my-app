import React from 'react';

function GroupdeliveryDetailPage({ post, goBack }) {
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={goBack}>← 목록으로</button>
      <h2>{post.title}</h2>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="대표 이미지" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }} />
      )}
      <p><strong>모집 마감:</strong> {new Date(post.deadline).toLocaleTimeString()}</p>
      <p><strong>최소 주문 금액:</strong> {post.minOrderPrice}원</p>
      <p><strong>배달비:</strong> {post.deliveryFee}원</p>
      <p><strong>거래 위치:</strong> {post.location}</p>
      <p><strong>상세 설명:</strong></p>
      <p>{post.description}</p>
    </div>
  );
}

export default GroupdeliveryDetailPage;
