import { useState, useEffect } from 'react';
import { getCourses } from '../api/courseApi';

export const useCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCourses()
            .then((res) => setCourses(res.data))
            .finally(() => setLoading(false));
    }, []);

    return { courses, loading, setCourses };
};// useCourses hook stub
