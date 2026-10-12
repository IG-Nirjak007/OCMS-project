import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';
import client from '../../api/client';

const MyCoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/enrollments')
      .then((res) => setCourses(res.data || []))
      .catch(() => setError('Failed to load enrolled courses.'))
      .finally(() => setLoading(false));
  }, []);

  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) return;
    try {
      await client.delete(`/enrollments/${courseId}`);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unenroll.');
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
              <h1 className="page-title">My Enrolled Courses</h1>
              <p className="page-subtitle">Courses you are currently enrolled in</p>
            </div>
          </div>

          {error && <div className="alert alert-error mb-4">{error}</div>}

          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <div className="empty-title">No enrolled courses</div>
              <div className="empty-desc">
                You haven't enrolled in any courses yet. Explore available courses!
              </div>
              <button className="btn btn-primary mt-4" onClick={() => navigate('/student/dashboard')}>
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="course-grid">
              {courses.map((course) => (
                <div className="course-card" key={course.id}>
                  <div className="course-card-banner">📖</div>
                  <div className="course-card-body">
                    <h3>{course.title}</h3>
                    <p>{course.description || 'No description.'}</p>
                    {course.schedule && (
                      <div className="course-meta">
                        <span>🗓 {course.schedule}</span>
                      </div>
                    )}
                  </div>
                  <div className="course-card-footer" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleUnenroll(course.id)}
                    >
                      Leave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MyCoursesPage;