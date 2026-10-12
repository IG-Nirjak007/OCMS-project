import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';
import client from '../../api/client';

const SubmitAssignmentPage = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignRes, subRes] = await Promise.allSettled([
          client.get(`/assignments/${assignmentId}`),
          client.get('/submissions/me'),
        ]);

        if (assignRes.status === 'fulfilled') {
          setAssignment(assignRes.value.data);
        }

        if (subRes.status === 'fulfilled') {
          const mySub = (subRes.value.data || []).find(
            (s) => s.assignment?.id === Number(assignmentId)
          );
          setMySubmission(mySub || null);
          if (mySub?.description) setDescription(mySub.description);
          if (mySub?.filePath && (mySub.filePath.startsWith('http://') || mySub.filePath.startsWith('https://'))) {
            setFileUrl(mySub.filePath);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      let res;
      if (fileToUpload) {
        const formData = new FormData();
        formData.append('assignmentId', assignmentId);
        formData.append('description', description);
        formData.append('file', fileToUpload);
        if (fileUrl) formData.append('fileUrl', fileUrl);
        res = await client.post('/submissions/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await client.post('/submissions', {
          assignmentId: Number(assignmentId),
          description,
          fileUrl,
        });
      }
      setMySubmission(res.data?.submission || res.data);
      setSuccess('Submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
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

          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div className="page-header">
              <div>
                <h1 className="page-title">{assignment?.title || `Assignment #${assignmentId}`}</h1>
                {assignment?.description && (
                  <p className="page-subtitle" style={{ marginTop: '0.25rem' }}>
                    {assignment.description}
                  </p>
                )}
                {assignment?.dueDate && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span className="badge badge-warning">
                      📅 Due: {new Date(assignment.dueDate).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Already graded */}
            {mySubmission?.grade != null && (
              <div className="alert alert-success mb-4">
                ✅ Graded: <strong>{mySubmission.grade}</strong>/100
                {mySubmission.feedback && (
                  <p style={{ marginTop: '0.4rem' }}>Feedback: {mySubmission.feedback}</p>
                )}
              </div>
            )}

            {success && <div className="alert alert-success mb-4">✓ {success}</div>}
            {error && <div className="alert alert-error mb-4">⚠ {error}</div>}

            {loading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : (
              <div className="card">
                <form onSubmit={handleSubmit} className="modal-form">
                  <div className="form-group">
                    <label className="form-label">Submission Description / Written Answer *</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Explain your approach, answer questions, or summarize work done..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Submission File (Optional)</label>
                    <input
                      type="file"
                      className="form-input"
                      onChange={(e) => setFileToUpload(e.target.files[0])}
                    />
                    <span className="form-hint">Upload a PDF, document, ZIP, or code file</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">External Resource URL (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="https://github.com/... or https://drive.google.com/..."
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                    />
                    <span className="form-hint">Paste a link to your repository or cloud drive</span>
                  </div>

                  {mySubmission?.filePath && (
                    <div className="mb-4" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                      Current file/link on record: <strong>{mySubmission.filePath}</strong>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || !description.trim()}
                  >
                    {submitting ? 'Submitting...' : mySubmission ? 'Update / Resubmit' : 'Submit Assignment'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SubmitAssignmentPage;