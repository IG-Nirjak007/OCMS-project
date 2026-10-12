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
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get submissions to check if already submitted
        const subRes = await client.get('/submissions/me');
        const mySub = (subRes.data || []).find(
          (s) => s.assignment?.id === Number(assignmentId)
        );
        setMySubmission(mySub || null);
        if (mySub?.description) setDescription(mySub.description);
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
      const res = await client.post('/submissions', {
        assignmentId: Number(assignmentId),
        description,
        fileUrl,
      });
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

          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div className="page-header">
              <div>
                <h1 className="page-title">Submit Assignment</h1>
                <p className="page-subtitle">Assignment #{assignmentId}</p>
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
                    <label className="form-label">Description / Answer</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Describe your submission or write your answer..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">File URL (optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="https://drive.google.com/..."
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                    />
                    <span className="form-hint">Paste a Google Drive, GitHub, or other link to your file</span>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || !description.trim()}
                  >
                    {submitting ? 'Submitting...' : mySubmission ? 'Resubmit' : 'Submit Assignment'}
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