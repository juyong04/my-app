// src/Components/DeliveryPostForm.js
import React, { useState } from 'react';
import './PostForm.css'; // ✅ 동일한 CSS 사용

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
}) {
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={onSubmit} className="post-form">
      <label>
        대표 이미지
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </label>

      {previewUrl && (
        <img
          src={previewUrl}
          alt="미리보기"
          style={{
            width: '100%',
            maxHeight: '300px',
            objectFit: 'cover',
            borderRadius: '8px',
            margin: '10px 0',
          }}
        />
      )}

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

      <label>
        마감 일시*
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <select value={hour} onChange={(e) => setHour(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={String(i).padStart(2, '0')}>
                {String(i).padStart(2, '0')}시
              </option>
            ))}
          </select>
          <select value={minute} onChange={(e) => setMinute(e.target.value)}>
            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
              <option key={m} value={String(m).padStart(2, '0')}>
                {String(m).padStart(2, '0')}분
              </option>
            ))}
          </select>
        </div>
      </label>

      <label>
        상세 설명
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <label>
        거래 위치
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
      </label>

      <button type="submit">등록하기</button>
    </form>
  );
}

export default DeliveryPostForm;
