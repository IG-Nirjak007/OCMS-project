import client from './client';

export const getCourses = () => client.get('/courses');
export const getCourseById = (id) => client.get(`/courses/${id}`);
export const createCourse = (data) => client.post('/courses', data);
export const updateCourse = (id, data) => client.put(`/courses/${id}`, data);
export const deleteCourse = (id) => client.delete(`/courses/${id}`);
export const addInstructor = (courseId, data) => client.post(`/courses/${courseId}/instructors`, data);
export const removeInstructor = (courseId, instructorId) => client.delete(`/courses/${courseId}/instructors/${instructorId}`);
