import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceOrderService } from '../../services/serviceOrderService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Receipt } from 'lucide-react';
import { confirmDelete, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const ServiceOrderList = () => {
    const [serviceOrders, setServiceOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const statusLabels = {
        PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
        EM_PROGRESSO: { label: 'Em Progresso', color: 'bg-blue-100 text-blue-800' },
        COMPLETO: { label: 'Completo', color: 'bg-green-100 text-green-800' },
        CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    };

    useEffect(() => {
        loadServiceOrders();
    }, []);

    const loadServiceOrders = async () => {
        try {
            setLoading(true);
            const data = await serviceOrderService.getAll();
            if (Array.isArray(data)) setServiceOrders(data);
            else if (data?.content) setServiceOrders(data.content);
            else setServiceOrders([]);
        } catch (error) {
            toast.error('Erro ao carregar ordens de serviço');
            setServiceOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        if (!query.trim()) {
            loadServiceOrders();
            return;
        }
        try {
            setLoading(true);
            const data = await serviceOrderService.search(query);
            if (Array.isArray(data)) setServiceOrders(data);
            else if (data?.content) setServiceOrders(data.content);
            else setServiceOrders([]);
        } catch (error) {
            toast.error('Erro ao buscar ordens de serviço');
            setServiceOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirmDelete(
            'Excluir Ordem de Serviço?',
            'Cuidado! Isso pode afetar faturas e históricos de veículos.'
        );

        if (!isConfirmed) return;

        try {
            await serviceOrderService.delete(id);
            await showAlert('Excluído!', 'Ordem de serviço removida com sucesso.');
            loadServiceOrders();
        } catch (error) {
            const message = parseApiError(error);
            showAlert('Erro!', message, 'error');
        }
    };

    const handleGenerateInvoice = async (id) => {
        if (!window.confirm('Deseja gerar a fatura para esta ordem de serviço?')) {
            return;
        }

        try {
            await serviceOrderService.generateInvoice(id);
            await showAlert('Sucesso!', 'Fatura gerada com sucesso.');
            navigate('/invoices');
        } catch (error) {
            const message = parseApiError(error);
            showAlert('Erro!', message, 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Ordens de Serviço</h1>
                <Button onClick={() => navigate('/service-orders/new')} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nova Ordem
                </Button>
            </div>

            <div className="mb-6">
                <SearchBar onSearch={handleSearch} placeholder="Buscar ordens de serviço..." />
            </div>

            {loading ? (
                <div className="text-center py-8">Carregando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Entrada</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {serviceOrders?.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Nenhuma ordem de serviço encontrada</td>
                            </tr>
                        ) : (
                            serviceOrders?.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{order.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusLabels[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[order.status]?.label || order.status}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.entryDate ? new Date(order.entryDate).toLocaleDateString() : '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {order.status === 'COMPLETO' && (
                                            <button onClick={() => handleGenerateInvoice(order.id)} className="text-green-600 hover:text-green-900 mr-3" title="Gerar Fatura">
                                                <Receipt className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button onClick={() => navigate(`/service-orders/edit/${order.id}`)} className="text-primary-600 hover:text-primary-900 mr-3">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-900">
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

export default ServiceOrderList;