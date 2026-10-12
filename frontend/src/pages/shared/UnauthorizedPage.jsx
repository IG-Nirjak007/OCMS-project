import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="empty-state" style={{ height: '100vh', justifyContent: 'center' }}>
      <div className="empty-icon" style={{ fontSize: '4rem', color: 'var(--danger)' }}>✋</div>
      <h1 className="empty-title">Unauthorized</h1>
      <p className="empty-desc">You don't have permission to access this page.</p>
      <Link to="/" className="btn btn-primary mt-4">Return Home</Link>
    </div>
  );
};

export default UnauthorizedPage;
