// src/Layout/TopBar.js
import React from 'react';
import './TopBar.css';

function TopBar({ title }) {
  return (
    <div className="top-bar">
      <h1 className="top-bar-title">{title}</h1>
    </div>
  );
}

export default TopBar;
