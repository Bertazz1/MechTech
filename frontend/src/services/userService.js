import api from '../config/api';

export const userService = {
    getAll: async (params) => {
        const response = await api.get('/users', { params });
        return response.data;
    },
    delete: async (id) => {
        return api.delete(`/users/${id}`);
    }
};