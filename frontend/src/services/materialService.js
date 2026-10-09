import api from './api';

const materialService = {
    getMaterialsByCourse: async (courseId) => {
        const response = await api.get(`/courses/${courseId}/materials`);
        return response.data;
    },
    uploadMaterial: async (courseId, title, file) => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);
        const response = await api.post(`/courses/${courseId}/materials`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    deleteMaterial: async (id) => {
        const response = await api.delete(`/materials/${id}`);
        return response.data;
    }
};

export default materialService;