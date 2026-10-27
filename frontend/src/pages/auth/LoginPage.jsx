import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/layout/Footer';

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
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
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      const roles = (data.user?.roles || []).map((r) =>
        typeof r === 'string' ? r : r.name
      );
      if (roles.some((r) => r.includes('ADMIN'))) navigate('/admin');
      else if (roles.some((r) => r.includes('TEACHER'))) navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
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
            <h1>OCMS</h1>
            <p>Online Course Management System</p>
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email or Username</label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                className="form-input"
                placeholder="you@example.com or username"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Login Chips */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
              Quick Login Demo Accounts:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start', border: '1px solid var(--border)' }}
                onClick={() => setForm({ email: 'prakashteacher1@gmail.com', password: 'prakashteacher' })}
              >
                👨‍🏫 <strong>Teacher:</strong> prakashteacher1@gmail.com
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start', border: '1px solid var(--border)' }}
                onClick={() => setForm({ email: 'admin@ocms.com', password: 'admin123' })}
              >
                ⚙️ <strong>Admin:</strong> admin@ocms.com
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start', border: '1px solid var(--border)' }}
                onClick={() => setForm({ email: 'student@ocms.com', password: 'student123' })}
              >
                🎓 <strong>Student:</strong> student@ocms.com
              </button>
            </div>
          </div>

          <div className="auth-footer">
            <Link to="/forgot-password">Forgot password?</Link>
            <br />
            <span>Don't have an account? </span>
            <Link to="/register">Sign up</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;