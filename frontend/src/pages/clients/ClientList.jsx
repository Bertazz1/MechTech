import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../services/clientService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {parseApiError} from "../../utils/errorUtils.js";
import { confirmDelete, showAlert } from '../../utils/alert';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await clientService.getAll();

            if (Array.isArray(data)) {
                setClients(data);
            } else if (data && Array.isArray(data.content)) {
                setClients(data.content);
            } else {
                console.error("Formato de dados inesperado:", data);
                setClients([]);
            }

        } catch (error) {
            console.error("Erro ao carregar:", error);
            const message = parseApiError(error);
            toast.error(message);
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        if (!query.trim()) {
            loadClients();
            return;
        }

        try {
            setLoading(true);
            const data = await clientService.search(query);

            if (Array.isArray(data)) {
                setClients(data);
            } else if (data && Array.isArray(data.content)) {
                setClients(data.content);
            } else {
                setClients([]);
            }

        } catch (error) {
            toast.error('Erro ao buscar clientes' + error);
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        //  Abre a caixa de confirmação
        const isConfirmed = await confirmDelete(
            'Excluir Cliente?',
            'Esta ação removerá o cliente e todo o seu histórico permanentemente.'
        );

        if (!isConfirmed) return;

        try {
            //  Chama a API para deletar
            await clientService.delete(id);

            //  Mostra mensagem de Sucesso
            await showAlert('Excluído!', 'O cliente foi removido com sucesso.');

            //  Recarrega a lista para sumir com o item deletado
            loadClients();

        } catch (error) {
            console.error(error);
            const message = parseApiError(error.message); // Ou error.message

            showAlert('Erro!', message, 'error');
        }
    };

    return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        <Button onClick={() => navigate('/clients/new')} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Cliente
        </Button>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Buscar clientes..." />
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                clients?.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.cpf}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/clients/edit/${client.id}`)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientList;
