// src/Layout/PageLayout.js
import React from 'react';
import './PageLayout.css';


function PageLayout({ title, children, hasPaddingTop = false }) {
  return (
    <div
      className="page-wrapper"
      style={{ paddingTop: hasPaddingTop ? '60px' : '0' }}
    >
      {children}
    </div>
  );
}



export default PageLayout;
