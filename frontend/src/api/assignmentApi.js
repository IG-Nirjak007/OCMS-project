import client from './client';

export const getAssignmentsByCourse = (courseId) => client.get(`/courses/${courseId}/assignments`);
export const getAssignmentById = (id) => client.get(`/assignments/${id}`);
export const createAssignment = (data) => client.post('/assignments', data);
export const deleteAssignment = (id) => client.delete(`/assignments/${id}`);
export const getSubmissions = (assignmentId) => client.get(`/assignments/${assignmentId}/submissions`);
export const getMySubmissions = () => client.get('/submissions/me');
export const submitAssignment = (payload) => client.post('/submissions', payload);
export const submitAssignmentWithFile = (formData) =>
    client.post('/submissions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
export const gradeSubmission = (submissionId, gradeData) =>
    client.put(`/submissions/${submissionId}/grade`, gradeData);
export const getSubmissionDownloadUrl = (submissionId) => {
    const baseURL = client.defaults.baseURL || 'http://localhost:8080/api';
    return `${baseURL}/submissions/${submissionId}/download`;
};
