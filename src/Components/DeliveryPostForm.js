import React, { useState } from 'react';
import KakaoMap from './KakaoMap'; // 반드시 import 필요
import './DeliveryPostForm.css';

function DeliveryPostForm({
  onSubmit,
  image,
  setImage,
  previewUrl,
  title,
  setTitle,
  hour,
  setHour,
  minute,
  setMinute,
  minOrderPrice,
  setMinOrderPrice,
  deliveryFee,
  setDeliveryFee,
  description,
  setDescription,
  location,
  setLocation,
}) {
  const [showMap, setShowMap] = useState(false); // 👈 지도 모달 제어용

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleLocationSelect = (selectedAddress) => {
    setLocation(selectedAddress);
    setShowMap(false);
  };

  return (
    <>
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
          가게명*
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label>
          모집 종료 시간*
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={hour} onChange={(e) => setHour(e.target.value)}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i.toString().padStart(2, '0')}>
                  {i.toString().padStart(2, '0')}시
                </option>
              ))}
            </select>
            <select value={minute} onChange={(e) => setMinute(e.target.value)}>
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                <option key={m} value={m.toString().padStart(2, '0')}>
                  {m.toString().padStart(2, '0')}분
                </option>
              ))}
            </select>
          </div>
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
          상세 설명
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <label>
          거래 위치
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={location}
              readOnly
              placeholder="지도를 열어 위치를 선택하세요"
            />
            <button type="button" onClick={() => setShowMap(true)}>
              지도 열기
            </button>
          </div>
        </label>

        <button type="submit">등록하기</button>
      </form>

      {showMap && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              margin: '5% auto',
              background: 'white',
              padding: '20px',
              borderRadius: '10px',
              width: '90%',
              maxWidth: '1000px',
            }}
          >
            <button onClick={() => setShowMap(false)} style={{ float: 'right' }}>
              닫기
            </button>
            <KakaoMap onLocationSelect={handleLocationSelect} />
          </div>
        </div>
      )}
    </>
  );
}

export default DeliveryPostForm;
