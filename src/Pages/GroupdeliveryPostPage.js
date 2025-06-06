// GroupdeliveryPostPage.js — 공동배달 글쓰기 폼 페이지
import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import DeliveryPostForm from '../Components/DeliveryPostForm';

function GroupdeliveryPostPage({ goBack }) {
  const [title, setTitle] = useState('');
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [minOrderPrice, setMinOrderPrice] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (file) => {
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadImageAndGetURL = async (file) => {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileRef = ref(storage, `groupdelivery-images/${Date.now()}_${safeName}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    now.setHours(parseInt(hour));
    now.setMinutes(parseInt(minute));
    now.setSeconds(0);

    const deadline = now.toISOString();
    let imageUrl = '';

    if (image) {
      imageUrl = await uploadImageAndGetURL(image);
    }

    try {
      await addDoc(collection(db, 'groupdeliveries'), {
        title,
        deadline,
        minOrderPrice,
        deliveryFee,
        description,
        location,
        imageUrl,
        createdAt: Timestamp.now(),
      });

      console.log('공동배달 글 등록 성공');
      if (goBack) goBack();
    } catch (error) {
      console.error('공동배달 글 등록 실패:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>공동배달 글쓰기</h2>
      <DeliveryPostForm
        onSubmit={handleSubmit}
        image={image}
        setImage={handleImageChange}
        previewUrl={previewUrl}
        title={title}
        setTitle={setTitle}
        hour={hour}
        setHour={setHour}
        minute={minute}
        setMinute={setMinute}
        minOrderPrice={minOrderPrice}
        setMinOrderPrice={setMinOrderPrice}
        deliveryFee={deliveryFee}
        setDeliveryFee={setDeliveryFee}
        description={description}
        setDescription={setDescription}
        location={location}
        setLocation={setLocation}
      />
    </div>
  );
}

export default GroupdeliveryPostPage;
