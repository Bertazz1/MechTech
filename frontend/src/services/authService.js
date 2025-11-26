import api from '../config/api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth', { email, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
