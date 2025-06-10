// DeliveryPostForm.js
import React from 'react';
import './PostForm.css';
import { ImageUpload, DateTimePicker, LocationInput } from './UnifiedPostForms';

function DeliveryPostForm({
  onSubmit,
  image,
  setImage,
  title,
  setTitle,
  minOrderPrice,
  setMinOrderPrice,
  deliveryFee,
  setDeliveryFee,
  date,
  setDate,
  hour,
  setHour,
  minute,
  setMinute,
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
        배달 제목*
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label>
        최소 주문 금액 (원)*
        <input
          type="text"
          value={minOrderPrice}
          onChange={(e) => {
            const onlyNums = e.target.value.replace(/[^0-9]/g, '');
            const formatted = Number(onlyNums).toLocaleString();
            setMinOrderPrice(formatted);
          }}
        />
      </label>

      <label>
        배달비 (원)*
        <input
          type="text"
          value={deliveryFee}
          onChange={(e) => {
            const onlyNums = e.target.value.replace(/[^0-9]/g, '');
            const formatted = Number(onlyNums).toLocaleString();
            setDeliveryFee(formatted);
          }}
        />
      </label>

      <DateTimePicker date={date} setDate={setDate} hour={hour} setHour={setHour} minute={minute} setMinute={setMinute} />

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

export default DeliveryPostForm;
