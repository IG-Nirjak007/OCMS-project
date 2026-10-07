import React, { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { createCourse, deleteCourse } from '../../api/courseApi';

const ManageCoursesPage = () => {
    const { courses, setCourses } = useCourses();
    const [title, setTitle] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        const res = await createCourse({ title });
        setCourses([...courses, res.data]);
        setTitle('');
    };

    const handleDelete = async (id) => {
        await deleteCourse(id);
        setCourses(courses.filter((c) => c.id !== id));
    };

    return (
        <div className="page-container">
            <h2>Manage Courses</h2>
            <form onSubmit={handleCreate}>
                <input type="text" placeholder="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <button type="submit">Create Course</button>
            </form>
            <ul>
                {courses.map((c) => (
                    <li key={c.id}>
                        {c.title} <button onClick={() => handleDelete(c.id)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManageCoursesPage;// ManageCoursesPage stub
