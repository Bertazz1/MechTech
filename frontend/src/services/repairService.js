import api from '../config/api';

export const repairService = {
  getAll: async () => {
    const response = await api.get('/repair-services');
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(`/repair-services/search?q=${query}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/repair-services/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/repair-services', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/repair-services/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/repair-services/${id}`);
    return response.data;
  },
};
