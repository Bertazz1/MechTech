import api from '../config/api';

export const vehicleBrandService = {
    getAll: async (params) => {
        const response = await api.get('/vehicle-brands', { params });
        return response.data;
    },
    search: async (query, params) => {
        const response = await api.get('/vehicle-brands/search', {
            params: { ...params, q: query }
        });
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/vehicle-brands/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/vehicle-brands', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/vehicle-brands/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/vehicle-brands/${id}`);
        return response.data;
    },
};