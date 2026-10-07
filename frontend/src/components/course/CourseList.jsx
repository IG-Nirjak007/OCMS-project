import React from 'react';
import CourseCard from './CourseCard';

const CourseList = ({ courses = [] }) => {
    if (!courses.length) return <p>No courses found.</p>;

    return (
        <div className="course-list-grid">
            {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
};

export default CourseList;// CourseList component stub
