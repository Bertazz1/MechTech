import api from '../config/api';

export const authService = {
    login: async (username, password) => {
        const response = await api.post('/auth', { username, password });
        return response.data;
    },
    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },
    // -------------------

    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '/auth';
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};