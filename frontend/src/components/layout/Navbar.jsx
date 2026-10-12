import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isTeacher, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <div className="brand-dot" />
        OCMS
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          Explore
        </NavLink>

        {user ? (
          <>
            <NavLink
              to={dashboardPath()}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Classroom
            </NavLink>
            <div className="navbar-user" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')} title="View profile">
              <div className="navbar-avatar">
                {user.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="navbar-user-info">
                <span className="u-name">{user.username}</span>
                <span className="u-role">{roleLabel()}</span>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
              Login
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>
              Signup
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
