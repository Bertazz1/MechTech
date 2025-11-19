import api from "./api";
import { API_ENDPOINTS } from '@/config/config';

export default {
    /**
     * Busca lista de cotações
     * @param {Object} params { page }
     */
    async fetchQuotations(params = {}) {
        const { data } = await api.get(API_ENDPOINTS.QUOTATIONS, { params });
        return data;
    },

    /**
     * Busca cotação por ID
     */
    async fetchQuotationById(id) {
        const { data } = await api.get(`${API_ENDPOINTS.QUOTATIONS}/${id}`);
        return data;
    },

    /**
     * Cria uma nova cotação
     */
    async createQuotation(payload) {
        const { data } = await api.post(API_ENDPOINTS.QUOTATIONS, payload);
        return data;
    },

    /**
     * Atualiza cotação existente
     */
    async updateQuotation(id, payload) {
        const { data } = await api.put(`${API_ENDPOINTS.QUOTATIONS}/${id}`, payload);
        return data;
    },

    /**
     * Remove cotação
     */
    async deleteQuotation(id) {
        const { data } = await api.delete(`${API_ENDPOINTS.QUOTATIONS}/${id}`);
        return data;
    },
};
