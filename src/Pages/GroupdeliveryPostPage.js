import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import DeliveryPostForm from '../Components/DeliveryPostForm';

function GroupdeliveryPostPage({ goBack }) {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [minOrderPrice, setMinOrderPrice] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [date, setDate] = useState(''); // ✅ 날짜 입력 추가
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [locationDetail, setLocationDetail] = useState(''); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !hour || !minute || !title) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    const deadline = `${date}T${hour}:${minute}`;

    try {
      await addDoc(collection(db, 'groupdeliveries'), {
        title,
        minOrderPrice,
        deliveryFee,
        deadline,
        description,
        location,
        locationDetail,
        imageUrl: '',
        localImageUrl: previewUrl || '',
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
      <h2>공동배달 글쓰기</h2>
      <DeliveryPostForm
        onSubmit={handleSubmit}
        image={image}
        setImage={(file) => {
          setImage(file);
          setPreviewUrl(URL.createObjectURL(file));
        }}
        title={title}
        setTitle={setTitle}
        minOrderPrice={minOrderPrice}
        setMinOrderPrice={setMinOrderPrice}
        deliveryFee={deliveryFee}
        setDeliveryFee={setDeliveryFee}
        date={date} // ✅ 전달
        setDate={setDate}
        hour={hour}
        setHour={setHour}
        minute={minute}
        setMinute={setMinute}
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

export default GroupdeliveryPostPage;
