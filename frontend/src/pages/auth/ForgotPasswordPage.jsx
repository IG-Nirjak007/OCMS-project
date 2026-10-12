import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo-mark">🔒</div>
          <h2 style={{ marginBottom: '1rem', marginTop: '1rem' }}>Reset Password</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" className="form-input" placeholder="you@example.com" required />
            <button className="auth-submit-btn">Send Reset Link</button>
          </form>
          
          <div className="auth-footer mt-4">
            <Link to="/login">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;