import React from 'react';
import KakaoMap from './KakaoMap';
import './PostForm.css';

function DeliveryPostForm({
  onSubmit,
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
    <>
      <form onSubmit={onSubmit} className="post-form" id="delivery-post-form">
        <label>
          가게명
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="주문할 가게 지점명을 정확히 작성해주세요"
          />
        </label>

        <label>
          최소 주문 금액 (원)
          <input
            type="text"
            value={minOrderPrice}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/[^0-9]/g, '');
              const formatted = Number(onlyNums).toLocaleString();
              setMinOrderPrice(formatted);
            }}
            required
            placeholder="목표 최소주문금액을 작성해주세요"
          />
        </label>

        <label>
          배달비 (원)
          <input
            type="text"
            value={deliveryFee}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/[^0-9]/g, '');
              const formatted = Number(onlyNums).toLocaleString();
              setDeliveryFee(formatted);
            }}
            required
            placeholder="예상 배달비를 작성해주세요"
          />
        </label>

        <label>
          모집 마감 일시
          <div className="time-row">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
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
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="가게 정보를 확인할 수 있는 링크, 배달 시킬 사이트 주소 등을 입력해주세요"
          />
        </label>

        <KakaoMap onLocationSelect={(selected) => setLocation(selected)} />

        {location && (
          <p className="location-preview">
            ✅ 선택된 장소: <strong>{location}</strong>
          </p>
        )}

        <label>
          상세 위치
          <input
            value={locationDetail}
            onChange={(e) => setLocationDetail(e.target.value)}
            placeholder="예: 000호 강의실 앞 / 1층 로비"
          />
        </label>

        <label>
          거래 일시
          <div className="time-row">
            <input
              type="date"
              value={meetTimeDate}
              onChange={(e) => setMeetTimeDate(e.target.value)}
              required
            />
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
      </form>

      <div className="fixed-submit">
        <button type="submit" form="delivery-post-form">등록하기</button>
      </div>
    </>
  );
}

export default DeliveryPostForm;
