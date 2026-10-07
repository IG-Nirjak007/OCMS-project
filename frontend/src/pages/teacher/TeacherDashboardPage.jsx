import React from 'react';
import { useCourses } from '../../hooks/useCourses';
import CourseList from '../../components/course/CourseList';

const TeacherDashboardPage = () => {
    const { courses, loading } = useCourses();

    return (
        <div className="page-container">
            <h1>Teacher Portal</h1>
            <h3>My Teaching Courses</h3>
            {loading ? <p>Loading...</p> : <CourseList courses={courses} />}
        </div>
    );
};

export default TeacherDashboardPage;// TeacherDashboardPage stub
