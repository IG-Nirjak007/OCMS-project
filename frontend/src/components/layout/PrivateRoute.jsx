import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PrivateRoute – Wraps routes that require authentication and optionally a specific role.
 * allowedRoles: Array of role strings (supports both 'ROLE_STUDENT' and 'STUDENT')
 */
const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <span className="loading-text">Checking authentication...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    const isUserAdmin = hasRole('ROLE_ADMIN', 'ADMIN');
    const permitted = isUserAdmin || hasRole(...allowedRoles);
    if (!permitted) return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
