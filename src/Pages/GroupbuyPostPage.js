// GroupbuyPostPage.js
import React, { useState } from 'react';
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import PostForm from '../Components/PostForm';

function GroupbuyPostPage({ goBack }) {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [goalPeople, setGoalPeople] = useState('');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [meetTimeDate, setMeetTimeDate] = useState('');
  const [meetHour, setMeetHour] = useState('00');
  const [meetMinute, setMeetMinute] = useState('00');
  const [totalPrice, setTotalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [locationDetail, setLocationDetail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const deadline = `${date}T${hour}:${minute}`;
    const meetTime = `${meetTimeDate}T${meetHour}:${meetMinute}`;

    try {
      const uid = auth.currentUser.uid;

      // 🔸 사용자 닉네임 가져오기
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const authorName = userData?.displayName || '익명';

      // 🔸 게시글 저장
      await addDoc(collection(db, 'groupbuys'), {
        title,
        goalPeople,
        deadline,
        meetTime,
        totalPrice,
        description,
        location,
        locationDetail,
        imageUrl: '', // 이미지 업로드 미적용 상태
        localImageUrl: previewUrl || '',
        currentPeople: 1, // ✅ 작성자 포함
        createdAt: Timestamp.now(),
        uid,
        authorName, // ✅ 닉네임 저장
        participants: [uid], // ✅ 작성자 자동 참여
      });

      alert('글이 등록되었습니다!');
      goBack();
    } catch (err) {
      console.error('글 등록 실패:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>공동구매 글쓰기</h2>
      <PostForm
        onSubmit={handleSubmit}
        image={image}
        setImage={(file) => {
          setImage(file);
          setPreviewUrl(URL.createObjectURL(file));
        }}
        title={title}
        setTitle={setTitle}
        goalPeople={goalPeople}
        setGoalPeople={setGoalPeople}
        date={date}
        setDate={setDate}
        hour={hour}
        setHour={setHour}
        minute={minute}
        setMinute={setMinute}
        meetTimeDate={meetTimeDate}
        setMeetTimeDate={setMeetTimeDate}
        meetHour={meetHour}
        setMeetHour={setMeetHour}
        meetMinute={meetMinute}
        setMeetMinute={setMeetMinute}
        totalPrice={totalPrice}
        setTotalPrice={setTotalPrice}
        description={description}
        setDescription={setDescription}
        location={location}
        setLocation={setLocation}
        locationDetail={locationDetail}
        setLocationDetail={setLocationDetail}
      />
    </div>
  );
}

export default GroupbuyPostPage;
