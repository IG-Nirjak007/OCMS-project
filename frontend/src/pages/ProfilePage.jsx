import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  const roles = user.roles || [];
  const roleDisplay = roles
    .map((r) => (typeof r === 'string' ? r : r.name))
    .join(', ')
    .replaceAll('ROLE_', '');

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">My Account Profile</h1>
              <p className="page-subtitle">Your credentials and account information</p>
            </div>
          </div>

          <div style={{ maxWidth: '640px' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700 }}>
                  {user.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{user.username}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>{user.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>User ID:</span>
                  <span style={{ fontWeight: 600 }}>#{user.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>System Roles:</span>
                  <span className="badge badge-primary">{roleDisplay || 'STUDENT'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Account Security:</span>
                  <span className="badge badge-success">✓ Active & Authenticated</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Authentication Method:</span>
                  <span>Stateless JWT (HMAC-SHA256)</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;