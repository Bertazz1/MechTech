import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Printer, ArrowRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { confirmDelete, confirmAction, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const QuotationList = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const statusConfig = {
        AWAITING_CONVERSION: { label: 'Aguardando Aprovação', color: 'bg-yellow-100 text-yellow-800' },
        CONVERTED_TO_ORDER: { label: 'Convertido em OS', color: 'bg-green-100 text-green-800' },
        CANCELED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    };

    useEffect(() => {
        loadQuotations();
    }, [sortConfig, searchTerm]);

    const loadQuotations = async () => {
        try {
            setLoading(true);
            const params = { sort: `${sortConfig.key},${sortConfig.direction}` };
            let data;

            if (searchTerm) {
                data = await quotationService.search(searchTerm, params);
            } else {
                data = await quotationService.getAll(params);
            }

            if (Array.isArray(data)) {
                setQuotations(data);
            } else if (data?.content && Array.isArray(data.content)) {
                setQuotations(data.content);
            } else {
                setQuotations([]);
            }
        } catch (error) {
            console.error("Erro ao carregar:", error);
            toast.error('Erro ao carregar orçamentos');
            setQuotations([]);
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
            'Excluir Orçamento?',
            'Esta ação não pode ser desfeita.'
        );

        if (!isConfirmed) return;

        try {
            await quotationService.delete(id);
            await showAlert('Excluído!', 'Orçamento removido com sucesso.');
            loadQuotations();
        } catch (error) {
            const message = parseApiError(error);
            showAlert('Erro!', message, 'error');
        }
    };

    const handleDownloadPDF = async (id) => {
        try {
            const blob = await quotationService.downloadPDF(id);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);

        } catch (error) {
            toast.error('Erro ao gerar PDF');
        }
    };

    const handleConvertToServiceOrder = async (id) => {
        const isConfirmed = await confirmAction(
            'Converter em OS?',
            'Isso criará uma nova Ordem de Serviço baseada neste orçamento.',
            'Sim, converter!',
            '#10b981'
        );

        if (!isConfirmed) return;

        try {
            await quotationService.convertToServiceOrder(id);
            await showAlert('Sucesso!', 'Orçamento convertido em OS.');
            loadQuotations();
        } catch (error) {
            const message = parseApiError(error);
            showAlert('Erro!', message, 'error');
        }
    };

    const getTotalValue = (q) => {
        return Number(q.grand_total || q.totalCost || q.TotalCost || 0);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Orçamentos</h1>
                <Button onClick={() => navigate('/quotations/new')} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Novo Orçamento
                </Button>
            </div>

            <div className="mb-6">
                <SearchBar onSearch={handleSearch} placeholder="Buscar por cliente, veículo ou descrição..." />
            </div>

            {loading ? (
                <div className="text-center py-8">Carregando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <SortableTh label="ID" sortKey="id" />
                            <SortableTh label="Veículo" sortKey="vehicleLicensePlate" />
                            <SortableTh label="Cliente" sortKey="clientName" />
                            <SortableTh label="Status" sortKey="status" />
                            <SortableTh label="Total" sortKey="totalCost" />
                            <SortableTh label="Data" sortKey="entryTime" />
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {quotations?.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                    Nenhum orçamento encontrado
                                </td>
                            </tr>
                        ) : (
                            quotations?.map((quotation) => {
                                const statusKey = quotation.status || 'AWAITING_CONVERSION';
                                const statusInfo = statusConfig[statusKey] || { label: statusKey, color: 'bg-gray-100 text-gray-800' };

                                return (
                                    <tr key={quotation.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{quotation.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {quotation.vehicleLicensePlate || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {quotation.clientName || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                                              {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            R$ {getTotalValue(quotation).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {quotation.entryTime ? new Date(quotation.entryTime).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleDownloadPDF(quotation.id)}
                                                    className="text-gray-500 hover:text-gray-800 p-1 hover:bg-gray-100 rounded"
                                                    title="Gerar PDF "
                                                >
                                                    <Printer className="w-5 h-5" />
                                                </button>

                                                {statusKey === 'AWAITING_CONVERSION' && (
                                                    <button
                                                        onClick={() => handleConvertToServiceOrder(quotation.id)}
                                                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                                        title="Converter em OS"
                                                    >
                                                        <ArrowRight className="w-5 h-5" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => navigate(`/quotations/edit/${quotation.id}`)}
                                                    className="text-primary-600 hover:text-primary-900 p-1 hover:bg-blue-50 rounded"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(quotation.id)}
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

export default QuotationList;