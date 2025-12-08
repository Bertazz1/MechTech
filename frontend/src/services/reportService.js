import api from '../config/api';

export const reportService = {
    getCommissions: async (startDate, endDate) => {
        const response = await api.get('/reports/commissions', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    getServiceOrders: async (filters) => {
        // Limpa parâmetros vazios ou nulos antes de enviar
        const params = {};
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== '') {
                params[key] = filters[key];
            }
        });

        const response = await api.get('/reports/service-orders', { params });
        return response.data;
    }
};