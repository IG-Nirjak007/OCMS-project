import api from './api';

const submissionService = {
    submitAssignment: async (assignmentId, fileUrl, description) => {
        const response = await api.post('/submissions', { assignmentId, fileUrl, description });
        return response.data;
    },
    getSubmissions: async (assignmentId) => {
        const response = await api.get(`/assignments/${assignmentId}/submissions`);
        return response.data;
    },
    gradeSubmission: async (submissionId, grade, feedback) => {
        const response = await api.put(`/submissions/${submissionId}/grade`, { grade, feedback });
        return response.data;
    },
    getMySubmissions: async () => {
        const response = await api.get('/submissions/me');
        return response.data;
    }
};

export default submissionService;