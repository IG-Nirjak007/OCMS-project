import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

const CreateCourseModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', description: '', schedule: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await client.post('/courses', form);
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Classroom</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error mb-4">{error}</div>}
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Course Title *</label>
            <input
              className="form-input"
              placeholder="e.g. Introduction to Computer Science"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Describe what this course covers..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Schedule</label>
            <input
              className="form-input"
              placeholder="e.g. Mon/Wed 10:00–11:30"
              value={form.schedule}
              onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TeacherDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    client.get('/courses')
      .then((res) => setMyCourses(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (courseId) => {
    if (!window.confirm('Delete this course? This is permanent.')) return;
    try {
      await client.delete(`/courses/${courseId}`);
      setMyCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">My Classrooms</h1>
              <p className="page-subtitle">Manage your courses, materials and assignments</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Create New Classroom
            </button>
          </div>

          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : (
            <>
              <h2 className="section-title" style={{ marginBottom: '1rem' }}>My Created Classrooms</h2>
              {myCourses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏫</div>
                  <div className="empty-title">No classrooms yet</div>
                  <div className="empty-desc">Click "Create New Classroom" to get started.</div>
                </div>
              ) : (
                <div className="course-grid">
                  {myCourses.map((course) => (
                    <div className="course-card" key={course.id}>
                      <div className="course-card-banner">🏫</div>
                      <div className="course-card-body">
                        <h3>{course.title}</h3>
                        <p>{course.description || 'No description.'}</p>
                        <div className="course-meta">
                          {course.schedule && <span>🗓 {course.schedule}</span>}
                          {course.instructors && course.instructors.length > 0 && (
                            <span>👨‍🏫 {course.instructors.map(i => i.username || i.email).join(', ')}</span>
                          )}
                        </div>
                      </div>
                      <div className="course-card-footer" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/courses/${course.id}/materials`)}
                        >
                          View Classroom
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(course.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <Footer />
      {showModal && (
        <CreateCourseModal
          onClose={() => setShowModal(false)}
          onCreated={(course) => setMyCourses((prev) => [course, ...prev])}
        />
      )}
    </div>
  );
};

export default TeacherDashboardPage;
