import api from '../config/api';

export const tenantService = {
    // Cadastro público (Sign Up)
    register: async (data) => {
        // Endpoint liberado no SecurityConfig
        const response = await api.post('/tenants/register', data);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/tenants/${id}`); // Requer endpoint GET no backend
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/tenants/${id}`, data); // Requer endpoint PUT no backend
        return response.data;
    },

    // Upload da Logo
    uploadLogo: async (id, file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/tenants/${id}/logo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    getAll: async (params) => {
        const response = await api.get('/tenants', { params });
        return response.data;
    },

    getLogo: async (id) => {
        const response = await api.get(`/tenants/${id}/logo`, {
            responseType: 'blob' // Importante para arquivos binários
        });
        return response.data; // Retorna o Blob
    }
};