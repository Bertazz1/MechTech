import api from '../config/api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth', { email, password });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '/auth';
    },

    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token; // Retorna true se tiver token
    },
};