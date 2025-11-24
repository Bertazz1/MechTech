import api from '../config/api';

export const quotationService = {
    getAll: async (params) => {
        const response = await api.get('/quotations', { params });
        return response.data;
    },
    search: async (query, params) => {
        const response = await api.get('/quotations/search', {
            params: { ...params, q: query }
        });
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/quotations/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/quotations', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/quotations/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/quotations/${id}`);
        return response.data;
    },
    downloadPDF: async (id) => {
        const response = await api.get(`/quotations/${id}/pdf`, { responseType: 'blob' });
        return response.data;
    },
    convertToServiceOrder: async (id) => {
        const response = await api.post(`/service-orders/from-quotation/${id}`);
        return response.data;
    }
};