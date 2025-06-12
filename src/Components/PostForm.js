import React from 'react';
import './PostForm.css';
import KakaoMap from './KakaoMap'; // 경로 확인

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
  meetTimeDate,
  setMeetTimeDate,
  meetHour,
  setMeetHour,
  meetMinute,
  setMeetMinute,
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

            
      <label>
        이미지
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      </label>


      <label>
        제목
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>

      <label>
        모집 인원
        <input type="number" value={goalPeople} onChange={(e) => setGoalPeople(e.target.value)} required />
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
        총 금액
        <input value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} required />
      </label>

      <label>
        설명
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>


     
      {/* ✅ 지도에서 선택하는 위치만 허용 */}
      <label>

      </label>
      <KakaoMap onLocationSelect={(selectedAddress) => setLocation(selectedAddress)} />

      {/* ✅ 선택된 주소 보여주기 */}
      {location && (
        <p style={{ fontSize: '14px', marginTop: '8px' }}>
          ✅ 선택된 장소: <strong>{location}</strong>
        </p>
      )}

      {/* ✅ 상세 위치 입력란 */}
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


      <button type="submit">등록</button>
    </form>
  );
}

export default PostForm;
