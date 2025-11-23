import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceOrderService } from '../../services/serviceOrderService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Receipt, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { confirmDelete, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const ServiceOrderList = () => {
    const [serviceOrders, setServiceOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const navigate = useNavigate();

    const statusLabels = {
        PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
        EM_PROGRESSO: { label: 'Em Progresso', color: 'bg-blue-100 text-blue-800' },
        COMPLETO: { label: 'Completo', color: 'bg-green-100 text-green-800' },
        CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    };

    useEffect(() => { loadServiceOrders(); }, [sortConfig]);

    const loadServiceOrders = async () => {
        try {
            setLoading(true);
            const params = { sort: `${sortConfig.key},${sortConfig.direction}` };
            const data = await serviceOrderService.getAll(params);
            if (Array.isArray(data)) setServiceOrders(data);
            else if (data?.content) setServiceOrders(data.content);
            else setServiceOrders([]);
        } catch (error) {
            toast.error('Erro ao carregar ordens de serviço');
            setServiceOrders([]);
        } finally { setLoading(false); }
    };

    const handleSort = (key) => {
        setSortConfig((current) => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-50" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-1 text-primary-600" /> : <ArrowDown className="w-4 h-4 ml-1 text-primary-600" />;
    };

    const SortableTh = ({ label, sortKey }) => (
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort(sortKey)}>
            <div className="flex items-center">{label} <SortIcon columnKey={sortKey} /></div>
        </th>
    );

    const handleDelete = async (id) => {
        if (await confirmDelete('Excluir OS?')) {
            try { await serviceOrderService.delete(id); await showAlert('Excluído!', 'OS removida.'); loadServiceOrders(); }
            catch (e) { showAlert('Erro', parseApiError(e), 'error'); }
        }
    };

    const handleGenerateInvoice = async (id) => {
        if (window.confirm('Gerar fatura?')) {
            try { await serviceOrderService.generateInvoice(id); toast.success('Fatura gerada'); navigate('/invoices'); }
            catch (e) { toast.error('Erro ao gerar fatura'); }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Ordens de Serviço</h1>
                <Button onClick={() => navigate('/service-orders/new')} className="flex items-center gap-2"><Plus className="w-5 h-5" /> Nova Ordem</Button>
            </div>
            <div className="mb-6"><SearchBar onSearch={() => loadServiceOrders()} placeholder="Buscar OS..." /></div>
            {loading ? <div className="text-center py-8">Carregando...</div> : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <SortableTh label="ID" sortKey="id" />
                            <SortableTh label="Descrição" sortKey="description" />
                            <SortableTh label="Status" sortKey="status" />
                            <SortableTh label="Data Entrada" sortKey="entryTime" />
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {serviceOrders?.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{order.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusLabels[order.status]?.color}`}>{statusLabels[order.status]?.label}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.entryDate ? new Date(order.entryDate).toLocaleDateString() : '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {order.status === 'COMPLETO' && <button onClick={() => handleGenerateInvoice(order.id)} className="text-green-600 mr-3"><Receipt className="w-5 h-5" /></button>}
                                    <button onClick={() => navigate(`/service-orders/edit/${order.id}`)} className="text-primary-600 mr-3"><Edit className="w-5 h-5" /></button>
                                    <button onClick={() => handleDelete(order.id)} className="text-red-600"><Trash2 className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
export default ServiceOrderList;