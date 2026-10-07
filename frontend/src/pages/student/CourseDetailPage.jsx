import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseById } from '../../api/courseApi';
import MaterialList from '../../components/material/MaterialList';
import AssignmentCard from '../../components/assignment/AssignmentCard';

const CourseDetailPage = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);

    useEffect(() => {
        getCourseById(id).then((res) => setCourse(res.data));
    }, [id]);

    if (!course) return <div>Loading course...</div>;

    return (
        <div className="page-container">
            <h2>{course.title}</h2>
            <p>{course.description}</p>

            <h3>Course Materials</h3>
            <MaterialList materials={course.materials || []} />

            <h3>Assignments</h3>
            {course.assignments?.map((item) => (
                <AssignmentCard key={item.id} assignment={item} />
            ))}
        </div>
    );
};

export default CourseDetailPage;// CourseDetailPage stub
