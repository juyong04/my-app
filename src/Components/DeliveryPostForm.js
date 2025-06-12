// DeliveryPostForm.js
import React from 'react';
import KakaoMap from './KakaoMap';
import './PostForm.css';

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
  meetTimeDate,
  setMeetTimeDate,
  meetHour,
  setMeetHour,
  meetMinute,
  setMeetMinute
}) {
  return (
    <form onSubmit={onSubmit} className="post-form">
      <label>
        대표 이미지
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      </label>

      <label>
        배달 제목*
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
          required
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
          required
        />
      </label>

      {/* 마감 시각 */}
      <label>
        모집 마감 일시
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <select value={hour} onChange={(e) => setHour(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={String(i).padStart(2, '0')}>
                {String(i).padStart(2, '0')}
              </option>
            ))}
          </select>
          :
          <select value={minute} onChange={(e) => setMinute(e.target.value)}>
            {['00', '15', '30', '45'].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </label>

      <label>
        상세 설명
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      {/* 지도 선택 */}
      <KakaoMap onLocationSelect={(selected) => setLocation(selected)} />

      {/* 선택된 장소 */}
      {location && (
        <p style={{ fontSize: '14px', marginTop: '8px' }}>
          ✅ 선택된 장소: <strong>{location}</strong>
        </p>
      )}

      {/* 상세 위치 입력 */}
      <label>
        상세 위치
        <input value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)} />
      </label>

      {/* 만날 시각 */}
      <label>
        거래 일시
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="date" value={meetTimeDate} onChange={(e) => setMeetTimeDate(e.target.value)} required />
          <select value={meetHour} onChange={(e) => setMeetHour(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={String(i).padStart(2, '0')}>
                {String(i).padStart(2, '0')}
              </option>
            ))}
          </select>
          :
          <select value={meetMinute} onChange={(e) => setMeetMinute(e.target.value)}>
            {['00', '15', '30', '45'].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </label>

      <button type="submit">등록하기</button>
    </form>
  );
}

export default DeliveryPostForm;
