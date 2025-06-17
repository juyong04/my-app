import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  doc, deleteDoc, updateDoc, getDoc,
  arrayUnion, addDoc, collection, query, where, getDocs,
} from 'firebase/firestore';
import KakaoMapSearch from '../Components/KaKaoMapSearch';
import DeadlinePopup from '../Components/DeadlinePopup';
import PageLayout from '../Layout/PageLayout';
import './GroupdeliveryDetailPage.css';

function GroupdeliveryDetailPage({ post, goBack }) {
  const [deadlinePopup, setDeadlinePopup] = useState({ isOpen: false, meetTime: '', title: '', postId: '', type: 'delivery' });
  const [isParticipant, setIsParticipant] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [menuInfo, setMenuInfo] = useState('');
  const [requirement, setRequirement] = useState('');
  const [price, setPrice] = useState('');
  const [depositor, setDepositor] = useState('');
  const [authorInfo, setAuthorInfo] = useState(null);
  const [participantsInfo, setParticipantsInfo] = useState([]);
  const [showParticipantsInfo, setShowParticipantsInfo] = useState(false);

  const isAuthor = auth.currentUser?.uid === post.uid;
  const isDeadlinePassed = new Date() > new Date(post.deadline);

  const deliveryFeePerPerson = post.deliveryFee
    ? Math.ceil(parseInt(post.deliveryFee.replace(/,/g, '')) / ((post.currentPeople || 0) + 1)).toLocaleString()
    : null;

  const averageRating = authorInfo
    ? ((authorInfo.avgTimeRating + authorInfo.avgPriceRating + authorInfo.avgPlaceRating) / 3).toFixed(1)
    : null;

  useEffect(() => {
    if (!post?.uid) return;

    const fetchInfo = async () => {
      try {
        const userRef = doc(db, 'users', post.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setAuthorInfo(userSnap.data());
      } catch (e) { console.error(e); }

      if (auth.currentUser) {
        const q = query(
          collection(db, 'groupdeliveryParticipants'),
          where('userId', '==', auth.currentUser.uid),
          where('postId', '==', post.id)
        );
        const snap = await getDocs(q);
        setIsParticipant(!snap.empty);
      }
    };

    fetchInfo();
  }, [post]);

  const handleJoin = async () => {
    if (!auth.currentUser) return alert('로그인이 필요합니다.');
    if (!menuInfo || !price || !depositor) return alert('모든 항목을 입력해주세요.');

    const ref = doc(db, 'groupdeliveries', post.id);
    const snap = await getDoc(ref);
    const data = snap.data();
    if (!data || new Date() > new Date(data.deadline)) return alert('마감된 글입니다.');
    if ((data.participants || []).includes(auth.currentUser.uid)) {
      alert('이미 참여한 글입니다.');
      return;
    }

    const numericPrice = price.replace(/,/g, '');

    try {
      await updateDoc(ref, {
        participants: arrayUnion(auth.currentUser.uid),
        currentPeople: (data.currentPeople || 0) + 1,
      });
      await addDoc(collection(db, 'groupdeliveryParticipants'), {
        userId: auth.currentUser.uid,
        postId: post.id,
        menuInfo,
        requirement,
        price: numericPrice,
        depositor,
        joinedAt: new Date(),
      });
      alert('참여 완료!');
      setShowForm(false);
      setMenuInfo(''); setRequirement(''); setPrice(''); setDepositor('');
      setIsParticipant(true);
    } catch (err) {
      console.error(err);
      alert('오류 발생');
    }
  };

  const handleShowParticipantsInfo = async () => {
    try {
      const ref = doc(db, 'groupdeliveries', post.id);
      const snap = await getDoc(ref);
      const data = snap.data();
      if (!data || !data.participants) return;

      const list = await Promise.all(data.participants.map(async (uid) => {
        const userSnap = await getDoc(doc(db, 'users', uid));
        const partSnap = await getDocs(query(
          collection(db, 'groupdeliveryParticipants'),
          where('userId', '==', uid),
          where('postId', '==', post.id)
        ));
        return { ...userSnap.data(), ...partSnap.docs[0]?.data() };
      }));

      setParticipantsInfo(list);
      setShowParticipantsInfo(true);
    } catch (err) {
      alert('정보 불러오기 실패');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'groupdeliveries', post.id));
      alert('삭제되었습니다.');
      goBack();
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <PageLayout title="공동배달 상세">
      <div className="delivery-container">
        {isAuthor && (
          <div className="top-bar">
            <button className="back-btn" onClick={goBack}>← 목록으로</button>
            <button className="delete-btn" onClick={handleDelete}>삭제</button>
          </div>
        )}

        <h2 className="post-title">{post.title}</h2>

        <div className="info-block">
          <div className="info-item"><strong>최소 주문 금액</strong>{post.minOrderPrice}원</div>
          <div className="info-item"><strong>총 배달비</strong>{post.deliveryFee}원</div>
          {deliveryFeePerPerson && (
            <div className="info-item">
              <strong>1인당 예상 배달비</strong>{deliveryFeePerPerson}원
            </div>
          )}
          <div className="info-item"><strong>모집 마감</strong>{post.deadline?.replace('T', ' ')}</div>
          <div
            className="info-item"
            style={{
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'pre-line',
            }}
          >
            <strong>상세 설명</strong><br />
            {post.description}
          </div>
        </div>

        <div className="meeting-map-card">
          <p className="meeting-label">📍 거래 일시</p>
          <p className="meeting-time">{post.meetTime?.replace('T', ' ')}</p>
          <p className="meeting-label">📌 거래 위치</p>
          <p className="meeting-location">{post.location} {post.locationDetail}</p>
          <div className="map-container">
            <KakaoMapSearch location={post.location} />
          </div>
        </div>

        <div className="author-card">
          <div className="author-row">
            <strong>{authorInfo?.displayName || '익명'}</strong>
            {averageRating && (
              <span className="author-rating">⭐ {averageRating}</span>
            )}
          </div>
        </div>

        {isAuthor && isDeadlinePassed && (
          <button onClick={handleShowParticipantsInfo}>👀 참여자 정보 보기</button>
        )}

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>참여 양식</h3>
              <label>메뉴명 및 수량<input placeholder="예) 짜장면 1, 볶음밥 2" value={menuInfo} onChange={(e) => setMenuInfo(e.target.value)} /></label>
              <label>요구사항<input placeholder="예) 짜장면은 곱빼기로 해주세요" value={requirement} onChange={(e) => setRequirement(e.target.value)} /></label>
              <label>주문 금액 
                <input
                placeholder="옵션을 포함하여 정확히 계산해주세요"
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    const formatted = Number(raw).toLocaleString();
                    setPrice(formatted);
                  }}
                />
              </label>
              <label>입금자명<input value={depositor} onChange={(e) => setDepositor(e.target.value)} /></label>
              <p className="warning-text">⚠️ 주문 후 취소는 불가능하니 신중히 입력해주세요.</p>
              <div className="form-actions">
                <button onClick={handleJoin}>제출</button>
                <button onClick={() => setShowForm(false)}>취소</button>
              </div>
            </div>
          </div>
        )}

        {!showForm && !isAuthor && !isDeadlinePassed && !isParticipant && (
          <button className="floating-join-btn" onClick={() => setShowForm(true)}>
            🤝 참여하기
          </button>
        )}

        {!showForm && !isAuthor && isParticipant && (
          <button className="floating-join-btn disabled" disabled>
            이미 참여함
          </button>
        )}

        {!isAuthor && isDeadlinePassed && isParticipant && (
          <button className="floating-join-btn disabled" onClick={() => setDeadlinePopup({ ...deadlinePopup, isOpen: true })}>
            마감됨
          </button>
        )}

        <DeadlinePopup {...deadlinePopup} onClose={() => setDeadlinePopup({ ...deadlinePopup, isOpen: false })} />
      </div>

      {showParticipantsInfo && (
        <div className="participants-modal" onClick={() => setShowParticipantsInfo(false)}>
          <div className="participants-content" onClick={(e) => e.stopPropagation()}>
            <h3>참여자 정보</h3>
            {participantsInfo.map((p, i) => (
              <div key={i} className="participant-card">
                <p><strong>이름:</strong> {p.displayName}</p>
                <p><strong>학번:</strong> {p.studentId}</p>
                <p><strong>메뉴:</strong> {p.menuInfo}</p>
                <p><strong>요구사항:</strong> {p.requirement}</p>
                <p><strong>금액:</strong> {p.price}</p>
                <p><strong>입금명:</strong> {p.depositor}</p>
              </div>
            ))}
            <button onClick={() => setShowParticipantsInfo(false)}>닫기</button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default GroupdeliveryDetailPage;
