import React, { useEffect, useState } from 'react';
import courseService from '../../services/courseService';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ClassroomList = () => {
    const { user, hasRole } = useAuth();
    const navigate = useNavigate();
    const [createdCourses, setCreatedCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (hasRole('TEACHER')) {
                const courses = await courseService.getAllCourses();
                // Filter courses where user is instructor (assuming logic for demo)
                setCreatedCourses(courses);
            }
            const enrolled = await courseService.getEnrolledCourses();
            setEnrolledCourses(enrolled);
        };
        fetchData();
    }, [hasRole]);

    return (
        <div className="classroom-list-page">
            <div className="page-header text-center">
                <h2>My Classrooms</h2>
                {hasRole('TEACHER') && (
                    <button className="btn-primary mt-4" onClick={() => navigate('/classroom/new')}>
                        Create New Classroom
                    </button>
                )}
            </div>

            {hasRole('TEACHER') && (
                <div className="section">
                    <h3 className="section-title">My Created Classrooms</h3>
                    <p className="section-subtitle">Classrooms you have created</p>
                    
                    <div className="courses-grid">
                        {createdCourses.length > 0 ? createdCourses.map(course => (
                            <div key={course.id} className="course-card">
                                <h4>{course.title}</h4>
                                <p className="teacher-info">Teacher: {user.username}</p>
                                <p className="desc">{course.description || 'Description'}</p>
                                <button className="btn-primary w-full" onClick={() => navigate(`/classroom/${course.id}`)}>
                                    View Classroom
                                </button>
                            </div>
                        )) : (
                            <div className="empty-state">No courses created yet</div>
                        )}
                    </div>
                </div>
            )}

            <div className="section">
                <h3 className="section-title">Enrolled Classrooms</h3>
                <p className="section-subtitle">Classrooms you have joined</p>
                
                <div className="courses-grid">
                    {enrolledCourses.length > 0 ? enrolledCourses.map(course => (
                        <div key={course.id} className="course-card">
                            <h4>{course.title}</h4>
                            <p className="desc">{course.description || 'Description'}</p>
                            <button className="btn-primary w-full" onClick={() => navigate(`/classroom/${course.id}`)}>
                                View Classroom
                            </button>
                        </div>
                    )) : (
                        <div className="empty-state card-empty">You haven't joined any classrooms yet</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassroomList;