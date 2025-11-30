import api from '../config/api';

export const vehicleModelService = {
    getAll: async (params) => {
        const response = await api.get('/vehicle-models', { params });
        return response.data;
    },

    search: async (query, params) => {
        const response = await api.get('/vehicle-models/search', {
            params: { ...params, q: query }
        });
        return response.data;
    },

    getByBrand: async (brandId) => {

        const response = await api.get('/vehicle-models', {
            params: { brandId: brandId }
        });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/vehicle-models/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/vehicle-models', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/vehicle-models/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/vehicle-models/${id}`);
        return response.data;
    }
};