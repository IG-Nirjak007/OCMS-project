import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import courseService from '../../services/courseService';
import materialService from '../../services/materialService';
import assignmentService from '../../services/assignmentService';

const ClassroomDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    
    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [enrollments, setEnrollments] = useState([]);

    useEffect(() => {
        const fetchAll = async () => {
            const c = await courseService.getCourseById(id);
            setCourse(c);
            const m = await materialService.getMaterialsByCourse(id);
            setMaterials(m);
            const a = await assignmentService.getAssignmentsByCourse(id);
            setAssignments(a);
            
            if (hasRole('TEACHER')) {
                const e = await courseService.getEnrollmentsByCourse(id);
                setEnrollments(e);
            }
        };
        fetchAll();
    }, [id, hasRole]);

    if (!course) return <div>Loading...</div>;

    const isTeacher = hasRole('TEACHER');

    return (
        <div className="classroom-detail-page">
            <button className="btn-back" onClick={() => navigate('/classroom')}>← Back</button>
            
            <div className="detail-layout">
                {/* Sidebar */}
                <div className="detail-sidebar">
                    <div className="info-card">
                        <p><strong>Teacher:</strong> {course.instructors?.[0]?.username || 'N/A'}</p>
                        <p><strong>Created:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                    
                    {isTeacher && (
                        <div className="teacher-actions">
                            <button className="btn-primary">Update Course</button>
                            <button className="btn-danger">Delete Course</button>
                            <button className="btn-secondary">Add Teacher</button>
                        </div>
                    )}

                    {isTeacher && (
                        <div className="enrolled-users-card">
                            <h3>Enrolled Users ({enrollments.length})</h3>
                            <div className="user-list">
                                {enrollments.map(e => (
                                    <div key={e.id} className="user-list-item">
                                        <div className="user-info">
                                            <p className="name">{e.student.username}</p>
                                            <span className="badge-role">Student</span>
                                            <p className="id">ID: {e.student.id}</p>
                                        </div>
                                        <button className="btn-danger-sm">Remove</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="detail-main">
                    <div className="content-card materials-card">
                        <h3>Materials ({materials.length})</h3>
                        <div className="list">
                            {materials.length > 0 ? materials.map(m => (
                                <div key={m.id}>{m.title}</div>
                            )) : <p className="empty-text">No materials available</p>}
                        </div>
                        
                        {isTeacher && (
                            <div className="add-form mt-4">
                                <h4>Add New Material</h4>
                                <input type="text" placeholder="Material Title" className="input" />
                                <textarea placeholder="Description" className="input"></textarea>
                                <input type="file" className="input-file" />
                                <button className="btn-primary w-full mt-2">Add Material</button>
                            </div>
                        )}
                    </div>
                    
                    <div className="content-card assignments-card">
                        <h3>Assignments ({assignments.length})</h3>
                        <div className="list">
                            {assignments.length > 0 ? assignments.map(a => (
                                <div key={a.id} className="assignment-item">
                                    <div className="a-header">
                                        <h4>{a.title}</h4>
                                        {isTeacher && (
                                            <div className="actions">
                                                <button className="btn-sm btn-primary">Edit</button>
                                                <button className="btn-sm btn-danger">Delete</button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="a-desc">{a.description}</p>
                                    <p className="a-due">Due: {new Date(a.dueDate).toLocaleString()}</p>
                                    <button className="btn-sm btn-primary mt-2">View</button>
                                </div>
                            )) : null}
                        </div>
                        
                        {isTeacher && (
                            <div className="add-form mt-4">
                                <h4>Add New Assignment</h4>
                                <input type="text" placeholder="Assignment Title" className="input" />
                                <textarea placeholder="Description" className="input"></textarea>
                                <input type="file" className="input-file" />
                                <button className="btn-primary w-full mt-2">Add Assignment</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassroomDetail;