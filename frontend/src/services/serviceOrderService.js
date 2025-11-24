import api from '../config/api';

export const serviceOrderService = {
    getAll: async (params) => {
        const response = await api.get('/service-orders', { params });
        return response.data;
    },
    search: async (query, params) => {
        const response = await api.get(`/service-orders/search?q=${query}`, { params });
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/service-orders/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/service-orders', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.patch(`/service-orders/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/service-orders/${id}`);
        return response.data;
    },
    generateInvoice: async (id) => {
        const response = await api.post(`/service-orders/${id}/invoice`);
        return response.data;
    }
};