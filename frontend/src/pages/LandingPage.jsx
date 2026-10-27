import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import client from '../api/client';

const LandingPage = () => {
  const { user, isTeacher, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    client.get('/courses')
      .then((res) => setCourses(res.data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, []);

  const getDashboardPath = () => {
    if (isAdmin?.()) return '/admin';
    if (isTeacher?.()) return '/teacher/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="lw-page-wrapper">
      <Navbar />

      <main className="lw-main-container">
        {/* ─── Hero Section: Clean Academic OCMS ──────────────────────── */}
        <section className="lw-hero-section">
          <div className="lw-hero-grid">
            
            {/* Left Column: Title, Subtitle, Actions */}
            <div className="lw-hero-content">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(84, 198, 184, 0.12)', border: '1px solid rgba(84, 198, 184, 0.3)', padding: '4px 12px', borderRadius: '9999px', width: 'fit-content', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem' }}>🎓</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent, #54c6b8)' }}>Institutional Course Platform</span>
              </div>

              <h1 className="lw-hero-title">
                Online Course Management System
              </h1>
              <p className="lw-hero-subtitle">
                A modern, role-based platform designed for educational institutions, instructors, and students.
                Create collaborative classrooms, distribute study materials, set assignment deadlines, and evaluate student submissions securely.
              </p>

              <div className="lw-hero-actions">
                <button
                  className="lw-hero-btn-primary"
                  onClick={() => navigate(user ? getDashboardPath() : '/login')}
                >
                  {user ? 'Go to Dashboard →' : 'Access Your Classroom'}
                </button>
                <a
                  href="#classrooms"
                  className="lw-hero-btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                >
                  Browse Classrooms ↓
                </a>
              </div>

              <div className="lw-hero-social-proof">
                <div className="lw-proof-avatars">
                  <span className="proof-av">🎓</span>
                  <span className="proof-av">👨‍🏫</span>
                  <span className="proof-av">⚙️</span>
                </div>
                <div className="lw-proof-text">
                  <strong>Role-Based Access Control</strong> for Students, Instructors, and System Administrators
                </div>
              </div>
            </div>

            {/* Right Column: Clean Academic Classroom Showcase Card */}
            <div className="ocms-showcase-container">
              <div className="ocms-preview-card">
                {/* Card Top Header */}
                <div className="ocms-preview-header">
                  <div className="ocms-preview-badge">
                    <span className="pulse-indicator" />
                    <span>Active Classroom Hub</span>
                  </div>
                  <span className="ocms-preview-code">CS-401 • Spring Term</span>
                </div>

                {/* Course Main Details */}
                <div className="ocms-preview-main">
                  <h3 className="ocms-preview-title">Full-Stack Software Engineering</h3>
                  <p className="ocms-preview-desc">
                    Enterprise web applications with Java Spring Boot, PostgreSQL, and React.
                  </p>
                  <div className="ocms-preview-meta">
                    <span>🗓 Mon / Wed / Fri 10:00 - 11:30 AM</span>
                    <span>👨‍🏫 Lead Instructor: Prakash & Co-Instructors</span>
                  </div>
                </div>

                {/* Live Functional Feature Highlights */}
                <div className="ocms-preview-features">
                  {/* Material Item */}
                  <div className="preview-row-item">
                    <div className="preview-icon-box blue">📖</div>
                    <div className="preview-row-content">
                      <div className="preview-row-title">Study Materials & Notes</div>
                      <div className="preview-row-sub">Syllabus Guide & Enterprise Architecture Notes published in DB</div>
                    </div>
                    <span className="preview-tag ready">Available</span>
                  </div>

                  {/* Assignment Item */}
                  <div className="preview-row-item">
                    <div className="preview-icon-box green">📝</div>
                    <div className="preview-row-content">
                      <div className="preview-row-title">Assignment with Deadline</div>
                      <div className="preview-row-sub">Database Entities & Security RBAC • Locked after due date</div>
                    </div>
                    <span className="preview-tag active">Active Submission</span>
                  </div>

                  {/* Evaluation Item */}
                  <div className="preview-row-item">
                    <div className="preview-icon-box purple">⭐</div>
                    <div className="preview-row-content">
                      <div className="preview-row-title">Evaluations & Feedback</div>
                      <div className="preview-row-sub">Graded: 96 / 100 • "Outstanding consensus algorithm implementation!"</div>
                    </div>
                    <span className="preview-tag graded">Graded</span>
                  </div>
                </div>

                {/* Preview Card Footer */}
                <div className="ocms-preview-footer">
                  <div className="preview-footer-stat">
                    <strong>2 Roles Active</strong>
                    <span>Instructor & Student</span>
                  </div>
                  <div className="preview-footer-stat">
                    <strong>PostgreSQL & Spring</strong>
                    <span>ACID & RBAC Secured</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ─── Classroom Catalog Section ──────────────────────────────── */}
        <section id="classrooms" className="lw-catalog-section" style={{ padding: '3.5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent, #54c6b8)', letterSpacing: '1px' }}>
              Educational Offerings
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginTop: '0.4rem' }}>
              Available Classrooms & Courses
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '0.95rem' }}>
              Explore active classrooms offered by our instructors. Enrolled students can access study materials, notes, and assignments.
            </p>
          </div>

          {loadingCourses ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏫</div>
              <div className="empty-title">No classrooms registered yet</div>
              <div className="empty-desc">Sign in as an instructor or admin to create the first classroom!</div>
            </div>
          ) : (
            <div className="course-grid">
              {courses.slice(0, 6).map((c) => (
                <div className="course-card" key={c.id}>
                  <div className="course-card-banner">🏫</div>
                  <div className="course-card-body">
                    <h3>{c.title}</h3>
                    <p>{c.description || 'No description provided.'}</p>
                    <div className="course-meta">
                      {c.schedule && <span>🗓 {c.schedule}</span>}
                      {c.instructors && c.instructors.length > 0 && (
                        <span>👨‍🏫 {c.instructors.map((i) => i.username || i.email).join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <div className="course-card-footer">
                    <button
                      className="btn btn-primary w-full"
                      onClick={() => navigate(user ? getDashboardPath() : '/login')}
                    >
                      {user ? 'Enter Classroom' : 'Sign in to Enroll'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── Core Key Features (Mapped directly to OCMS PDF) ─────────── */}
        <section id="features" className="lw-capabilities-section" style={{ background: 'var(--surface-2, #f8fafc)', padding: '4rem 2rem' }}>
          <div className="capabilities-header" style={{ maxWidth: '800px', margin: '0 auto 3rem', textAlign: 'center' }}>
            <span className="caps-pill">System Architecture</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginTop: '0.5rem' }}>
              Core Key Features from OCMS Specifications
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Fully satisfies all requirements outlined in the Online Course Management System specification.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* 1. User Management */}
            <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>👥</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>1. User Management</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Secure registration and authentication with Role-Based Access Control (RBAC) separating Students, Instructors, and System Administrators.
              </p>
              <ul style={{ marginTop: '0.75rem', paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text)', lineHeight: '1.6' }}>
                <li>Secure registration & encrypted passwords</li>
                <li>Granular permissions per role</li>
                <li>Admin user management & role promotion</li>
              </ul>
            </div>

            {/* 2. Course Management */}
            <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🏫</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>2. Course Management</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Instructors can create, edit, and manage classrooms including setting titles, descriptions, and class schedules.
              </p>
              <ul style={{ marginTop: '0.75rem', paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text)', lineHeight: '1.6' }}>
                <li>Classroom creation, updating, and deletion</li>
                <li>Multi-Instructor co-teaching support</li>
                <li>Flexible weekly lecture scheduling</li>
              </ul>
            </div>

            {/* 3. Enrollment */}
            <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🎓</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>3. Enrollment Management</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Students can browse courses, self-enroll, or be admitted directly by teachers/admins, and track their enrolled classrooms.
              </p>
              <ul style={{ marginTop: '0.75rem', paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text)', lineHeight: '1.6' }}>
                <li>One-click self-enrollment</li>
                <li>Teacher / Admin student admission & removal</li>
                <li>Dedicated "My Enrolled Courses" dashboard</li>
              </ul>
            </div>

            {/* 4. Material Management */}
            <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>📁</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>4. Material Management</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Instructors publish course materials including syllabus guides, lecture notes, and downloadable files for students.
              </p>
              <ul style={{ marginTop: '0.75rem', paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text)', lineHeight: '1.6' }}>
                <li>Direct in-database markdown/text lecture notes</li>
                <li>Downloadable file attachments (PDFs, docs)</li>
                <li>Student material access and interactive viewer</li>
              </ul>
            </div>

            {/* 5. Assignment Management */}
            <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>📝</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>5. Assignment & Submissions</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Instructors set assignments with due dates. Students submit answers online with full edit/delete privileges strictly until deadline.
              </p>
              <ul style={{ marginTop: '0.75rem', paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text)', lineHeight: '1.6' }}>
                <li>Due date tracking & automatic deadline locks</li>
                <li>Submission with repo links, text, or file uploads</li>
                <li>Instructor grading and feedback evaluation</li>
              </ul>
            </div>

            {/* 6. Security and Authorization */}
            <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🛡️</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>6. Security & Authorization</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Spring Security integration ensuring endpoints and operations are strictly protected by user role and classroom ownership.
              </p>
              <ul style={{ marginTop: '0.75rem', paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text)', lineHeight: '1.6' }}>
                <li>Stateless JWT token authentication</li>
                <li>Cross-classroom grading prevention</li>
                <li>PostgreSQL relational persistence</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ─── About OCMS Section ─────────────────────────────────────── */}
        <section id="about" style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>
            Built for Educational Academic Excellence
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', maxWidth: '780px', margin: '0 auto 2rem' }}>
            OCMS brings together university departments, faculty members, and students into a coherent academic environment.
            With clear ownership boundaries, transparent deadlines, and streamlined grading workflows, teaching and learning become focused and effective.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate(user ? getDashboardPath() : '/register')}
            >
              {user ? 'Open My Dashboard' : 'Get Started with OCMS'}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => navigate('/login')}
            >
              Sign In to Account
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
