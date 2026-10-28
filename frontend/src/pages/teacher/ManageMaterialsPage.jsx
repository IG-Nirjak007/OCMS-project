import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { downloadAuthenticatedFile } from '../../utils/fileDownloader';
import ContentViewerModal from '../../components/material/ContentViewerModal';

const ManageMaterialsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAuth();

  // Active sub-navigation tab: 'materials' | 'assignments' | 'students' | 'instructors'
  const initialTab = searchParams.get('tab') || 'materials';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Material Form State & Content Viewer
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matContentData, setMatContentData] = useState('');
  const [matContentType, setMatContentType] = useState('NOTE');
  const [matFile, setMatFile] = useState(null);
  const [selectedViewingMaterial, setSelectedViewingMaterial] = useState(null);
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

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const fetchCourseData = async () => {
    try {
      const [cRes, mRes, aRes, eRes, uRes] = await Promise.allSettled([
        client.get(`/courses/${courseId}`),
        client.get(`/courses/${courseId}/materials`),
        client.get(`/courses/${courseId}/assignments`),
        client.get(`/enrollments/course/${courseId}`),
        client.get('/users/students'),
      ]);
      if (cRes.status === 'fulfilled') setCourse(cRes.value.data);
      if (mRes.status === 'fulfilled') setMaterials(mRes.value.data || []);
      if (aRes.status === 'fulfilled') setAssignments(aRes.value.data || []);
      if (eRes.status === 'fulfilled') setEnrollments(eRes.value.data || []);
      if (uRes.status === 'fulfilled') setAllStudents(uRes.value.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Student Enrollment Handlers ---
  const handleAdmitStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setStudentLoading(true);
    setActionMessage('');
    try {
      await client.post(`/enrollments/course/${courseId}/students/${selectedStudentId}`);
      setActionMessage('Student admitted to classroom successfully.');
      setSelectedStudentId('');
      const eRes = await client.get(`/enrollments/course/${courseId}`);
      setEnrollments(eRes.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to admit student.');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Remove this student from the classroom?')) return;
    try {
      await client.delete(`/enrollments/course/${courseId}/students/${studentId}`);
      setEnrollments(enrollments.filter((e) => e.student?.id !== studentId));
      setActionMessage('Student removed from classroom.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove student.');
    }
  };

  // --- Material Handlers ---
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!matFile && !matContentData.trim()) {
      return alert('Please enter text content to save in the database or select a file to upload.');
    }
    setMatLoading(true);
    setActionMessage('');
    try {
      const formData = new FormData();
      formData.append('title', matTitle);
      if (matDesc) formData.append('description', matDesc);
      if (matContentData.trim()) formData.append('contentData', matContentData.trim());
      formData.append('contentType', matContentType);
      if (matFile) formData.append('file', matFile);

      const res = await client.post(`/courses/${courseId}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMaterials([...materials, res.data]);
      setMatTitle('');
      setMatDesc('');
      setMatContentData('');
      setMatContentType('NOTE');
      setMatFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setActionMessage('Course material and content saved to database successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save material.');
    } finally {
      setMatLoading(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await client.delete(`/materials/${id}`);
      setMaterials(materials.filter((m) => m.id !== id));
      setActionMessage('Material deleted.');
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  // --- Assignment Handlers ---
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
      setActionMessage('Assignment deleted.');
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  // --- Instructor Handlers ---
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
          <button
            className="btn btn-ghost btn-sm mb-4"
            onClick={() => navigate(isAdmin?.() ? '/admin' : '/teacher/dashboard')}
          >
            ← Back to {isAdmin?.() ? 'Admin Dashboard' : 'Teacher Dashboard'}
          </button>

          <div className="page-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 className="page-title">{course?.title}</h1>
                <span className="badge badge-primary">Classroom Hub</span>
              </div>
              <p className="page-subtitle">
                {course?.description || 'Manage curriculum materials, assignments, deadlines, enrolled students, and teaching staff.'}
              </p>
            </div>
          </div>

          {actionMessage && <div className="alert alert-success mb-4">✓ {actionMessage}</div>}

          {/* Sub-Navigation Bar for Classroom Management */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '2px solid var(--border)',
              marginBottom: '1.75rem',
              overflowX: 'auto',
              paddingBottom: '0.25rem',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'materials' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => switchTab('materials')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius) var(--radius) 0 0' }}
            >
              <span>📁</span>
              <span>Study Materials & DB Content</span>
              <span style={{
                background: activeTab === 'materials' ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
              }}>
                {materials.length}
              </span>
            </button>

            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'assignments' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => switchTab('assignments')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius) var(--radius) 0 0' }}
            >
              <span>📝</span>
              <span>Assignments & Deadlines</span>
              <span style={{
                background: activeTab === 'assignments' ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
              }}>
                {assignments.length}
              </span>
            </button>

            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'students' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => switchTab('students')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius) var(--radius) 0 0' }}
            >
              <span>🎓</span>
              <span>Admitted Students</span>
              <span style={{
                background: activeTab === 'students' ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
              }}>
                {enrollments.length}
              </span>
            </button>

            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'instructors' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => switchTab('instructors')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius) var(--radius) 0 0' }}
            >
              <span>👨‍🏫</span>
              <span>Teaching Staff</span>
              <span style={{
                background: activeTab === 'instructors' ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
              }}>
                {course?.instructors?.length || 0}
              </span>
            </button>
          </div>

          {/* TAB 1: MATERIALS & IN-DB CONTENT */}
          {activeTab === 'materials' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: '1.75rem', alignItems: 'start' }}>
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="card-title">📁 Classroom Materials & Database Content</h2>
                    <p className="text-muted text-sm">Notes, articles, syllabi, and downloadable documents</p>
                  </div>
                </div>

                {materials.length === 0 ? (
                  <div className="empty-state py-8">
                    <div className="empty-icon">📁</div>
                    <div className="empty-title">No Materials Uploaded Yet</div>
                    <div className="empty-desc">Use the form on the right to post lecture notes or upload slides/PDFs.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {materials.map((mat) => (
                      <div
                        key={mat.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem',
                          background: 'var(--surface-2)',
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div style={{ fontSize: '1.75rem' }}>
                          {mat.contentData ? '📖' : mat.filePath?.endsWith('.pdf') ? '📄' : '🎬'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600 }}>{mat.title}</span>
                            <span
                              style={{
                                background: mat.contentData ? 'rgba(0, 194, 168, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                color: mat.contentData ? 'var(--accent, #00c2a8)' : 'var(--primary, #3b82f6)',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '9999px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                              }}
                            >
                              {mat.contentType || (mat.contentData ? 'NOTE' : 'FILE')}
                            </span>
                            {mat.contentData && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• Stored in DB</span>
                            )}
                          </div>
                          {mat.contentDescription && (
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              {mat.contentDescription}
                            </div>
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
                              📖 View Content
                            </button>
                          )}
                          {mat.filePath && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => downloadAuthenticatedFile(`/materials/${mat.id}/download`, mat.title)}
                            >
                              📥 Download
                            </button>
                          )}
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMaterial(mat.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Material / Content Form */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Add New Material / In-DB Note</h3>
                  <p className="text-muted text-sm">Save reading notes directly to PostgreSQL DB, upload files, or both</p>
                </div>
                <form onSubmit={handleMaterialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Material Title *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Chapter 3: Relational Algebra & SQL"
                      value={matTitle}
                      onChange={(e) => setMatTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Content Category</label>
                    <select
                      className="form-input"
                      value={matContentType}
                      onChange={(e) => setMatContentType(e.target.value)}
                    >
                      <option value="NOTE">Lecture Notes / Summary (DB Stored)</option>
                      <option value="ARTICLE">Reading Guide / Article (DB Stored)</option>
                      <option value="SYLLABUS">Course Syllabus (DB Stored)</option>
                      <option value="FILE">File Attachment (PDF / Slides / Media)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description / Summary (Optional)</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Brief overview of what students will learn..."
                      value={matDesc}
                      onChange={(e) => setMatDesc(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Direct Database Content Text (Saved in PostgreSQL)</span>
                      <span style={{ color: 'var(--accent, #00c2a8)', fontSize: 'var(--font-size-xs)' }}>Interactive Reader</span>
                    </label>
                    <textarea
                      className="form-textarea"
                      placeholder="Write or paste reading text, lesson content, markdown notes, code snippets, or syllabus here..."
                      value={matContentData}
                      onChange={(e) => setMatContentData(e.target.value)}
                      rows={5}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Optional File Attachment (PDF, slides, video)</label>
                    <input
                      type="file"
                      className="form-input"
                      ref={fileInputRef}
                      onChange={(e) => setMatFile(e.target.files[0])}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={matLoading}>
                    {matLoading ? 'Saving...' : '💾 Save Material to Database'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNMENTS & DEADLINES */}
          {activeTab === 'assignments' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: '1.75rem', alignItems: 'start' }}>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">📝 Assignments & Submissions ({assignments.length})</h2>
                  <p className="text-muted text-sm">Create course assignments, enforce deadlines, and grade student submissions</p>
                </div>

                {assignments.length === 0 ? (
                  <div className="empty-state py-8">
                    <div className="empty-icon">📝</div>
                    <div className="empty-title">No Assignments Created</div>
                    <div className="empty-desc">Create your first assignment using the form on the right.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {assignments.map((asg) => {
                      const isPast = asg.dueDate && new Date(asg.dueDate) < new Date();
                      return (
                        <div
                          key={asg.id}
                          style={{
                            padding: '1.25rem',
                            background: 'var(--surface-2)',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{asg.title}</h3>
                              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                {asg.description}
                              </p>
                            </div>
                            <span className={`badge ${isPast ? 'badge-danger' : 'badge-warning'}`}>
                              {isPast ? 'Deadline Passed' : 'Active Assignment'}
                            </span>
                          </div>

                          {asg.dueDate && (
                            <div style={{ fontSize: 'var(--font-size-xs)', color: isPast ? 'var(--danger)' : 'var(--warning)', marginBottom: '0.85rem' }}>
                              📅 Due Date: {new Date(asg.dueDate).toLocaleString()}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => navigate(`/assignments/${asg.id}/grade`)}
                            >
                              📊 Grade Student Submissions
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAssignment(asg.id)}>
                              Delete Assignment
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add Assignment Form */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Add New Assignment</h3>
                  <p className="text-muted text-sm">Post new project prompts or homework with a submission deadline</p>
                </div>
                <form onSubmit={handleAssignmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Assignment Title *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Midterm Project: Database Normalization"
                      value={asgTitle}
                      onChange={(e) => setAsgTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Instructions & Rubric *</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Specify requirements, deliverables, grading criteria..."
                      value={asgDesc}
                      onChange={(e) => setAsgDesc(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Date & Time (Deadline)</label>
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
          )}

          {/* TAB 3: ADMITTED STUDENTS ROSTER */}
          {activeTab === 'students' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 className="card-title">🎓 Admitted Classroom Students ({enrollments.length})</h2>
                  <p className="text-muted text-sm">Manage student enrollment, admissions, and platform access to this course</p>
                </div>

                {/* Admit Student Form in Header */}
                {allStudents.length > 0 && (
                  <form onSubmit={handleAdmitStudent} style={{ display: 'flex', gap: '0.5rem', minWidth: '320px' }}>
                    <select
                      className="form-input"
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      required
                    >
                      <option value="">-- Select Student to Admit --</option>
                      {allStudents
                        .filter((s) => !enrollments.some((e) => e.student?.id === s.id))
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.username} ({s.email})
                          </option>
                        ))}
                    </select>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={studentLoading || !selectedStudentId}>
                      {studentLoading ? 'Admitting...' : '+ Admit'}
                    </button>
                  </form>
                )}
              </div>

              {enrollments.length === 0 ? (
                <div className="empty-state py-8">
                  <div className="empty-icon">🎓</div>
                  <div className="empty-title">No Students Admitted Yet</div>
                  <div className="empty-desc">Select a student from the dropdown above to admit them to this classroom.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {enrollments.map((enr) => (
                    <div
                      key={enr.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: 'var(--surface-2)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1rem',
                        }}>
                          {enr.student?.username ? enr.student.username.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                            {enr.student?.username || `Student #${enr.student?.id}`}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                            {enr.student?.email}
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)', padding: '0.3rem 0.6rem' }}
                        title="Remove student from classroom"
                        onClick={() => handleRemoveStudent(enr.student?.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TEACHING STAFF & CO-INSTRUCTORS */}
          {activeTab === 'instructors' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 className="card-title">👨‍🏫 Course Teaching Staff & Co-Instructors</h2>
                  <p className="text-muted text-sm">Instructors who have access to manage materials and grade this course</p>
                </div>

                {/* Add Co-Instructor Form */}
                <form onSubmit={handleAddCoInstructor} style={{ display: 'flex', gap: '0.5rem', minWidth: '320px' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Instructor email address..."
                    value={coInstructorEmail}
                    onChange={(e) => setCoInstructorEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={coInstructorLoading}>
                    {coInstructorLoading ? 'Adding...' : '+ Add Faculty'}
                  </button>
                </form>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {course?.instructors && course.instructors.length > 0 ? (
                  course.instructors.map((inst, index) => (
                    <div
                      key={inst.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: 'var(--surface-2)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: index === 0 ? 'rgba(0, 194, 168, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                          color: index === 0 ? 'var(--accent, #00c2a8)' : 'var(--primary, #3b82f6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1rem',
                        }}>
                          👨‍🏫
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                            {inst.username} {index === 0 && <span className="badge badge-success" style={{ marginLeft: '0.35rem', fontSize: '0.65rem' }}>Lead</span>}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                            {inst.email}
                          </div>
                        </div>
                      </div>

                      {course.instructors.length > 1 && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)', padding: '0.3rem 0.6rem' }}
                          title="Remove co-instructor"
                          onClick={() => handleRemoveCoInstructor(inst.id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-sm">No instructors listed.</p>
                )}
              </div>
            </div>
          )}
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

export default ManageMaterialsPage;