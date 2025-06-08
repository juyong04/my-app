import React from 'react';
import { auth, db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';

function GroupbuyDetailPage({ post, goBack }) {
  const perPersonPrice = Math.floor(Number(post.totalPrice.replace(/,/g, '')) / Number(post.goalPeople)).toLocaleString();

  const handleEdit = () => {
    alert('✏️ 수정 기능은 아직 준비 중입니다!');
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'groupbuys', post.id));
      alert('삭제되었습니다.');
      goBack();
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

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

      {auth.currentUser?.uid === post.uid && (
        <div style={{ marginTop: '20px' }}>
          <button onClick={handleEdit} style={{ marginRight: '8px' }}>✏️ 수정</button>
          <button onClick={handleDelete}>🗑 삭제</button>
        </div>
      )}
    </div>
  );
}

export default GroupbuyDetailPage;
