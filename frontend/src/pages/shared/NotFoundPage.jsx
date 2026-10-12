import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="empty-state" style={{ height: '100vh', justifyContent: 'center' }}>
      <div className="empty-icon" style={{ fontSize: '4rem' }}>404</div>
      <h1 className="empty-title">Page Not Found</h1>
      <p className="empty-desc">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary mt-4">Return Home</Link>
    </div>
  );
};

export default NotFoundPage;
