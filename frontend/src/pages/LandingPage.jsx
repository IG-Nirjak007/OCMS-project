import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const features = [
  { icon: '👤', color: 'purple', title: 'User Management', desc: 'Role-based access for students, teachers & admins' },
  { icon: '📖', color: 'blue', title: 'Course Management', desc: 'Create, update and organize courses with ease' },
  { icon: '➕', color: 'green', title: 'Enrollment', desc: 'Students can browse and enroll in available courses' },
  { icon: '📄', color: 'orange', title: 'Materials & Assignments', desc: 'Upload resources and manage assignment submissions' },
];

const LandingPage = () => {
  const { user, isTeacher, isAdmin } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (isAdmin?.()) return '/admin';
    if (isTeacher?.()) return '/teacher/dashboard';
    return '/student/dashboard';
  };

  const roleLabel = () => {
    if (!user?.roles) return 'User';
    const roles = user.roles.map((r) => (typeof r === 'string' ? r : r.name));
    if (roles.some((r) => r.includes('ADMIN'))) return 'Admin';
    if (roles.some((r) => r.includes('TEACHER'))) return 'Teacher';
    return 'Student';
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <div className="hero-section">
          <h1>Online Course Management System</h1>
          <p>
            Manage your courses, assignments, and materials effortlessly with our
            secure and collaborative platform.
          </p>

          {user && (
            <div
              className="navbar-user"
              style={{ display: 'inline-flex', margin: '0 auto 1.5rem', cursor: 'pointer' }}
              onClick={() => navigate('/profile')}
            >
              <div className="navbar-avatar">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="navbar-user-info">
                <span className="u-name">{user.email}</span>
                <span className="u-role">{roleLabel()}</span>
              </div>
            </div>
          )}

          <div className="hero-actions">
            <button
              className="hero-btn-primary"
              onClick={() => navigate(user ? getDashboardPath() : '/login')}
            >
              ▶ Get Started
            </button>
            {!user && (
              <button
                className="hero-btn-secondary"
                onClick={() => navigate('/register')}
              >
                Create Account
              </button>
            )}
          </div>
          <p style={{ marginTop: '1.5rem', opacity: 0.6, fontSize: '0.8rem' }}>
            Run React app: <code>npm run dev</code>
          </p>
        </div>

        {/* Features */}
        <div className="features-section">
          <h2>Platform Features</h2>
          <p>Everything you need for effective course management</p>

          <div className="features-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className={`feature-icon ${f.color}`}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
