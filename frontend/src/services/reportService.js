import api from '../config/api';

export const reportService = {
    getCommissions: async (startDate, endDate) => {
        const response = await api.get('/reports/commissions', {
            params: { startDate, endDate }
        });
        return response.data;
    }
};