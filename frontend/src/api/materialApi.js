import client from './client';

export const getMaterialsByCourse = (courseId) => client.get(`/courses/${courseId}/materials`);
export const uploadMaterial = (courseId, formData) =>
    client.post(`/courses/${courseId}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
export const deleteMaterial = (materialId) => client.delete(`/materials/${materialId}`);// materialApi - GET/POST /api/courses/materials stub
