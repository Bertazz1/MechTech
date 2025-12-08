import api from '../config/api';

export const invoiceService = {
    getAll: async (params) => {
        const response = await api.get('/invoices', { params });
        return response.data;
    },
    search: async (query, params) => {
        const response = await api.get('/invoices/search', {
            params: { ...params, q: query }
        });
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/invoices/${id}`);
        return response.data;
    },

    updatePaymentStatus: async (id, status) => {
        const response = await api.patch(`/invoices/${id}`, { paymentStatus: status });
        return response.data;
    },
    // ---------------------

    getInvoicePdf: async (id) => {
        const response = await api.get(`/invoices/${id}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    }
};