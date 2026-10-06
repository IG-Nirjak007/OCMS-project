import client from './client';

export const getAllUsers = () => client.get('/admin/users');
export const updateUserRole = (userId, role) => client.put(`/admin/users/${userId}/role`, { role });
export const deleteUser = (userId) => client.delete(`/admin/users/${userId}`);
export const getAdminStats = () => client.get('/admin/stats');// adminApi - GET /api/admin/users stub
