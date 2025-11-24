import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceOrderService } from '../../services/serviceOrderService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import StartServiceModal from '../StartService'; // Mantenha o caminho correto do seu projeto
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Receipt, ArrowUpDown, ArrowUp, ArrowDown, Play, Ban } from 'lucide-react'; // <--- Adicionado Ban
import { confirmDelete, confirmAction, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const ServiceOrderList = () => {
    const [serviceOrders, setServiceOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

    // Estados para o Modal de Iniciar Serviço
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const navigate = useNavigate();

    const statusLabels = {
        PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
        EM_PROGRESSO: { label: 'Em Progresso', color: 'bg-blue-100 text-blue-800' },
        COMPLETO: { label: 'Completo', color: 'bg-green-100 text-green-800' },
        CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    };

    useEffect(() => {
        loadServiceOrders();
    }, [sortConfig]);

    const loadServiceOrders = async () => {
        try {
            setLoading(true);
            const params = { sort: `${sortConfig.key},${sortConfig.direction}` };
            const data = await serviceOrderService.getAll(params);

            if (Array.isArray(data)) {
                setServiceOrders(data);
            } else if (data?.content && Array.isArray(data.content)) {
                setServiceOrders(data.content);
            } else {
                setServiceOrders([]);
            }
        } catch (error) {
            console.error("Erro ao carregar OS:", error);
            toast.error('Erro ao carregar ordens de serviço');
            setServiceOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        setSortConfig((current) => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-50" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-4 h-4 ml-1 text-primary-600" />
            : <ArrowDown className="w-4 h-4 ml-1 text-primary-600" />;
    };

    const SortableTh = ({ label, sortKey, className = "" }) => (
        <th
            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors ${className}`}
            onClick={() => handleSort(sortKey)}
        >
            <div className="flex items-center">
                {label}
                <SortIcon columnKey={sortKey} />
            </div>
        </th>
    );

    const handleDelete = async (id) => {
        const isConfirmed = await confirmDelete(
            'Excluir OS?',
            'Esta ação removerá a ordem de serviço e todo seu histórico.'
        );

        if (!isConfirmed) return;

        try {
            await serviceOrderService.delete(id);
            await showAlert('Excluído!', 'Ordem de serviço removida.');
            loadServiceOrders();
        } catch (error) {
            const message = parseApiError(error);
            showAlert('Erro!', message, 'error');
        }
    };

    // --- NOVA FUNÇÃO: Cancelar Serviço ---
    const handleCancel = async (id) => {
        const isConfirmed = await confirmAction(
            'Cancelar OS?',
            'Deseja realmente cancelar esta ordem de serviço? Esta ação pode não ser reversível.',
            'Sim, cancelar',
            '#ef4444' // Cor vermelha para perigo
        );

        if (!isConfirmed) return;

        try {
            await serviceOrderService.update(id, { status: 'CANCELADO' });
            toast.success('Ordem de serviço cancelada com sucesso.');
            loadServiceOrders();
        } catch (error) {
            const message = parseApiError(error);
            toast.error(message);
        }
    };

    const handleGenerateInvoice = async (id) => {
        const isConfirmed = await confirmAction(
            'Gerar Fatura?',
            'Deseja gerar a fatura para esta ordem de serviço?',
            'Sim, gerar',
            '#10b981'
        );

        if (!isConfirmed) return;

        try {
            await serviceOrderService.generateInvoice(id);
            toast.success('Fatura gerada com sucesso');
            navigate('/invoices');
        } catch (error) {
            toast.error('Erro ao gerar fatura');
        }
    };

    const handleSearch = (query) => {
        serviceOrderService.search(query).then(data => {
            if (Array.isArray(data)) {
                setServiceOrders(data);
            } else if (data?.content) {
                setServiceOrders(data.content);
            }
        });
    };

    // --- Lógica do Modal de Início ---
    const handleOpenStartModal = (id) => {
        // Se você estiver usando a página dedicada de StartService, redirecione:
        navigate(`/service-orders/start/${id}`);

        // Se preferir manter o Modal antigo, descomente abaixo e comente o navigate acima:
        // setSelectedOrderId(id);
        // setIsStartModalOpen(true);
    };

    // Mantido caso ainda use o Modal em algum lugar, senão pode remover
    const handleConfirmStart = async (data) => {
        try {
            setActionLoading(true);
            await serviceOrderService.update(selectedOrderId, {
                status: 'EM_PROGRESSO',
                initialMileage: data.initialMileage
            });
            toast.success('Ordem de Serviço iniciada com sucesso!');
            setIsStartModalOpen(false);
            loadServiceOrders();
        } catch (error) {
            const msg = parseApiError(error);
            toast.error(msg);
        } finally {
            setActionLoading(false);
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
                            <SortableTh label="ID" sortKey="id" />
                            <SortableTh label="Veículo" sortKey="vehicle.licensePlate" />
                            <SortableTh label="Cliente" sortKey="client.name" />
                            <SortableTh label="Status" sortKey="status" />
                            <SortableTh label="Total" sortKey="totalCost" />
                            <SortableTh label="Data Entrada" sortKey="entryDate" />
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {serviceOrders?.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                    Nenhuma ordem de serviço encontrada
                                </td>
                            </tr>
                        ) : (
                            serviceOrders?.map((order) => {
                                const statusInfo = statusLabels[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.vehicleLicensePlate || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.clientName || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                                              {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            R$ {Number(order.totalCost || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.entryDate ? new Date(order.entryDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">

                                                {/* Botão Iniciar Serviço (Redireciona para a página StartService) */}
                                                {(order.status === 'PENDENTE' || order.status === 'INCOMPLETO') && (
                                                    <button
                                                        onClick={() => handleOpenStartModal(order.id)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded group relative"
                                                        title="Iniciar Serviço"
                                                    >
                                                        <Play className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {/* Botão Cancelar (Novo) */}
                                                {(order.status === 'PENDENTE' || order.status === 'EM_PROGRESSO') && (
                                                    <button
                                                        onClick={() => handleCancel(order.id)}
                                                        className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded"
                                                        title="Cancelar OS"
                                                    >
                                                        <Ban className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {/* Botão Gerar Fatura (Apenas se COMPLETO) */}
                                                {order.status === 'COMPLETO' && (
                                                    <button
                                                        onClick={() => handleGenerateInvoice(order.id)}
                                                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                                        title="Gerar Fatura"
                                                    >
                                                        <Receipt className="w-5 h-5" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => navigate(`/service-orders/edit/${order.id}`)}
                                                    className="text-primary-600 hover:text-primary-900 p-1 hover:bg-blue-50 rounded"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(order.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mantido para compatibilidade se ainda usar modal em algum lugar */}
            <StartServiceModal
                isOpen={isStartModalOpen}
                onClose={() => setIsStartModalOpen(false)}
                onConfirm={handleConfirmStart}
                loading={actionLoading}
            />
        </div>
    );
};

export default ServiceOrderList;