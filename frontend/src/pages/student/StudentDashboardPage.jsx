import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

const StudentDashboardPage = () => {
  const { user, isTeacher, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [allRes, enrolledRes] = await Promise.allSettled([
        client.get('/courses'),
        client.get('/enrollments'),
      ]);

      if (allRes.status === 'fulfilled' && Array.isArray(allRes.value.data)) {
        setAllCourses(allRes.value.data);
      } else {
        setAllCourses([]);
        if (allRes.status === 'rejected') {
          console.error('[ClassroomCatalog] Failed to fetch courses:', allRes.reason);
          setError('Could not reach course server. Please ensure the backend is running.');
        }
      }

      if (enrolledRes.status === 'fulfilled' && Array.isArray(enrolledRes.value.data)) {
        setEnrolledIds(enrolledRes.value.data.map((c) => c.id));
      } else {
        setEnrolledIds([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await client.post('/enrollments', { courseId });
      setEnrolledIds((prev) => [...prev, courseId]);
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed.');
    }
  };

  const isTaughtByMe = (course) => {
    return course.instructors?.some(
      (i) => i.id === user?.id || (user?.email && i.email?.toLowerCase() === user?.email?.toLowerCase())
    );
  };

  const filteredCourses = allCourses.filter((course) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const titleMatch = course.title?.toLowerCase().includes(q);
    const descMatch = course.description?.toLowerCase().includes(q);
    const instructorMatch = course.instructors?.some((i) => i.username?.toLowerCase().includes(q));
    return titleMatch || descMatch || instructorMatch;
  });

  const isFacultyOrAdmin = isTeacher?.() || isAdmin?.();

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title">
                {isFacultyOrAdmin ? 'Classroom Catalog 🏫' : `Welcome back, ${user?.username || 'Student'} 👋`}
              </h1>
              <p className="page-subtitle">
                {isFacultyOrAdmin
                  ? 'Browse all live platform classrooms, curriculum offerings, and institutional courses'
                  : 'Browse and enroll in available academic courses'}
              </p>
            </div>
            {isTeacher?.() && (
              <button className="btn btn-primary" onClick={() => navigate('/teacher/dashboard')}>
                👨‍🏫 Go to Teacher Studio
              </button>
            )}
            {isAdmin?.() && (
              <button className="btn btn-primary" onClick={() => navigate('/admin')}>
                ⚙️ Admin Command Center
              </button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-icon indigo">📚</div>
              <div>
                <div className="stat-value">{allCourses.length}</div>
                <div className="stat-label">Available Classrooms</div>
              </div>
            </div>

            {isTeacher?.() ? (
              <div className="stat-card">
                <div className="stat-icon orange">🏫</div>
                <div>
                  <div className="stat-value">{allCourses.filter(isTaughtByMe).length}</div>
                  <div className="stat-label">My Taught Classrooms</div>
                </div>
              </div>
            ) : (
              <div className="stat-card">
                <div className="stat-icon green">✅</div>
                <div>
                  <div className="stat-value">{enrolledIds.length}</div>
                  <div className="stat-label">Enrolled Classrooms</div>
                </div>
              </div>
            )}
          </div>

          {/* Search & Refresh Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search by course title, topic, or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '420px' }}
            />
            <button className="btn btn-ghost btn-sm" onClick={fetchData} disabled={loading}>
              🔄 Refresh Catalog
            </button>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠ {error}</div>}

          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : filteredCourses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No classrooms found</div>
              <div className="empty-desc">
                {search ? 'Try adjusting your search keywords.' : 'No active classrooms are currently available in the system.'}
              </div>
            </div>
          ) : (
            <div className="course-grid">
              {filteredCourses.map((course) => {
                const enrolled = enrolledIds.includes(course.id);
                const taught = isTaughtByMe(course);

                return (
                  <div className="course-card" key={course.id}>
                    <div className="course-card-banner">📖</div>
                    <div className="course-card-body">
                      <h3>{course.title}</h3>
                      <p>{course.description || 'No description provided.'}</p>
                      <div className="course-meta">
                        {course.schedule && <span>🗓 {course.schedule}</span>}
                        {course.instructors && course.instructors.length > 0 && (
                          <span>👨‍🏫 {course.instructors.map((i) => i.username || i.email).join(', ')}</span>
                        )}
                        {taught && <span className="badge badge-success">Instructor</span>}
                        {enrolled && !taught && <span className="badge badge-success">Enrolled</span>}
                      </div>
                    </div>
                    <div className="course-card-footer">
                      {isFacultyOrAdmin && taught ? (
                        <button
                          className="btn btn-primary w-full"
                          onClick={() => navigate(`/courses/${course.id}/materials`)}
                        >
                          Manage Classroom 👨‍🏫
                        </button>
                      ) : isFacultyOrAdmin ? (
                        <button
                          className="btn btn-secondary w-full"
                          onClick={() => navigate(`/courses/${course.id}/materials`)}
                        >
                          View / Co-Teach Course
                        </button>
                      ) : enrolled ? (
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