import client from './client';

export const getMaterialsByCourse = (courseId) => client.get(`/courses/${courseId}/materials`);
export const uploadMaterial = (courseId, formData) =>
    client.post(`/courses/${courseId}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
export const deleteMaterial = (materialId) => client.delete(`/materials/${materialId}`);
export const getMaterialDownloadUrl = (materialId) => {
    const baseURL = client.defaults.baseURL || 'http://localhost:8080/api';
    return `${baseURL}/materials/${materialId}/download`;
};
