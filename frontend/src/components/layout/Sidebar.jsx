import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const studentLinks = [
  { to: '/student/dashboard', icon: '🏫', label: 'All Classrooms' },
  { to: '/my-courses', icon: '📚', label: 'My Enrolled Classrooms' },
  { to: '/profile', icon: '👤', label: 'My Profile' },
];

const teacherLinks = [
  { to: '/teacher/dashboard', icon: '👨‍🏫', label: 'Teacher Dashboard' },
  { to: '/student/dashboard', icon: '🏫', label: 'Classroom Catalog' },
  { to: '/profile', icon: '👤', label: 'My Profile' },
];

const adminLinks = [
  { to: '/admin', icon: '⚙️', label: 'Admin Command Center' },
  { to: '/teacher/dashboard', icon: '👨‍🏫', label: 'Teacher Dashboard' },
  { to: '/student/dashboard', icon: '🏫', label: 'Classroom Catalog' },
  { to: '/profile', icon: '👤', label: 'My Profile' },
];

const Sidebar = () => {
  const { isTeacher, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();

  const links = isAdmin?.()
    ? adminLinks
    : isTeacher?.()
    ? teacherLinks
    : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      <span className="sidebar-section-label">Navigation</span>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          <span className="icon">{link.icon}</span>
          {link.label}
        </NavLink>
      ))}

      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger, #ef4444)' }}
        >
          <span className="icon">🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
