import React from 'react';
import './nav.css';

function BottomNav({ activePage, setActivePage }) {
  const items = [
    { id: 'home', label: '홈' },
    { id: 'groupbuy', label: '공동구매' },
    { id: 'groupdelivery', label: '공동배달' },
    { id: 'history', label: '거래내역' },
    { id: 'mypage', label: '내정보' }  // ✅ 여기 고침
  ];

  return (
    <div className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.id}
          className={`nav-button ${activePage === item.id ? 'active' : ''}`}
          onClick={() => setActivePage(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default BottomNav;
