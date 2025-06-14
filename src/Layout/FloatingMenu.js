// src/Layout/FloatingMenu.js
import React from 'react';
import './FloatingMenu.css';

function FloatingMenu({ visible, onSelect }) {
  if (!visible) return null;

  return (
    <div className="floating-menu">
      {/* ✅ 변경: className 추가로 새로운 스타일 적용 */}
      <button className="floating-action-button" onClick={() => onSelect('groupbuy')}>공동구매 글쓰기</button>
      <button className="floating-action-button" onClick={() => onSelect('groupdelivery')}>공동배달 글쓰기</button>
    </div>
  );
}

export default FloatingMenu;
