import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import PostForm from '../Components/PostForm';

function GroupbuyPostPage({ goBack }) {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // 👈 여기 추가
  const [title, setTitle] = useState('');
  const [goalPeople, setGoalPeople] = useState('');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [totalPrice, setTotalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const deadline = `${date}T${hour}:${minute}`;

    try {
      await addDoc(collection(db, 'groupbuys'), {
        title,
        goalPeople,
        deadline,
        totalPrice,
        description,
        location,
        imageUrl: '', // Firebase는 비워두고
        localImageUrl: previewUrl || '', // 브라우저에서 만든 임시 URL 저장
        currentPeople: 0,
        createdAt: Timestamp.now()
      });

      goBack(); // 등록 후 목록으로 이동
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
          setPreviewUrl(URL.createObjectURL(file)); // 👈 여기서 임시 URL 생성
        }}
        title={title} setTitle={setTitle}
        goalPeople={goalPeople} setGoalPeople={setGoalPeople}
        date={date} setDate={setDate}
        hour={hour} setHour={setHour}
        minute={minute} setMinute={setMinute}
        totalPrice={totalPrice} setTotalPrice={setTotalPrice}
        description={description} setDescription={setDescription}
        location={location} setLocation={setLocation}
      />
    </div>
  );
}

export default GroupbuyPostPage;
