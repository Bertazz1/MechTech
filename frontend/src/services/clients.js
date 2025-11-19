import api from "./api";
import { API_ENDPOINTS } from '@/config/config';

export default {
  /**
   * Busca lista de clientes
   * @param {Object} params { page }
   */
  async fetchClients(params = {}) {
    const { data } = await api.get(API_ENDPOINTS.CLIENTS, { params });
    return data;
  },

  /**
   * Busca cliente por ID
   */
  async fetchClientById(id) {
    const { data } = await api.get(`${API_ENDPOINTS.CLIENTS}/${id}`);
    return data;
  },

  /**
   * Cria um novo cliente
   */
  async createClient(payload) {
    const { data } = await api.post(API_ENDPOINTS.CLIENTS, payload);
    return data;
  },

  /**
   * Atualiza cliente existente
   */
  async updateClient(id, payload) {
    const { data } = await api.put(`${API_ENDPOINTS.CLIENTS}/${id}`, payload);
    return data;
  },

  /**
   * Remove cliente
   */
  async deleteClient(id) {
    const { data } = await api.delete(`${API_ENDPOINTS.CLIENTS}/${id}`);
    return data;
  },
};