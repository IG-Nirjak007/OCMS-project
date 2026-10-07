import React from 'react';
import { useCourses } from '../../hooks/useCourses';
import CourseList from '../../components/course/CourseList';

const MyCoursesPage = () => {
    const { courses, loading } = useCourses();

    return (
        <div className="page-container">
            <h2>My Enrolled Courses</h2>
            {loading ? <p>Loading courses...</p> : <CourseList courses={courses} />}
        </div>
    );
};

export default MyCoursesPage;// MyCoursesPage - enrolled courses stub
