import api from '../config/api';

export const roleService = {
    getAll: async (params) => {
        const response = await api.get('/roles', { params });
        return response.data;
    },
    search: async (query, params) => {
        const response = await api.get('/roles/search', {
            params: { ...params, q: query }
        });
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/roles/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/roles', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/roles/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/roles/${id}`);
        return response.data;
    },
};