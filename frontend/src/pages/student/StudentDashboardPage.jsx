import React from 'react';
import { useCourses } from '../../hooks/useCourses';
import CourseList from '../../components/course/CourseList';

const StudentDashboardPage = () => {
    const { courses, loading } = useCourses();

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="page-container">
            <h1>Student Dashboard</h1>
            <section>
                <h3>Enrolled Courses</h3>
                <CourseList courses={courses} />
            </section>
        </div>
    );
};

export default StudentDashboardPage;// StudentDashboardPage stub
