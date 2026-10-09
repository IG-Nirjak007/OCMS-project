
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const ROLES = {
    STUDENT: 'ROLE_STUDENT',
    INSTRUCTOR: 'ROLE_TEACHER', // Updated to match backend ROLE_TEACHER
    ADMIN: 'ROLE_ADMIN'
};
export const MATERIAL_TYPES = {
    VIDEO: 'VIDEO',
    DOCUMENT: 'DOCUMENT',
    LINK: 'LINK'
};
