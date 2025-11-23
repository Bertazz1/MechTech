import api from '../config/api';

export const addressService = {

    getByCep: async (cep) => {
        const cleanCep = cep.replace(/\D/g, ''); // Remove pontos e traços
        if (!cleanCep) return null;


        const response = await api.get(`/addresses/cep/${cleanCep}`);
        return response.data;
    }
};