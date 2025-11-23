import api from '../config/api';

export const partService = {
  getAll: async () => {
    const response = await api.get('/parts');
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(`/parts/search?q=${query}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/parts/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/parts', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/parts/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/parts/${id}`);
    return response.data;
  },
};
