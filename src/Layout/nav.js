// BottomNav.js
import React from 'react';
import './nav.css';
import { Home, ShoppingBag, UtensilsCrossed, Clock, User } from 'lucide-react';

function BottomNav({ activePage, setActivePage }) {
  const items = [
    { id: 'home', label: '홈', icon: <Home size={20} /> },
    { id: 'groupbuy', label: '공동구매', icon: <ShoppingBag size={20} /> },
    { id: 'groupdelivery', label: '공동배달', icon: <UtensilsCrossed size={20} /> },
    { id: 'history', label: '거래내역', icon: <Clock size={20} /> },
    { id: 'mypage', label: '내정보', icon: <User size={20} /> }
  ];

  return (
    <div className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.id}
          className={`nav-button ${activePage === item.id ? 'active' : ''}`}
          onClick={() => setActivePage(item.id)}
        >
          <div className="nav-icon">{item.icon}</div>
          <div className="nav-label">{item.label}</div>
        </button>
      ))}
    </div>
  );
}

export default BottomNav;
