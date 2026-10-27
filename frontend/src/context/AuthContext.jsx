import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

/**
 * Normalises user roles to an array of uppercase strings.
 * Handles both Set<String> (e.g. ['ROLE_STUDENT']) and [{name: 'ROLE_STUDENT'}] shapes.
 */
const getRolesArray = (user) => {
  if (!user || !user.roles) return [];
  return user.roles.map((r) => {
    const raw = typeof r === 'string' ? r : (r?.name || '');
    return raw.toUpperCase();
  });
};

export const AuthProvider = ({ children }) => {
  // Synchronously hydrate initial user from localStorage to eliminate null state flickers
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  /**
   * On mount: if a token exists in localStorage, verify it with /api/auth/me.
   * If valid, refresh user state.
   * If strictly 401 Unauthorized (token expired/invalid), wipe session.
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    client.get('/auth/me')
      .then(({ data }) => {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      })
      .catch((err) => {
        // Only clear credentials if the backend explicitly rejected the token as unauthorized (401)
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (emailOrUsername, password) => {
    const cleanId = (emailOrUsername || '').trim();
    const { data } = await client.post('/auth/login', { email: cleanId, password });
    if (data.token) localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password, role = 'STUDENT') => {
    const cleanUsername = (username || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const { data } = await client.post('/auth/register', {
      username: cleanUsername,
      email: cleanEmail,
      password,
      role: role || 'STUDENT',
    });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  /**
   * Checks whether the current user has any of the specified roles.
   * Handles both prefixed ('ROLE_STUDENT') and unprefixed ('STUDENT') checks.
   */
  const hasRole = (...roles) => {
    const userRoles = getRolesArray(user);
    return roles.some((target) => {
      const targetUpper = (target || '').toUpperCase();
      const withPrefix = targetUpper.startsWith('ROLE_') ? targetUpper : `ROLE_${targetUpper}`;
      const withoutPrefix = targetUpper.replace(/^ROLE_/, '');
      return userRoles.some((ur) => ur === targetUpper || ur === withPrefix || ur === withoutPrefix);
    });
  };

  const isStudent = () => hasRole('STUDENT');
  const isTeacher = () => hasRole('TEACHER');
  const isAdmin   = () => hasRole('ADMIN');

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, hasRole, isStudent, isTeacher, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};