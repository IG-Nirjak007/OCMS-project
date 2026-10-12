import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const studentLinks = [
  { to: '/student/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/my-courses', icon: '📚', label: 'My Courses' },
];

const teacherLinks = [
  { to: '/teacher/dashboard', icon: '🏠', label: 'Dashboard' },
];

const adminLinks = [
  { to: '/admin', icon: '⚙️', label: 'Admin Panel' },
];

const Sidebar = () => {
  const { isTeacher, isAdmin, isStudent } = useAuth();

  const links = isAdmin?.()
    ? adminLinks
    : isTeacher?.()
    ? teacherLinks
    : studentLinks;

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
    </aside>
  );
};

export default Sidebar;
