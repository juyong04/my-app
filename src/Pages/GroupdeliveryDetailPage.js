// GroupdeliveryDetailPage.js - 수정 버튼 제거됨 & 참여 양식 포함
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import {
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  arrayUnion,
  addDoc,
  collection,
} from 'firebase/firestore';
import KakaoMapSearch from '../Components/KaKaoMapSearch.js';

function GroupdeliveryDetailPage({ post, goBack }) {
  const [showForm, setShowForm] = useState(false);
  const [menu, setMenu] = useState('');
  const [price, setPrice] = useState('');
  const [depositor, setDepositor] = useState('');

  const handleDelete = async () => {
    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'groupdeliveries', post.id));
      alert('삭제되었습니다.');
      goBack();
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  const handleJoin = async () => {
    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!menu || !price || !depositor) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const postRef = doc(db, 'groupdeliveries', post.id);
    const postSnap = await getDoc(postRef);
    const postData = postSnap.data();

    if (!postData) return;

    const now = new Date();
    const deadline = new Date(postData.deadline);

    if (now > deadline) {
      alert('이미 마감된 모집입니다.');
      return;
    }

    const participants = postData.participants || [];
    if (participants.includes(auth.currentUser.uid)) {
      alert('이미 참여한 글입니다.');
      return;
    }

    try {
      await updateDoc(postRef, {
        participants: arrayUnion(auth.currentUser.uid),
        currentPeople: (postData.currentPeople || 0) + 1,
      });

      await addDoc(collection(db, 'groupdeliveryParticipants'), {
        userId: auth.currentUser.uid,
        postId: post.id,
        menu,
        price,
        depositor,
        joinedAt: new Date(),
      });

      alert('참여가 완료되었습니다!');
      setShowForm(false);
      setMenu('');
      setPrice('');
      setDepositor('');
    } catch (err) {
      console.error('참여 실패:', err);
      alert('참여 처리 중 오류가 발생했습니다.');
    }
  };

  const isAuthor = auth.currentUser?.uid === post.uid;

  return (
    <>
      <div style={{ padding: '20px' }}>
        <button onClick={goBack} style={{ marginBottom: '10px' }}>
          ← 목록으로
        </button>
        <h2>{post.title}</h2>

        {post.localImageUrl && (
          <img
            src={post.localImageUrl}
            alt="미리보기"
            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
          />
        )}

        <p><strong>최소 주문 금액:</strong> {post.minOrderPrice}원</p>
        <p><strong>배달비:</strong> {post.deliveryFee}원</p>
        <p><strong>모집 마감일:</strong> {post.deadline?.replace('T', ' ')}</p>
        <p><strong>상세 설명:</strong><br />{post.description}</p>
        <p><strong>거래 일시:</strong> {post.meetTime?.replace('T', ' ')}</p>
        <p><strong>거래 위치:</strong> {post.location} {post.locationDetail}</p>

        <KakaoMapSearch location={post.location} />

        {isAuthor ? (
          <div style={{ marginTop: '20px' }}>
            <button onClick={handleDelete}>🗑 삭제</button>
          </div>
        ) : (
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => setShowForm(true)}>🤝 참여하기</button>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -20%)',
          backgroundColor: '#fff',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          zIndex: 1000,
        }}>
          <h3>참여 양식</h3>
          <div>
            <label>메뉴: <input value={menu} onChange={e => setMenu(e.target.value)} /></label>
          </div>
          <div>
            <label>금액: <input value={price} onChange={e => setPrice(e.target.value)} /></label>
          </div>
          <div>
            <label>입금명: <input value={depositor} onChange={e => setDepositor(e.target.value)} /></label>
          </div>
          <div style={{ marginTop: '10px' }}>
            <button onClick={handleJoin}>제출</button>
            <button onClick={() => setShowForm(false)} style={{ marginLeft: '10px' }}>취소</button>
          </div>
        </div>
      )}
    </>
  );
}

export default GroupdeliveryDetailPage;