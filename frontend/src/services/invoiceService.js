import api from '../config/api';

export const invoiceService = {
  getAll: async () => {
    const response = await api.get('/invoices');
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(`/invoices/search?q=${query}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  updatePaymentStatus: async (id, status) => {
    const response = await api.patch(`/invoices/${id}/status`, { status });
    return response.data;
  },
};
