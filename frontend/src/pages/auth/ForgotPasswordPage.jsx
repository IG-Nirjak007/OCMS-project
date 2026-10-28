import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Footer from '../../components/layout/Footer';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP, 3: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Step 1: Send OTP to registered email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await client.post('/auth/request-otp', { email: email.trim() });
      setMessage(res.data.message || 'OTP verification code has been dispatched to your email.');
      if (res.data.otp) {
        setDemoOtpHint(res.data.otp);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch OTP. Please check the email entered.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await client.post('/auth/verify-otp', {
        email: email.trim(),
        otp: otp.trim(),
      });
      setResetToken(res.data.resetToken);
      setMessage('OTP verified successfully! Now please create your new password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await client.post('/auth/reset-password', {
        email: email.trim(),
        resetToken: resetToken,
        newPassword: newPassword,
      });
      setMessage(res.data.message || 'Password updated successfully!');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please start over.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-mark">🔑</div>
            <h1>Password Recovery</h1>
            <p>Secure OTP Verification via Redis & SMTP</p>
          </div>

          {/* Stepper Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: step === 1 ? 'var(--primary)' : 'var(--surface-2)',
              color: step === 1 ? '#fff' : 'var(--text-muted)'
            }}>
              1. Email
            </span>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: step === 2 ? 'var(--primary)' : 'var(--surface-2)',
              color: step === 2 ? '#fff' : 'var(--text-muted)'
            }}>
              2. OTP Code
            </span>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: step === 3 ? 'var(--primary)' : 'var(--surface-2)',
              color: step === 3 ? '#fff' : 'var(--text-muted)'
            }}>
              3. New Password
            </span>
          </div>

          {error && <div className="auth-error mb-4">⚠ {error}</div>}
          {message && <div className="alert alert-success mb-4">✓ {message}</div>}

          {demoOtpHint && step === 2 && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ fontWeight: 600, color: 'var(--primary)' }}>⚡ Live Presentation / Demo Code:</div>
              <div>Your Redis OTP is: <code style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '2px', color: 'var(--primary)' }}>{demoOtpHint}</code></div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: '0.35rem', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => setOtp(demoOtpHint)}
              >
                Auto-fill Code
              </button>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form className="auth-form" onSubmit={handleRequestOtp}>
              <div className="form-group">
                <label className="form-label">Registered Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. prakashteacher1@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label className="form-label">Enter 6-Digit OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  className="form-input"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 600 }}
                  required
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading || otp.length < 6}>
                {loading ? 'Verifying OTP...' : 'Verify OTP Code'}
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setStep(1); setDemoOtpHint(''); setOtp(''); }}
                >
                  ← Change Email
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleRequestOtp}
                  disabled={loading}
                >
                  🔄 Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
              </button>
            </form>
          )}

          <div className="auth-footer mt-4">
            <Link to="/login">← Back to Sign In</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;