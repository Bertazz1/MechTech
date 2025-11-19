import api from './api';
import { API_ENDPOINTS } from '@/config/config';

class AuthService {
  // Registar
  async register(firstName, username, password) {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, {
        firstName,
        username,
        password,
        email: username, 
        role: "ROLE_ADMIN",
        tenantId: 1
      });

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login',
        error,
      };
    }
  }

  // Fazer login
  async login(username, password) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH, {
        username,
        password,
      });

      const { token, user } = response.data;
      
      // Armazenar token e dados do usuário
      localStorage.setItem('authToken', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      return {
        success: true,
        token,
        user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login',
        error,
      };
    }
  }

  // Fazer logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Verificar se está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  // Obter token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Obter dados do usuário
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Verificar se o token é válido (opcional - pode ser usado para validação adicional)
  async validateToken() {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH_VALIDATE);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Buscar dados atuais do usuário do servidor
  async fetchUserData() {
    try {
      const response = await api.get(API_ENDPOINTS.USERS_ME);
      const userData = response.data;
      
      // Atualizar dados no localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      return {
        success: true,
        data: userData,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar dados do usuário',
        error,
      };
    }
  }

  // Alterar senha do usuário
  async changePassword(userId, currentPassword, newPassword, confirmNewPassword) {
    try {
      const response = await api.patch(`${API_ENDPOINTS.USERS}/${userId}`, {
        oldPassword: currentPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmNewPassword,
      });

      return {
        success: true,
        message: 'Senha alterada com sucesso',
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao alterar senha',
        error,
      };
    }
  }

  // Atualizar dados do perfil do usuário
  async updateProfile(profileData) {
    try {
      const response = await api.put(API_ENDPOINTS.UPDATE_PROFILE, profileData);
      const updatedUser = response.data;
      
      // Atualizar dados no localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return {
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: updatedUser,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar perfil',
        error,
      };
    }
  }
}

export default new AuthService();
