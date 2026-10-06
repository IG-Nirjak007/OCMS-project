import client from './client';

export const getCourses = () => client.get('/courses');
export const getCourseById = (id) => client.get(`/courses/${id}`);
export const createCourse = (data) => client.post('/courses', data);
export const updateCourse = (id, data) => client.put(`/courses/${id}`, data);
export const deleteCourse = (id) => client.delete(`/courses/${id}`);// courseApi - GET/POST /api/courses stub
