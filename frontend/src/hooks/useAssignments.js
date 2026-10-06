import { useState, useEffect } from 'react';
import { getAssignmentsByCourse } from '../api/assignmentApi';

export const useAssignments = (courseId) => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (courseId) {
            getAssignmentsByCourse(courseId)
                .then((res) => setAssignments(res.data))
                .finally(() => setLoading(false));
        }
    }, [courseId]);

    return { assignments, loading };
};// useAssignments hook stub
