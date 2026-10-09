import api from './api';

const assignmentService = {
    getAssignmentsByCourse: async (courseId) => {
        const response = await api.get(`/courses/${courseId}/assignments`);
        return response.data;
    },
    createAssignment: async (courseId, assignmentData) => {
        const response = await api.post('/assignments', { courseId, ...assignmentData });
        return response.data;
    }
};

export default assignmentService;