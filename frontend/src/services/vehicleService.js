import api from '../config/api';

export const vehicleService = {
    getAll: async (params) => {
        const response = await api.get('/vehicles', { params });
        return response.data;
    },
    search: async (query, params) => {
        const response = await api.get('/vehicles/search', {
            params: { ...params, q: query }
        });
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/vehicles/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/vehicles', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/vehicles/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/vehicles/${id}`);
        return response.data;
    },
};