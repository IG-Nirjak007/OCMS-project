import client from './client';

export const getAssignmentsByCourse = (courseId) => client.get(`/courses/${courseId}/assignments`);
export const submitAssignment = (assignmentId, formData) =>
    client.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
export const gradeSubmission = (submissionId, gradeData) =>
    client.put(`/submissions/${submissionId}/grade`, gradeData);// assignmentApi - GET/POST /api/assignments stub
