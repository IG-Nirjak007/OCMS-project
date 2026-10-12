import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';
import client from '../../api/client';
import { downloadAuthenticatedFile } from '../../utils/fileDownloader';

const ManageMaterialsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Material Form State
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matFile, setMatFile] = useState(null);
  const fileInputRef = useRef(null);
  const [matLoading, setMatLoading] = useState(false);

  // Assignment Form State
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('');
  const [asgLoading, setAsgLoading] = useState(false);

  // Co-Instructor Form State
  const [coInstructorEmail, setCoInstructorEmail] = useState('');
  const [coInstructorLoading, setCoInstructorLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [cRes, mRes, aRes] = await Promise.all([
        client.get(`/courses/${courseId}`),
        client.get(`/courses/${courseId}/materials`),
        client.get(`/courses/${courseId}/assignments`),
      ]);
      setCourse(cRes.data);
      setMaterials(mRes.data || []);
      setAssignments(aRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!matFile) return alert('Please select a file');
    setMatLoading(true);
    setActionMessage('');
    try {
      const formData = new FormData();
      formData.append('title', matTitle);
      if (matDesc) formData.append('description', matDesc);
      formData.append('file', matFile);
      const res = await client.post(`/courses/${courseId}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMaterials([...materials, res.data]);
      setMatTitle('');
      setMatDesc('');
      setMatFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setActionMessage('Material uploaded successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload material.');
    } finally {
      setMatLoading(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await client.delete(`/materials/${id}`);
      setMaterials(materials.filter((m) => m.id !== id));
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setAsgLoading(true);
    setActionMessage('');
    try {
      const payload = {
        title: asgTitle,
        description: asgDesc,
        courseId: Number(courseId),
        dueDate: asgDueDate ? new Date(asgDueDate).toISOString() : null,
      };
      const res = await client.post('/assignments', payload);
      setAssignments([...assignments, res.data]);
      setAsgTitle('');
      setAsgDesc('');
      setAsgDueDate('');
      setActionMessage('Assignment created successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setAsgLoading(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Delete this assignment? Submissions will also be removed.')) return;
    try {
      await client.delete(`/assignments/${id}`);
      setAssignments(assignments.filter((a) => a.id !== id));
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  const handleAddCoInstructor = async (e) => {
    e.preventDefault();
    if (!coInstructorEmail.trim()) return;
    setCoInstructorLoading(true);
    setActionMessage('');
    try {
      const res = await client.post(`/courses/${courseId}/instructors`, { email: coInstructorEmail.trim() });
      setCourse(res.data);
      setCoInstructorEmail('');
      setActionMessage('Co-instructor added successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add co-instructor. Make sure the email belongs to an existing instructor.');
    } finally {
      setCoInstructorLoading(false);
    }
  };

  const handleRemoveCoInstructor = async (instructorId) => {
    if (!window.confirm('Remove this co-instructor from the course?')) return;
    try {
      const res = await client.delete(`/courses/${courseId}/instructors/${instructorId}`);
      setCourse(res.data);
      setActionMessage('Co-instructor removed.');
    } catch (err) {
      alert('Failed to remove co-instructor.');
    }
  };

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
          <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate('/teacher/dashboard')}>
            ← Back to Dashboard
          </button>

          <div className="page-header">
            <div>
              <h1 className="page-title">{course?.title} - Management</h1>
              <p className="page-subtitle">Manage curriculum materials, assignments, and teaching staff</p>
            </div>
          </div>

          {actionMessage && <div className="alert alert-success mb-4">✓ {actionMessage}</div>}

          {/* Co-Instructors Section */}
          <div className="card mb-6">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="card-title">👨‍🏫 Course Teaching Staff & Co-Instructors</h2>
                <p className="text-muted text-sm">Collaborative teaching team for this course</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {course?.instructors && course.instructors.length > 0 ? (
                course.instructors.map((inst) => (
                  <div
                    key={inst.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span>👤</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{inst.username}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{inst.email}</div>
                    </div>
                    {course.instructors.length > 1 && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)', padding: '0.2rem 0.4rem', marginLeft: '0.5rem' }}
                        title="Remove co-instructor"
                        onClick={() => handleRemoveCoInstructor(inst.id)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted text-sm">No instructors listed.</p>
              )}
            </div>

            <form onSubmit={handleAddCoInstructor} style={{ display: 'flex', gap: '0.75rem', maxWidth: '480px' }}>
              <input
                type="email"
                className="form-input"
                placeholder="Enter co-instructor email..."
                value={coInstructorEmail}
                onChange={(e) => setCoInstructorEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-secondary" disabled={coInstructorLoading}>
                {coInstructorLoading ? 'Adding...' : '+ Add Co-Instructor'}
              </button>
            </form>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '2rem', alignItems: 'start' }}>
            {/* Left Column: Materials */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">📁 Materials ({materials.length})</h2>
                </div>
                {materials.length === 0 ? (
                  <p className="text-muted text-sm text-center py-4">No materials uploaded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {materials.map((mat) => (
                      <div key={mat.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '1.5rem' }}>{mat.filePath?.endsWith('.pdf') ? '📄' : '🎬'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{mat.title}</div>
                          {mat.contentDescription && (
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{mat.contentDescription}</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {mat.filePath && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => downloadAuthenticatedFile(`/materials/${mat.id}/download`, mat.title)}
                            >
                              Download
                            </button>
                          )}
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMaterial(mat.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Material Form */}
              <div className="card">
                <h3 className="card-title mb-4">Add New Material</h3>
                <form onSubmit={handleMaterialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input
                    className="form-input"
                    placeholder="Material Title"
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    required
                  />
                  <textarea
                    className="form-textarea"
                    placeholder="Content description or notes (Optional)"
                    value={matDesc}
                    onChange={(e) => setMatDesc(e.target.value)}
                    rows={2}
                  />
                  <input
                    type="file"
                    className="form-input"
                    ref={fileInputRef}
                    onChange={(e) => setMatFile(e.target.files[0])}
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={matLoading}>
                    {matLoading ? 'Uploading...' : 'Upload Material'}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Assignments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">📝 Assignments ({assignments.length})</h2>
                </div>
                {assignments.length === 0 ? (
                  <p className="text-muted text-sm text-center py-4">No assignments created yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {assignments.map((asg) => (
                      <div key={asg.id} style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{asg.title}</div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{asg.description}</p>
                        {asg.dueDate && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--warning)', marginBottom: '0.75rem' }}>
                            Due: {new Date(asg.dueDate).toLocaleString()}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary btn-sm flex-1" onClick={() => navigate(`/assignments/${asg.id}/grade`)}>
                            Grade Subs
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAssignment(asg.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Assignment Form */}
              <div className="card">
                <h3 className="card-title mb-4">Add New Assignment</h3>
                <form onSubmit={handleAssignmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input
                    className="form-input"
                    placeholder="Assignment Title"
                    value={asgTitle}
                    onChange={(e) => setAsgTitle(e.target.value)}
                    required
                  />
                  <textarea
                    className="form-textarea"
                    placeholder="Description"
                    value={asgDesc}
                    onChange={(e) => setAsgDesc(e.target.value)}
                    rows={3}
                    required
                  />
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={asgDueDate}
                      onChange={(e) => setAsgDueDate(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={asgLoading}>
                    {asgLoading ? 'Creating...' : 'Create Assignment'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ManageMaterialsPage;