import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';
import client from '../../api/client';
import { getAllUsers, updateUserRole, approveUser, deleteUser, createUser, getAdminStats } from '../../api/adminApi';

const CreateClassroomModal = ({ onClose, onCreated, teachers, students }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    schedule: '',
    instructorId: teachers[0]?.id || '',
    studentIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleStudent = (id) => {
    setForm((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(id)
        ? prev.studentIds.filter((sId) => sId !== id)
        : [...prev.studentIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please provide a course title.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        schedule: form.schedule,
        instructorId: form.instructorId ? Number(form.instructorId) : null,
        studentIds: form.studentIds,
      };
      const res = await client.post('/courses', payload);
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create classroom.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🏫 Create Classroom & Assign Staff</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error mb-4">{error}</div>}
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Course / Classroom Title *</label>
            <input
              className="form-input"
              placeholder="e.g. Advanced Operating Systems"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Syllabus description, learning objectives..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Schedule</label>
            <input
              className="form-input"
              placeholder="e.g. Tue/Thu 14:00–16:00"
              value={form.schedule}
              onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign Lead Teacher / Instructor *</label>
            <select
              className="form-input"
              value={form.instructorId}
              onChange={(e) => setForm({ ...form, instructorId: e.target.value })}
              required
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  👨‍🏫 {t.username} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Admit Initial Students (Optional)</label>
            <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.5rem', background: 'var(--surface-2)' }}>
              {students.length === 0 ? (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>No registered students available.</div>
              ) : (
                students.map((s) => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', marginBottom: '0.25rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.studentIds.includes(s.id)}
                      onChange={() => toggleStudent(s.id)}
                    />
                    <span>{s.username} ({s.email})</span>
                  </label>
                ))
              )}
            </div>
            <span className="form-hint">{form.studentIds.length} student(s) selected</span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create & Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateUserModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'TEACHER' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await createUser(form);
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">👤 Add New Platform User</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error mb-4">{error}</div>}
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input
              className="form-input"
              placeholder="e.g. prof_smith"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="smith@university.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Initial Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select
              className="form-input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="TEACHER">Teacher / Instructor</option>
              <option value="STUDENT">Student</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ClassroomStudentsModal = ({ course, onClose, students, onUpdated }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, [course.id]);

  const fetchEnrollments = async () => {
    try {
      const res = await client.get(`/enrollments/course/${course.id}`);
      setEnrollments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setActionLoading(true);
    setError('');
    try {
      await client.post(`/enrollments/course/${course.id}/students/${selectedStudentId}`);
      setSelectedStudentId('');
      fetchEnrollments();
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to admit student.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (studentId) => {
    if (!window.confirm('Remove student from classroom?')) return;
    try {
      await client.delete(`/enrollments/course/${course.id}/students/${studentId}`);
      fetchEnrollments();
      onUpdated();
    } catch (err) {
      alert('Failed to remove student.');
    }
  };

  const enrolledIds = enrollments.map((e) => e.student?.id);
  const availableStudents = students.filter((s) => !enrolledIds.includes(s.id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🎓 Admitted Students: {course.title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: '0.5rem' }}>Admit a Student:</h4>
          <form onSubmit={handleAdmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              className="form-input"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
            >
              <option value="">-- Choose Student to Admit --</option>
              {availableStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.username} ({s.email})
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-secondary btn-sm" disabled={actionLoading || !selectedStudentId}>
              {actionLoading ? 'Admitting...' : '+ Admit'}
            </button>
          </form>
        </div>

        <div>
          <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: '0.5rem' }}>
            Enrolled Students ({enrollments.length}):
          </h4>
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : enrollments.length === 0 ? (
            <p className="text-muted text-sm">No students admitted to this classroom yet.</p>
          ) : (
            <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {enrollments.map((enr) => (
                <div
                  key={enr.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--surface-2)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>{enr.student?.username || `ID ${enr.student?.id}`}</span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                      {enr.student?.email}
                    </span>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ padding: '0.15rem 0.4rem', fontSize: 'var(--font-size-xs)' }}
                    onClick={() => handleRemove(enr.student?.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('classrooms');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsReport, setStatsReport] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showClassroomModal, setShowClassroomModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);

  // User editing & filters
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, coursesRes, statsRes] = await Promise.allSettled([
        getAllUsers(),
        client.get('/courses'),
        getAdminStats(),
      ]);

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data || []);
      } else {
        setError('Failed to load users list.');
      }

      if (coursesRes.status === 'fulfilled') {
        setCourses(coursesRes.value.data || []);
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

  const getPrimaryRole = (user) => {
    if (!user.roles || user.roles.length === 0) return 'STUDENT';
    const first = user.roles[0];
    const roleName = first.name || String(first);
    return roleName.replace('ROLE_', '');
  };

  const teachers = users.filter((u) => getPrimaryRole(u) === 'TEACHER' || getPrimaryRole(u) === 'ADMIN');
  const students = users.filter((u) => getPrimaryRole(u) === 'STUDENT');

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

  const handleApproveUser = async (userId) => {
    setError('');
    setSuccess('');
    try {
      await approveUser(userId);
      setSuccess('User registration approved successfully! The user is now permitted to log in.');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, approved: true } : u))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user? All associated data will be removed.')) return;
    setError('');
    setSuccess('');
    try {
      await deleteUser(userId);
      setSuccess('User removed successfully.');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this classroom? This permanently removes its curriculum materials, assignments, and submissions.')) return;
    setError('');
    setSuccess('');
    try {
      await client.delete(`/courses/${courseId}`);
      setSuccess('Classroom removed successfully.');
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course.');
    }
  };

  const pendingUsers = users.filter((u) => !u.approved);

  const filteredUsers = users.filter((u) => {
    const role = getPrimaryRole(u);
    let matchesFilter = true;
    if (userRoleFilter === 'PENDING') {
      matchesFilter = !u.approved;
    } else if (userRoleFilter !== 'ALL') {
      matchesFilter = role === userRoleFilter;
    }

    const matchesSearch =
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredCourses = courses.filter((c) => {
    return (
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(courseSearch.toLowerCase()))
    );
  });

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="page-title">Admin Command Center</h1>
              <p className="page-subtitle">Complete control over classrooms, educators, students, and study materials</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowUserModal(true)}>
                + Add User
              </button>
              <button className="btn btn-primary" onClick={() => setShowClassroomModal(true)}>
                + Create Classroom
              </button>
            </div>
          </div>

          {error && <div className="alert alert-error mb-4">⚠ {error}</div>}
          {success && <div className="alert alert-success mb-4">✓ {success}</div>}

          {/* Quick KPI stats */}
          <div className="stats-grid mb-6">
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('classrooms')}>
              <div className="stat-icon indigo">🏫</div>
              <div>
                <div className="stat-value">{courses.length}</div>
                <div className="stat-label">Total Classrooms</div>
              </div>
            </div>
            <div
              className="stat-card"
              style={{
                cursor: 'pointer',
                border: pendingUsers.length > 0 ? '2px solid #f59e0b' : '1px solid var(--border)',
                background: pendingUsers.length > 0 ? 'rgba(245, 158, 11, 0.06)' : 'var(--surface-2)',
              }}
              onClick={() => { setActiveTab('users'); setUserRoleFilter('PENDING'); }}
            >
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>⏳</div>
              <div>
                <div className="stat-value" style={{ color: pendingUsers.length > 0 ? '#d97706' : 'inherit' }}>
                  {pendingUsers.length}
                </div>
                <div className="stat-label">Pending Approvals</div>
              </div>
            </div>
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setActiveTab('users'); setUserRoleFilter('TEACHER'); }}>
              <div className="stat-icon orange">👨‍🏫</div>
              <div>
                <div className="stat-value">{users.filter((u) => getPrimaryRole(u) === 'TEACHER').length}</div>
                <div className="stat-label">Teachers / Instructors</div>
              </div>
            </div>
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setActiveTab('users'); setUserRoleFilter('STUDENT'); }}>
              <div className="stat-icon green">🎓</div>
              <div>
                <div className="stat-value">{users.filter((u) => getPrimaryRole(u) === 'STUDENT').length}</div>
                <div className="stat-label">Enrolled Students</div>
              </div>
            </div>
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setActiveTab('users'); setUserRoleFilter('ALL'); }}>
              <div className="stat-icon blue">👥</div>
              <div>
                <div className="stat-value">{users.length}</div>
                <div className="stat-label">Total Platform Users</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <button
              className={`btn btn-sm ${activeTab === 'classrooms' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('classrooms')}
            >
              🏫 Classrooms & Curriculum ({courses.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('users')}
            >
              👥 User Management ({users.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 System Analytics & Reports
            </button>
          </div>

          {/* TAB 1: CLASSROOMS */}
          {activeTab === 'classrooms' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="🔍 Search classrooms..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  style={{ maxWidth: '320px' }}
                />
                <button className="btn btn-primary btn-sm" onClick={() => setShowClassroomModal(true)}>
                  + Create Classroom
                </button>
              </div>

              {loading ? (
                <div className="loading-spinner"><div className="spinner" /></div>
              ) : filteredCourses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏫</div>
                  <div className="empty-title">No Classrooms Found</div>
                  <div className="empty-desc">Create classrooms and assign teachers and students.</div>
                </div>
              ) : (
                <div className="course-grid">
                  {filteredCourses.map((c) => (
                    <div className="course-card" key={c.id}>
                      <div className="course-card-banner">🏫</div>
                      <div className="course-card-body">
                        <h3>{c.title}</h3>
                        <p>{c.description || 'No description provided.'}</p>
                        <div className="course-meta">
                          {c.schedule && <span>🗓 {c.schedule}</span>}
                          {c.instructors && c.instructors.length > 0 ? (
                            <div>
                              <span>👨‍🏫 Staff: </span>
                              {c.instructors.map((inst) => (
                                <span key={inst.id} className="badge badge-secondary" style={{ marginRight: '0.25rem' }}>
                                  {inst.username}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="badge badge-warning">No Teacher Assigned</span>
                          )}
                        </div>
                      </div>

                      <div className="course-card-footer" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-primary btn-sm flex-1"
                          onClick={() => navigate(`/courses/${c.id}/materials`)}
                          title="Manage materials, assignments and submissions"
                        >
                          Curriculum & Materials
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedCourseForStudents(c)}
                          title="Admit or remove students"
                        >
                          Admit Students
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteCourse(c.id)}
                          title="Permanently remove classroom"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    className={`btn btn-sm ${userRoleFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setUserRoleFilter('ALL')}
                  >
                    All ({users.length})
                  </button>
                  <button
                    className={`btn btn-sm ${userRoleFilter === 'PENDING' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setUserRoleFilter('PENDING')}
                    style={pendingUsers.length > 0 ? { borderColor: '#f59e0b', color: userRoleFilter === 'PENDING' ? '#fff' : '#d97706', fontWeight: 600 } : {}}
                  >
                    ⏳ Pending Approvals ({pendingUsers.length})
                  </button>
                  <button
                    className={`btn btn-sm ${userRoleFilter === 'TEACHER' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setUserRoleFilter('TEACHER')}
                  >
                    Teachers ({users.filter((u) => getPrimaryRole(u) === 'TEACHER').length})
                  </button>
                  <button
                    className={`btn btn-sm ${userRoleFilter === 'STUDENT' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setUserRoleFilter('STUDENT')}
                  >
                    Students ({users.filter((u) => getPrimaryRole(u) === 'STUDENT').length})
                  </button>
                  <button
                    className={`btn btn-sm ${userRoleFilter === 'ADMIN' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setUserRoleFilter('ADMIN')}
                  >
                    Admins ({users.filter((u) => getPrimaryRole(u) === 'ADMIN').length})
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="🔍 Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ maxWidth: '240px' }}
                  />
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowUserModal(true)}>
                    + Add User
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="loading-spinner"><div className="spinner" /></div>
              ) : filteredUsers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <div className="empty-title">No users match criteria</div>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Assigned Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const currentRole = getPrimaryRole(u);
                        const isEditing = editingUserId === u.id;
                        return (
                          <tr key={u.id}>
                            <td>#{u.id}</td>
                            <td style={{ fontWeight: 600 }}>{u.username}</td>
                            <td>{u.email}</td>
                            <td>
                              {isEditing ? (
                                <select
                                  className="form-input"
                                  style={{ padding: '0.2rem 0.5rem', width: 'auto' }}
                                  value={selectedRole}
                                  onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                  <option value="STUDENT">STUDENT</option>
                                  <option value="TEACHER">TEACHER</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                              ) : (
                                <span
                                  className={`badge ${
                                    currentRole === 'ADMIN'
                                      ? 'badge-primary'
                                      : currentRole === 'TEACHER'
                                      ? 'badge-warning'
                                      : 'badge-success'
                                  }`}
                                >
                                  {currentRole}
                                </span>
                              )}
                            </td>
                            <td>
                              {u.approved ? (
                                <span className="badge badge-success">✓ Active</span>
                              ) : (
                                <span
                                  className="badge"
                                  style={{
                                    background: 'rgba(245, 158, 11, 0.15)',
                                    color: '#b45309',
                                    border: '1px solid rgba(245, 158, 11, 0.4)',
                                    fontWeight: 600,
                                  }}
                                >
                                  ⏳ Pending
                                </span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {!u.approved && (
                                  <button
                                    className="btn btn-sm btn-primary"
                                    style={{
                                      background: '#10b981',
                                      borderColor: '#10b981',
                                      color: '#fff',
                                      fontWeight: 600,
                                    }}
                                    onClick={() => handleApproveUser(u.id)}
                                    title="Approve this user account so they can log in"
                                  >
                                    ✓ Approve
                                  </button>
                                )}
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
                                      {u.approved ? 'Delete' : 'Reject'}
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
          )}

          {/* TAB 3: OVERVIEW & REPORTS */}
          {activeTab === 'overview' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="card-title">📊 System Summary & Audit Report</h2>
                <button className="btn btn-secondary btn-sm" onClick={fetchData}>
                  🔄 Refresh Data
                </button>
              </div>
              <pre
                style={{
                  background: 'var(--surface-2)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius)',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.875rem',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                }}
              >
                {statsReport || 'Loading system analytics...'}
              </pre>
            </div>
          )}
        </main>
      </div>
      <Footer />

      {/* MODALS */}
      {showClassroomModal && (
        <CreateClassroomModal
          teachers={teachers}
          students={students}
          onClose={() => setShowClassroomModal(false)}
          onCreated={(newCourse) => {
            setCourses((prev) => [newCourse, ...prev]);
            setSuccess(`Classroom "${newCourse.title}" created successfully.`);
          }}
        />
      )}

      {showUserModal && (
        <CreateUserModal
          onClose={() => setShowUserModal(false)}
          onCreated={(newUser) => {
            setUsers((prev) => [newUser, ...prev]);
            setSuccess(`User "${newUser.username}" created successfully.`);
          }}
        />
      )}

      {selectedCourseForStudents && (
        <ClassroomStudentsModal
          course={selectedCourseForStudents}
          students={students}
          onClose={() => setSelectedCourseForStudents(null)}
          onUpdated={() => {
            setSuccess('Classroom student admissions updated.');
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
