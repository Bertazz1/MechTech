import api from "./api";
import { API_ENDPOINTS } from '@/config/config';

export default {
  /**
   * Busca lista de veiculos
   * @param {Object} params { page }
   */
  async fetchVehicles(params = {}) {
    const { data } = await api.get(API_ENDPOINTS.VEHICLES, { params });
    return data;
  },

  /**
   * Busca veiculo por ID
   */
  async fetchVehicleById(id) {
    const { data } = await api.get(`${API_ENDPOINTS.VEHICLES}/${id}`);
    return data;
  },

  /**
   * Cria um novo veiculo
   */
  async createVehicle(payload) {
    const { data } = await api.post(API_ENDPOINTS.VEHICLES, payload);
    return data;
  },

  /**
   * Atualiza veiculo existente
   */
  async updateVehicle(id, payload) {
    const { data } = await api.put(`${API_ENDPOINTS.VEHICLES}/${id}`, payload);
    return data;
  },

  /**
   * Remove veiculo
   */
  async deleteVehicle(id) {
    const { data } = await api.delete(`${API_ENDPOINTS.VEHICLES}/${id}`);
    return data;
  },
};