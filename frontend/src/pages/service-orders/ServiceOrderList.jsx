import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceOrderService } from '../../services/serviceOrderService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Receipt, ArrowUpDown, ArrowUp, ArrowDown, Play, Ban, Printer } from 'lucide-react';
import { confirmDelete, confirmAction, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const ServiceOrderList = () => {
    const [serviceOrders, setServiceOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const statusLabels = {
        PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
        EM_PROGRESSO: { label: 'Em Progresso', color: 'bg-blue-100 text-blue-800' },
        COMPLETO: { label: 'Completo', color: 'bg-green-100 text-green-800' },
        CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    };

    useEffect(() => {
        loadServiceOrders();
    }, [sortConfig, searchTerm]);

    const loadServiceOrders = async () => {
        try {
            setLoading(true);
            const params = { sort: `${sortConfig.key},${sortConfig.direction}` };
            let data;

            if (searchTerm) {
                data = await serviceOrderService.search(searchTerm, params);
            } else {
                data = await serviceOrderService.getAll(params);
            }

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

    const handleSearch = (query) => setSearchTerm(query);

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

    const handleCancel = async (id) => {
        const isConfirmed = await confirmAction(
            'Cancelar OS?',
            'Deseja realmente cancelar esta ordem de serviço?',
            'Sim, cancelar',
            '#ef4444'
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
            toast.error(parseApiError(error));
        }
    };

    const handlePrintPdf = async (id) => {
        try {
            const blob = await serviceOrderService.getPdf(id);

            const url = window.URL.createObjectURL(blob);

            window.open(url, '_blank');

            setTimeout(() => window.URL.revokeObjectURL(url), 1000);

        } catch (error) {
            console.error(error);
            toast.error('Erro ao gerar PDF da Ordem de Serviço');
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
                <SearchBar onSearch={handleSearch} placeholder="Buscar por cliente, placa, descrição..." />
            </div>

            {loading ? (
                <div className="text-center py-8">Carregando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <SortableTh label="ID" sortKey="id" />
                            <SortableTh label="Veículo" sortKey="vehicle.model.name" />
                            <SortableTh label="Placa" sortKey="vehicle.licensePlate" />
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
                                            {order.vehicleModelName || '-'}
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

                                                <button
                                                    onClick={() => handlePrintPdf(order.id)}
                                                    className="text-gray-500 hover:text-gray-800 p-1 hover:bg-gray-100 rounded"
                                                    title="Gerar PDF "
                                                >
                                                    <Printer className="w-5 h-5" />
                                                </button>

                                                {(order.status === 'PENDENTE' || order.status === 'INCOMPLETO') && (
                                                    <button
                                                        onClick={() => navigate(`/service-orders/start/${order.id}`)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded group relative"
                                                        title="Iniciar Serviço"
                                                    >
                                                        <Play className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {(order.status === 'PENDENTE' || order.status === 'EM_PROGRESSO') && (
                                                    <button
                                                        onClick={() => handleCancel(order.id)}
                                                        className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded"
                                                        title="Cancelar OS"
                                                    >
                                                        <Ban className="w-5 h-5" />
                                                    </button>
                                                )}

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
        </div>
    );
};

export default ServiceOrderList;