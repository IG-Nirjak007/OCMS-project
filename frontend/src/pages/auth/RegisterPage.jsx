import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/layout/Footer';

const RegisterPage = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  React.useEffect(() => {
    if (user) {
      const roles = (user.roles || []).map((r) =>
        typeof r === 'string' ? r : r.name
      );
      if (roles.some((r) => r.includes('ADMIN'))) navigate('/admin', { replace: true });
      else if (roles.some((r) => r.includes('TEACHER'))) navigate('/teacher/dashboard', { replace: true });
      else navigate('/student/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.role);
      setRegisteredUser({
        username: form.username,
        email: form.email,
        role: form.role,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-mark">🎓</div>
            <h1>Create Account</h1>
            <p>Join OCMS as a student or instructor</p>
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}

          {registeredUser ? (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⏳</div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Registration Submitted!
              </h2>

              <div style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: 'var(--radius)',
                padding: '1rem',
                margin: '1rem 0 1.5rem',
                textAlign: 'left',
              }}>
                <div style={{ fontWeight: 700, color: '#d97706', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>🔒</span> Status: Awaiting Admin Approval
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>
                  Your account <strong>{registeredUser.username}</strong> ({registeredUser.email}) was registered as <strong>{registeredUser.role === 'TEACHER' ? 'Teacher / Instructor' : 'Student'}</strong>.
                </p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                  For institutional security, all new student and instructor registrations must be approved by the system administrator before login is permitted.
                </p>
              </div>

              <button
                type="button"
                className="auth-submit-btn w-full"
                onClick={() => navigate('/login')}
              >
                Go to Sign In Page →
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Role Selector Tabs */}
              <div className="form-group">
                <label className="form-label">I am joining as:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: 'STUDENT' })}
                    style={{
                      padding: '0.65rem',
                      borderRadius: 'var(--radius)',
                      border: form.role === 'STUDENT' ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: form.role === 'STUDENT' ? 'rgba(99, 102, 241, 0.12)' : 'var(--surface-2)',
                      color: form.role === 'STUDENT' ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-sm)',
                      transition: 'all 0.2s',
                    }}
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: 'TEACHER' })}
                    style={{
                      padding: '0.65rem',
                      borderRadius: 'var(--radius)',
                      border: form.role === 'TEACHER' ? '2px solid var(--accent, #00c2a8)' : '1px solid var(--border)',
                      background: form.role === 'TEACHER' ? 'rgba(0, 194, 168, 0.12)' : 'var(--surface-2)',
                      color: form.role === 'TEACHER' ? 'var(--accent, #00c2a8)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-sm)',
                      transition: 'all 0.2s',
                    }}
                  >
                    👨‍🏫 Teacher / Instructor
                  </button>
                </div>
              </div>

              {/* Policy note */}
              <div style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '0.6rem 0.85rem',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
                lineHeight: 1.4,
              }}>
                🔒 <strong>Approval Policy:</strong> All registrations require Administrator verification before login is permitted.
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="form-input"
                  placeholder={form.role === 'TEACHER' ? 'prakashteacher' : 'johndoe'}
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">E-Mail</label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder={form.role === 'TEACHER' ? 'prakashteacher1@gmail.com' : 'you@example.com'}
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Submitting registration...' : `Register ${form.role === 'TEACHER' ? 'Teacher' : 'Student'} Account`}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <span>Already have an account? </span>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;
