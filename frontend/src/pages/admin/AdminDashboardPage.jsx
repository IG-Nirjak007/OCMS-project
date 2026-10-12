import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';
import client from '../../api/client';
import { getAllUsers, updateUserRole, deleteUser, getAdminStats } from '../../api/adminApi';

const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsReport, setStatsReport] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.allSettled([
        getAllUsers(),
        getAdminStats(),
      ]);

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data || []);
      } else {
        setError('Failed to load users list.');
      }

      if (statsRes.status === 'fulfilled') {
        setStatsReport(statsRes.value.data?.report || '');
      }
    } catch (err) {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId) => {
    setError('');
    setSuccess('');
    try {
      const roleToSend = selectedRole.startsWith('ROLE_') ? selectedRole.replace('ROLE_', '') : selectedRole;
      await updateUserRole(userId, roleToSend);
      setSuccess('User role updated successfully.');
      setEditingUserId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    setError('');
    setSuccess('');
    try {
      await deleteUser(userId);
      setSuccess('User deleted successfully.');
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const getPrimaryRole = (user) => {
    if (!user.roles || user.roles.length === 0) return 'STUDENT';
    const first = user.roles[0];
    const roleName = first.name || String(first);
    return roleName.replace('ROLE_', '');
  };

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="page-subtitle">Manage platform users, roles, and system oversight</p>
            </div>
          </div>

          {error && <div className="alert alert-error mb-4">{error}</div>}
          {success && <div className="alert alert-success mb-4">{success}</div>}

          <div className="stats-grid mb-6">
            <div className="stat-card">
              <div className="stat-icon indigo">👥</div>
              <div>
                <div className="stat-value">{users.length}</div>
                <div className="stat-label">Total Registered Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">🎓</div>
              <div>
                <div className="stat-value">{users.filter((u) => getPrimaryRole(u) === 'STUDENT').length}</div>
                <div className="stat-label">Students</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">👨‍🏫</div>
              <div>
                <div className="stat-value">{users.filter((u) => getPrimaryRole(u) === 'TEACHER').length}</div>
                <div className="stat-label">Teachers / Instructors</div>
              </div>
            </div>
          </div>

          {statsReport && (
            <div className="card mb-6">
              <div className="card-header">
                <h2 className="card-title">📊 System Summary Report</h2>
              </div>
              <pre style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: 'var(--radius)', whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                {statsReport}
              </pre>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Platform Users Directory</h2>
            </div>
            
            {loading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-title">No users found</div>
                <div className="empty-desc">Could not load users list.</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Current Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const currentRole = getPrimaryRole(u);
                      const isEditing = editingUserId === u.id;
                      return (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td style={{ fontWeight: 600 }}>{u.username}</td>
                          <td>{u.email}</td>
                          <td>
                            {isEditing ? (
                              <select
                                className="form-input"
                                style={{ padding: '0.25rem 0.5rem', width: 'auto' }}
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                              >
                                <option value="STUDENT">STUDENT</option>
                                <option value="TEACHER">TEACHER</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            ) : (
                              <span className={`badge ${currentRole === 'ADMIN' ? 'badge-primary' : currentRole === 'TEACHER' ? 'badge-warning' : 'badge-success'}`}>
                                {currentRole}
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {isEditing ? (
                                <>
                                  <button className="btn btn-success btn-sm" onClick={() => handleRoleUpdate(u.id)}>
                                    Save
                                  </button>
                                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingUserId(null)}>
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                      setEditingUserId(u.id);
                                      setSelectedRole(currentRole);
                                    }}
                                  >
                                    Change Role
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDeleteUser(u.id)}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboardPage;
