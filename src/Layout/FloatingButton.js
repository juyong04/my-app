// src/Layout/FloatingButton.js
import React from 'react';
import './FloatingButton.css';

function FloatingButton({ onClick }) {
  return (
    <button className="floating-button" onClick={onClick}>
      ✏️
    </button>
  );
}

export default FloatingButton;
