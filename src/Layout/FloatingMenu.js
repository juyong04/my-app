// src/Layout/FloatingMenu.js
import React from 'react';
import { ShoppingCart, Bike } from 'lucide-react'; // ✅ lucide 아이콘 추가
import './FloatingMenu.css';

function FloatingMenu({ visible, onSelect }) {
  if (!visible) return null;

  return (
    <div className="floating-menu">
      <button className="floating-action-button" onClick={() => onSelect('groupbuy')}>
        <ShoppingCart size={18} style={{ marginRight: '6px' }} />
        공동구매 글쓰기
      </button>
      <button className="floating-action-button" onClick={() => onSelect('groupdelivery')}>
        <Bike size={18} style={{ marginRight: '6px' }} />
        공동배달 글쓰기
      </button>
    </div>
  );
}

export default FloatingMenu;
