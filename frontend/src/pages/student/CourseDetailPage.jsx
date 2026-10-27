import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';
import client from '../../api/client';
import { downloadAuthenticatedFile } from '../../utils/fileDownloader';
import ContentViewerModal from '../../components/material/ContentViewerModal';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [selectedViewingMaterial, setSelectedViewingMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [courseRes, matRes, assignRes, subRes] = await Promise.allSettled([
          client.get(`/courses/${courseId}`),
          client.get(`/courses/${courseId}/materials`),
          client.get(`/courses/${courseId}/assignments`),
          client.get('/submissions/me'),
        ]);
        if (courseRes.status === 'fulfilled') setCourse(courseRes.value.data);
        if (matRes.status === 'fulfilled') setMaterials(matRes.value.data || []);
        if (assignRes.status === 'fulfilled') setAssignments(assignRes.value.data || []);
        if (subRes.status === 'fulfilled') setMySubmissions(subRes.value.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [courseId]);

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="page-layout">
          <Sidebar />
          <main className="main-content">
            <div className="loading-spinner"><div className="spinner" /></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main className="main-content">
          <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate(-1)}>
            ← Back
          </button>

          {course && (
            <div className="page-header">
              <div>
                <h1 className="page-title">{course.title}</h1>
                <p className="page-subtitle">{course.description || 'No course description provided.'}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {course.schedule && (
                    <span className="badge badge-primary">🗓 Schedule: {course.schedule}</span>
                  )}
                  {course.instructors && course.instructors.length > 0 && (
                    <span className="badge badge-secondary">
                      👨‍🏫 Instructors: {course.instructors.map((i) => i.username || i.email).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Materials */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📁 Course Materials ({materials.length})</h2>
              </div>
              {materials.length === 0 ? (
                <p className="text-muted text-sm">No materials available for this course yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {materials.map((mat) => (
                    <div key={mat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '1.4rem' }}>{mat.contentData ? '📖' : mat.filePath?.endsWith('.pdf') ? '📄' : '🎬'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{mat.title}</span>
                          <span
                            style={{
                              background: mat.contentData ? 'rgba(0, 194, 168, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                              color: mat.contentData ? 'var(--accent, #00c2a8)' : 'var(--primary, #3b82f6)',
                              padding: '0.1rem 0.45rem',
                              borderRadius: '9999px',
                              fontSize: '0.68rem',
                              fontWeight: 600,
                            }}
                          >
                            {mat.contentType || (mat.contentData ? 'NOTE' : 'FILE')}
                          </span>
                        </div>
                        {mat.contentDescription && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{mat.contentDescription}</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {mat.contentData && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedViewingMaterial(mat)}
                            style={{ borderColor: 'var(--accent, #00c2a8)', color: 'var(--accent, #00c2a8)' }}
                          >
                            📖 Read Material
                          </button>
                        )}
                        {mat.filePath && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => downloadAuthenticatedFile(`/materials/${mat.id}/download`, mat.title)}
                          >
                            📥 Download
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assignments */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📝 Assignments ({assignments.length})</h2>
              </div>
              {assignments.length === 0 ? (
                <p className="text-muted text-sm">No assignments posted yet.</p>
              ) : (
                <div className="assignment-list">
                  {assignments.map((a) => {
                    const overdue = isOverdue(a.dueDate);
                    const sub = mySubmissions.find((s) => s.assignment?.id === a.id);
                    return (
                      <div className="assignment-item" key={a.id}>
                        <div className="assignment-info">
                          <h4>{a.title}</h4>
                          <p>{a.description}</p>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                            {a.dueDate && (
                              <div className={`due-date ${overdue ? 'overdue' : 'upcoming'}`}>
                                {overdue ? '⚠ Overdue: ' : '📅 Due: '}
                                {new Date(a.dueDate).toLocaleString()}
                              </div>
                            )}
                            {sub?.grade != null ? (
                              <span className="badge badge-success">Graded: {sub.grade}/100</span>
                            ) : sub ? (
                              <span className="badge badge-primary">Submitted {!overdue && '(Editable)'}</span>
                            ) : overdue ? (
                              <span className="badge badge-danger">Closed</span>
                            ) : (
                              <span className="badge badge-warning">Not Submitted</span>
                            )}
                          </div>
                        </div>
                        <button
                          className={`btn ${sub ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                          onClick={() => navigate(`/assignments/${a.id}/submit`)}
                        >
                          {overdue ? 'View Submission' : sub ? 'Edit Submission' : 'Submit'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <ContentViewerModal
        material={selectedViewingMaterial}
        onClose={() => setSelectedViewingMaterial(null)}
      />
      <Footer />
    </div>
  );
};

export default CourseDetailPage;
