// PostForm.js
import React from 'react';
import './PostForm.css';
import { ImageUpload, DateTimePicker, LocationInput } from './UnifiedPostForms';

function PostForm({
  onSubmit,
  image,
  setImage,
  title,
  setTitle,
  goalPeople,
  setGoalPeople,
  date,
  setDate,
  hour,
  setHour,
  minute,
  setMinute,
  totalPrice,
  setTotalPrice,
  description,
  setDescription,
  location,
  setLocation,
  locationDetail,
  setLocationDetail,
}) {
  return (
    <form onSubmit={onSubmit} className="post-form">
      <ImageUpload image={image} setImage={setImage} />

      <label>
        상품명*
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label>
        목표 모집 인원*
        <input type="number" value={goalPeople} onChange={(e) => setGoalPeople(e.target.value)} />
      </label>

      <DateTimePicker date={date} setDate={setDate} hour={hour} setHour={setHour} minute={minute} setMinute={setMinute} />

      <label>
        전체 상품 금액 (원)*
        <input
          type="text"
          value={totalPrice}
          onChange={(e) => {
            const onlyNums = e.target.value.replace(/[^0-9]/g, '');
            const formatted = Number(onlyNums).toLocaleString();
            setTotalPrice(formatted);
          }}
        />
      </label>

      <label>
        상세 설명
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <LocationInput
        location={location}
        setLocation={setLocation}
        locationDetail={locationDetail}
        setLocationDetail={setLocationDetail}
        
      />

      <button type="submit">등록하기</button>
    </form>
  );
}

export default PostForm;
