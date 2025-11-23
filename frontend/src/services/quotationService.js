import api from '../config/api';

export const quotationService = {
  getAll: async () => {
    const response = await api.get('/quotations');
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(`/quotations/search?q=${query}`);
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
    const response = await api.get(`/quotations/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  convertToServiceOrder: async (id) => {
    const response = await api.post(`/quotations/${id}/convert`);
    return response.data;
  },
};
