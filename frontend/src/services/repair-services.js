import api from "./api";
import { API_ENDPOINTS } from '@/config/config';

export default {
    /**
     * Busca todos os serviços de reparo
     * @param {Object} params { page }
     */
    async fetchRepairServices(params = {}) {
        const { data } = await api.get(API_ENDPOINTS.REPAIR_SERVICES, { params });
        return data;
    },

    /**
     * Busca serviço de reparo por ID
     */
    async fetchRepairServiceById(id) {
        const { data } = await api.get(`${API_ENDPOINTS.REPAIR_SERVICES}/${id}`);
        return data;
    },

    /**
     * Busca serviço por nome
     * Exemplo: /repair-services/search/by-name?name=Lavagem
     */
    async searchRepairServiceByName(name) {
        const { data } = await api.get(`${API_ENDPOINTS.REPAIR_SERVICES}/search/by-name`, {
            params: { name }
        });
        return data;
    },

    /**
     * Cria um novo serviço de reparo
     */
    async createRepairService(payload) {
        const { data } = await api.post(API_ENDPOINTS.REPAIR_SERVICES, payload);
        return data;
    },

    /**
     * Atualiza serviço de reparo existente
     */
    async updateRepairService(id, payload) {
        const { data } = await api.put(`${API_ENDPOINTS.REPAIR_SERVICES}/${id}`, payload);
        return data;
    },

    /**
     * Remove serviço de reparo
     */
    async deleteRepairService(id) {
        const { data } = await api.delete(`${API_ENDPOINTS.REPAIR_SERVICES}/${id}`);
        return data;
    },
};
