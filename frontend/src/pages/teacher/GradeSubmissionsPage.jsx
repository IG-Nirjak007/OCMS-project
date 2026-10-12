import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';
import client from '../../api/client';
import { downloadAuthenticatedFile } from '../../utils/fileDownloader';

const GradeSubmissionsPage = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      const res = await client.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (e, subId) => {
    e.preventDefault();
    try {
      await client.put(`/submissions/${subId}/grade`, {
        grade: Number(gradeScore),
        feedback: gradeFeedback,
      });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, grade: Number(gradeScore), feedback: gradeFeedback } : s))
      );
      setGradingId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit grade.');
    }
  };

  const startGrading = (sub) => {
    setGradingId(sub.id);
    setGradeScore(sub.grade || '');
    setGradeFeedback(sub.feedback || '');
  };

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-layout">
        <Sidebar />
        <main className="main-content">
          <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className="page-header">
            <div>
              <h1 className="page-title">Submissions</h1>
              <p className="page-subtitle">Grade student submissions for assignment #{assignmentId}</p>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No submissions yet</div>
              <div className="empty-desc">Students haven't submitted anything for this assignment.</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Submitted At</th>
                    <th>Answer / Link</th>
                    <th>Grade</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{sub.student?.username || `User ${sub.student?.id}`}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{sub.student?.email}</div>
                      </td>
                      <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                      <td style={{ maxWidth: '200px' }}>
                        <div className="truncate" title={sub.description}>{sub.description || '-'}</div>
                        {(sub.filePath || sub.fileUrl) && (
                          <div style={{ marginTop: '0.25rem' }}>
                            {((sub.filePath || sub.fileUrl).startsWith('http://') || (sub.filePath || sub.fileUrl).startsWith('https://')) ? (
                              <a href={sub.filePath || sub.fileUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '0.1rem 0.4rem', fontSize: 'var(--font-size-xs)' }}>
                                🔗 Open Link
                              </a>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.1rem 0.4rem', fontSize: 'var(--font-size-xs)' }}
                                onClick={() => downloadAuthenticatedFile(`/submissions/${sub.id}/download`, `submission_${sub.student?.username || sub.id}`)}
                              >
                                📥 Download File
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        {sub.grade !== null ? (
                          <span className="badge badge-success">{sub.grade}/100</span>
                        ) : (
                          <span className="badge badge-warning">Pending</span>
                        )}
                      </td>
                      <td>
                        {gradingId === sub.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '250px' }}>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="Score (0-100)"
                              value={gradeScore}
                              onChange={(e) => setGradeScore(e.target.value)}
                            />
                            <textarea
                              className="form-textarea"
                              placeholder="Feedback..."
                              value={gradeFeedback}
                              onChange={(e) => setGradeFeedback(e.target.value)}
                              rows={2}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-success btn-sm flex-1" onClick={(e) => handleGradeSubmit(e, sub.id)}>Save</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setGradingId(null)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button className="btn btn-secondary btn-sm" onClick={() => startGrading(sub)}>
                            {sub.grade !== null ? 'Edit Grade' : 'Grade'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default GradeSubmissionsPage;