import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const getRolesArray = (user) => {
  if (!user || !user.roles) return [];
  return user.roles.map((r) => (typeof r === 'string' ? r : r.name));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch (_) { localStorage.removeItem('user'); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    if (data.token) localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password, role) => {
    const { data } = await client.post('/auth/register', { username, email, password, role });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (...roles) => {
    const userRoles = getRolesArray(user);
    return roles.some((r) => userRoles.includes(r));
  };

  const isStudent = () => hasRole('ROLE_STUDENT', 'STUDENT');
  const isTeacher = () => hasRole('ROLE_TEACHER', 'TEACHER');
  const isAdmin = () => hasRole('ROLE_ADMIN', 'ADMIN');

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, hasRole, isStudent, isTeacher, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};