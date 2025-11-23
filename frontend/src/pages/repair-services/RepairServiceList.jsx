import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { repairService } from '../../services/repairService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { confirmDelete, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const RepairServiceList = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const data = await repairService.getAll();
            if (Array.isArray(data)) setServices(data);
            else if (data?.content) setServices(data.content);
            else setServices([]);
        } catch (error) {
            toast.error('Erro ao carregar serviços');
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        if (!query.trim()) {
            loadServices();
            return;
        }
        try {
            setLoading(true);
            const data = await repairService.search(query);
            if (Array.isArray(data)) setServices(data);
            else if (data?.content) setServices(data.content);
            else setServices([]);
        } catch (error) {
            toast.error('Erro ao buscar serviços');
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirmDelete(
            'Excluir Serviço?',
            'Se este serviço estiver em uso em uma OS, a exclusão pode ser bloqueada.'
        );

        if (!isConfirmed) return;

        try {
            await repairService.delete(id);
            await showAlert('Excluído!', 'Serviço removido com sucesso.');
            loadServices();
        } catch (error) {
            const message = parseApiError(error);
            showAlert('Erro!', message, 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Serviços</h1>
                <Button onClick={() => navigate('/repair-services/new')} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Novo Serviço
                </Button>
            </div>

            <div className="mb-6">
                <SearchBar onSearch={handleSearch} placeholder="Buscar serviços..." />
            </div>

            {loading ? (
                <div className="text-center py-8">Carregando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Base</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {services?.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Nenhum serviço encontrado</td>
                            </tr>
                        ) : (
                            services?.map((service) => (
                                <tr key={service.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{service.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {service.cost?.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => navigate(`/repair-services/edit/${service.id}`)} className="text-primary-600 hover:text-primary-900 mr-3">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-900">
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

export default RepairServiceList;