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
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
      setSuccess(`Account created as ${form.role === 'TEACHER' ? 'Teacher' : 'Student'}! Redirecting to sign in...`);
      setTimeout(() => navigate('/login'), 1200);
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
          {success && <div className="auth-success">✓ {success}</div>}

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
              {loading ? 'Creating account...' : `Create ${form.role === 'TEACHER' ? 'Teacher' : 'Student'} Account`}
            </button>
          </form>

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