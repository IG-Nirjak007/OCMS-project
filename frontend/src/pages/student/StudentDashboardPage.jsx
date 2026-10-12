import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

const StudentDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, enrolledRes] = await Promise.all([
          client.get('/courses'),
          client.get('/enrollments'),
        ]);
        setAllCourses(allRes.data || []);
        setEnrolledIds((enrolledRes.data || []).map((c) => c.id));
      } catch (err) {
        setError('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await client.post('/enrollments', { courseId });
      setEnrolledIds((prev) => [...prev, courseId]);
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed.');
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
              <h1 className="page-title">Welcome back, {user?.username} 👋</h1>
              <p className="page-subtitle">Browse and enroll in available courses</p>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-icon indigo">📚</div>
              <div>
                <div className="stat-value">{allCourses.length}</div>
                <div className="stat-label">Available Courses</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div>
                <div className="stat-value">{enrolledIds.length}</div>
                <div className="stat-label">Enrolled Courses</div>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : allCourses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No courses yet</div>
              <div className="empty-desc">No courses have been created. Check back later!</div>
            </div>
          ) : (
            <div className="course-grid">
              {allCourses.map((course) => {
                const enrolled = enrolledIds.includes(course.id);
                return (
                  <div className="course-card" key={course.id}>
                    <div className="course-card-banner">
                      📖
                    </div>
                    <div className="course-card-body">
                      <h3>{course.title}</h3>
                      <p>{course.description || 'No description provided.'}</p>
                      <div className="course-meta">
                        {course.schedule && <span>🗓 {course.schedule}</span>}
                        {course.instructors && course.instructors.length > 0 && (
                          <span>👨‍🏫 {course.instructors.map(i => i.username || i.email).join(', ')}</span>
                        )}
                        {enrolled && <span className="badge badge-success">Enrolled</span>}
                      </div>
                    </div>
                    <div className="course-card-footer">
                      {enrolled ? (
                        <button
                          className="btn btn-secondary w-full"
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          View Course
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary w-full"
                          onClick={() => handleEnroll(course.id)}
                        >
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default StudentDashboardPage;