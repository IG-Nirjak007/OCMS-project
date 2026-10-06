import client from './client';

export const loginApi = (credentials) => client.post('/auth/login', credentials);
export const registerApi = (userData) => client.post('/auth/register', userData);
export const forgotPasswordApi = (email) => client.post('/auth/forgot-password', { email });
export const getCurrentUserApi = () => client.get('/auth/me');// authApi - POST /api/auth/login, register, logout stub
