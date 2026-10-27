import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isTeacher, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const roleLabel = () => {
    if (!user) return '';
    const roles = user.roles || [];
    const roleStr = roles.map((r) => (typeof r === 'string' ? r : r.name)).join(', ');
    if (roleStr.includes('ADMIN')) return 'Admin';
    if (roleStr.includes('TEACHER')) return 'Teacher';
    return 'Student';
  };

  const dashboardPath = () => {
    if (isAdmin?.()) return '/admin';
    if (isTeacher?.()) return '/teacher/dashboard';
    return '/student/dashboard';
  };

  return (
    <nav className="learnworlds-navbar">
      <div className="lw-nav-container">
        {/* Brand Logo matching image */}
        <Link to="/" className="lw-brand">
          <div className="lw-logo-icon">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z" fill="#18202b" />
              <path d="M16 6.5L24.5 11.5L16 16.5L7.5 11.5L16 6.5Z" fill="#54c6b8" />
              <path d="M12 18.5V23.5L16 26L20 23.5V18.5L16 21L12 18.5Z" fill="#ffffff" />
            </svg>
          </div>
          <span className="lw-brand-text">OCMS</span>
        </Link>

        {/* Center Navigation Links */}
        <div className={`lw-nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink to="/" end className="lw-nav-item">
            <span>Home</span>
          </NavLink>
          <a href="/#classrooms" className="lw-nav-item">
            <span>Classroom Catalog</span>
          </a>
          <a href="/#features" className="lw-nav-item">
            <span>Core Features</span>
          </a>
          <a href="/#about" className="lw-nav-item">
            <span>About OCMS</span>
          </a>
        </div>

        {/* Right CTA Actions matching image */}
        <div className="lw-nav-actions">
          {user ? (
            <>
              <button
                className="lw-btn-outline"
                onClick={() => navigate('/profile')}
                title="Account Settings"
              >
                👤 {user.username} ({roleLabel()})
              </button>
              <button
                className="lw-btn-primary"
                onClick={() => navigate(dashboardPath())}
              >
                Dashboard →
              </button>
              <button className="lw-btn-ghost-sm" onClick={handleLogout} title="Sign Out">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="lw-btn-outline">
                Login
              </Link>
              <Link to="/register" className="lw-btn-primary">
                Get Started Free
              </Link>
            </>
          )}

          {/* Mobile hamburger toggle */}
          <button
            className="lw-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
