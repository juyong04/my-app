// PostForm.js
import React from 'react';
import './PostForm.css';
import KakaoMap from './KakaoMap';

function PostForm({
  onSubmit,
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
    <>
      <form onSubmit={onSubmit} className="post-form" id="post-form">

        <label>
          품목
          <input value={title} onChange={(e) => setTitle(e.target.value)} required 
          placeholder='나누고 싶은 품목명을 작성해주세요'/>
        </label>

        <label>
          목표 모집인원
          <input type="number" value={goalPeople} onChange={(e) => setGoalPeople(e.target.value)} required
          placeholder='자신을 포함한 인원을 숫자로 작성해주세요' />
        </label>

        <label>
          모집 마감 일시
          <div className="time-row">
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
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </label>

        <label>
          총 금액
          <input value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} required 
          placeholder='해당 물품의 총 금액을 작성해주세요'/>
        </label>

        <label>
          설명
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder='물품에 대한 정보를 확인할 수 있는 링크를 포함하거나 설명을 작성해주세요' />
        </label>

        <label></label>
        <KakaoMap onLocationSelect={(selectedAddress) => setLocation(selectedAddress)} />
        {location && (
          <p className="location-preview">✅ 선택된 장소: <strong>{location}</strong></p>
        )}

        <label>
          상세 위치
          <input value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)} 
          placeholder="예: 000호 강의실 앞 / 1층 로비"/>
        </label>

        <label>
          거래 일시
          <div className="time-row">
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
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </label>
      </form>

      <div className="fixed-submit">
        <button type="submit" form="post-form">등록하기</button>
      </div>
    </>
  );
}

export default PostForm;
