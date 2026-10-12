import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';
import client from '../../api/client';
import { downloadAuthenticatedFile } from '../../utils/fileDownloader';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [courseRes, matRes, assignRes] = await Promise.all([
          client.get(`/courses/${courseId}`),
          client.get(`/courses/${courseId}/materials`),
          client.get(`/courses/${courseId}/assignments`),
        ]);
        setCourse(courseRes.data);
        setMaterials(matRes.data || []);
        setAssignments(assignRes.data || []);
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
                    <div key={mat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      <span>{mat.filePath?.endsWith('.pdf') ? '📄' : '🎬'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{mat.title}</div>
                        {mat.contentDescription && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{mat.contentDescription}</div>
                        )}
                      </div>
                      {mat.filePath && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => downloadAuthenticatedFile(`/materials/${mat.id}/download`, mat.title)}
                        >
                          Download
                        </button>
                      )}
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
                  {assignments.map((a) => (
                    <div className="assignment-item" key={a.id}>
                      <div className="assignment-info">
                        <h4>{a.title}</h4>
                        <p>{a.description}</p>
                        {a.dueDate && (
                          <div className={`due-date ${isOverdue(a.dueDate) ? 'overdue' : 'upcoming'}`}>
                            {isOverdue(a.dueDate) ? '⚠ Overdue: ' : '📅 Due: '}
                            {new Date(a.dueDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/assignments/${a.id}/submit`)}
                      >
                        Submit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetailPage;
