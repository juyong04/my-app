//공동구매 글쓰기기
import React, { useState } from 'react';
import './PostForm.css';

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
}) {
  const [previewUrl, setPreviewUrl] = useState(null); // 👈 미리보기용

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // 등록할 때 넘길 용도
      setPreviewUrl(URL.createObjectURL(file)); // 브라우저에만 띄울 URL
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
          style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', margin: '10px 0' }}
        />
      )}

      <label>
        상품명*
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label>
        목표 모집 인원*
        <input type="number" value={goalPeople} onChange={(e) => setGoalPeople(e.target.value)} />
      </label>

      <label>
        모집 마감 일시*
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
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

      <label>
        거래 위치
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
      </label>

      <button type="submit">등록하기</button>
    </form>
  );
}

export default PostForm;
