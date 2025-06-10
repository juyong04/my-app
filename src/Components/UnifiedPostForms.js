// ✅ 공통 요소들 분리: ImageUpload, DateTimePicker, LocationInput 포함
import React, { useState } from 'react';
import KakaoMap from './KakaoMap';
import './PostForm.css';

export function ImageUpload({ image, setImage }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <label>
      대표 이미지
      <input type="file" accept="image/*" onChange={handleImageChange} />
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
    </label>
  );
}

export function DateTimePicker({ date, setDate, hour, setHour, minute, setMinute }) {
  return (
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
  );
}

export function LocationInput({ location, setLocation, locationDetail, setLocationDetail }) {
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="location-input-block" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <label>거래 위치</label>
        <input type="text" value={location} readOnly />
        <button type="button" onClick={() => setShowMap(true)}>지도에서 선택</button>
        {showMap && (
          <KakaoMap
            onLocationSelect={(placeName) => {
              setLocation(placeName);
              setShowMap(false);
            }}
          />
        )}
      </div>

      <div>
        <label>위치 상세 설명</label>
        <input
          type="text"
          value={locationDetail}
          onChange={(e) => setLocationDetail(e.target.value)}
          placeholder="예: 1층 000호 강의실 앞"
        />
      </div>
    </div>
  );
}
