import React, { useEffect, useState } from 'react';
import client from '../../api/client';

const StudentDashboardPage = () => {
    const [courses, setCourses] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        try {
            const [allRes, myRes] = await Promise.all([
                client.get('/courses'),
                client.get('/courses/enrolled')
            ]);
            setCourses(allRes.data);
            setEnrolledIds(myRes.data.map((c) => c.id));
        } catch (err) {
            console.error('Failed to load courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            await client.post(`/courses/${courseId}/enroll`);
            setEnrolledIds([...enrolledIds, courseId]);
        } catch (err) {
            alert(err.response?.data?.message || 'Enrollment failed.');
        }
    };

    if (loading) return <div>Loading course catalog...</div>;

    return (
        <div className="page-container">
            <h1>Available Courses</h1>
            <div className="course-grid">
                {courses.map((course) => {
                    const isEnrolled = enrolledIds.includes(course.id);
                    return (
                        <div key={course.id} className="course-card">
                            <h3>{course.title}</h3>
                            <p>{course.description}</p>
                            <button
                                disabled={isEnrolled}
                                onClick={() => handleEnroll(course.id)}
                                className={isEnrolled ? 'btn-secondary' : 'btn-primary'}
                            >
                                {isEnrolled ? 'Enrolled' : 'Enroll Now'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentDashboardPage;