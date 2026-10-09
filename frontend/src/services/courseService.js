import api from './api';

const courseService = {
    getAllCourses: async () => {
        const response = await api.get('/courses');
        return response.data;
    },
    getCourseById: async (id) => {
        const response = await api.get(`/courses/${id}`);
        return response.data;
    },
    getEnrolledCourses: async () => {
        const response = await api.get('/enrollments');
        return response.data;
    },
    createCourse: async (courseData) => {
        const response = await api.post('/courses', courseData);
        return response.data;
    },
    enrollInCourse: async (courseId) => {
        const response = await api.post('/enrollments', { courseId });
        return response.data;
    },
    unenrollFromCourse: async (courseId) => {
        const response = await api.delete(`/enrollments/${courseId}`);
        return response.data;
    },
    getEnrollmentsByCourse: async (courseId) => {
        const response = await api.get(`/enrollments/course/${courseId}`);
        return response.data;
    }
};

export default courseService;