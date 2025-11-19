import api from './api';

// Exemplo de como usar a API em outros serviços
class ExampleApiService {
  // Exemplo: Buscar dados do usuário
  async getUserData() {
    try {
      const response = await api.get('/user');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar dados do usuário',
        error,
      };
    }
  }

  // Exemplo: Buscar lista de itens
  async getItems(page = 1, limit = 10) {
    try {
      const response = await api.get('/items', {
        params: { page, limit },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar itens',
        error,
      };
    }
  }

  // Exemplo: Criar um novo item
  async createItem(itemData) {
    try {
      const response = await api.post('/items', itemData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar item',
        error,
      };
    }
  }

  // Exemplo: Atualizar um item
  async updateItem(id, itemData) {
    try {
      const response = await api.put(`/items/${id}`, itemData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar item',
        error,
      };
    }
  }

  // Exemplo: Deletar um item
  async deleteItem(id) {
    try {
      await api.delete(`/items/${id}`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao deletar item',
        error,
      };
    }
  }
}

export default new ExampleApiService();
