import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';
import client from '../../api/client';

const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admin needs to fetch all users. Assuming there's a /users endpoint
    // If it doesn't exist, this will error gracefully.
    client.get('/users')
      .then((res) => setUsers(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="page-subtitle">Manage platform users and settings</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon indigo">👥</div>
              <div>
                <div className="stat-value">{users.length}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">User Management</h2>
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
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td style={{ fontWeight: 600 }}>{u.username}</td>
                        <td>{u.email}</td>
                        <td>
                          {u.roles?.map(r => (
                            <span key={r.id || r.name} className="badge badge-primary mr-1">
                              {r.name?.replace('ROLE_', '') || String(r).replace('ROLE_', '')}
                            </span>
                          ))}
                        </td>
                        <td>
                          <button className="btn btn-secondary btn-sm">Edit</button>
                        </td>
                      </tr>
                    ))}
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
