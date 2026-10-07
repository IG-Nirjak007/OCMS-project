import React, { createContext, useState, useCallback, useContext } from 'react';
import { getCourses } from '../api/courseApi';

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCourses = useCallback(async (forceRefresh = false) => {
        if (courses.length > 0 && !forceRefresh) return;
        setLoading(true);
        try {
            const res = await getCourses();
            setCourses(res.data);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        } finally {
            setLoading(false);
        }
    }, [courses]);

    const updateCourseInStore = (updatedCourse) => {
        setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
    };

    const removeCourseFromStore = (id) => {
        setCourses((prev) => prev.filter((c) => c.id !== id));
    };

    return (
        <CourseContext.Provider value={{ courses, loading, fetchCourses, updateCourseInStore, removeCourseFromStore, setCourses }}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourseStore = () => useContext(CourseContext);