import api from "./api";
import { API_ENDPOINTS } from '@/config/config';

export default {
    /**
     * Busca todas as peças
     * @param {Object} params { page }
     */
    async fetchParts(params = {}) {
        const { data } = await api.get(API_ENDPOINTS.PARTS, { params });
        return data;
    },

    /**
     * Busca peça por ID
     */
    async fetchPartById(id) {
        const { data } = await api.get(`${API_ENDPOINTS.PARTS}/${id}`);
        return data;
    },

    /**
     * Busca peça por nome
     * Exemplo: /parts/search/by-name?name=Filtro
     */
    async searchPartByName(name) {
        const { data } = await api.get(`${API_ENDPOINTS.PARTS}/search/by-name`, {
            params: { name }
        });
        return data;
    },

    /**
     * Cria uma nova peça
     */
    async createPart(payload) {
        const { data } = await api.post(API_ENDPOINTS.PARTS, payload);
        return data;
    },

    /**
     * Atualiza peça existente
     */
    async updatePart(id, payload) {
        const { data } = await api.put(`${API_ENDPOINTS.PARTS}/${id}`, payload);
        return data;
    },

    /**
     * Remove peça
     */
    async deletePart(id) {
        const { data } = await api.delete(`${API_ENDPOINTS.PARTS}/${id}`);
        return data;
    },
};
