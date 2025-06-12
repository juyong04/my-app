// GroupbuyPostPage.js
import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
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
      await addDoc(collection(db, 'groupbuys'), {
        title,
        goalPeople,
        deadline,
        meetTime, // ✅ 추가됨
        totalPrice,
        description,
        location,
        locationDetail,
        imageUrl: '', // 추후 firebase storage 적용 가능
        localImageUrl: previewUrl || '',
        currentPeople: 0,
        createdAt: Timestamp.now(),
        uid: auth.currentUser.uid,
      });

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
        meetTimeDate={meetTimeDate}       // ✅ 추가
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
