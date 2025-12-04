import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoiceService';
import SearchBar from '../../components/common/SearchBar';
import toast from 'react-hot-toast';
import { ArrowUpDown, ArrowUp, ArrowDown, Printer, CheckCircle, Clock, AlertCircle, Car, FileText } from 'lucide-react';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const statusConfig = {
        PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
        PAID: { label: 'Pago', color: 'bg-green-100 text-green-800', icon: CheckCircle },
        OVERDUE: { label: 'Vencido', color: 'bg-red-100 text-red-800', icon: AlertCircle },
        CANCELED: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
    };

    useEffect(() => {
        loadInvoices();
    }, [sortConfig, searchTerm]);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const params = { sort: `${sortConfig.key},${sortConfig.direction}` };
            let data;

            if (searchTerm) {
                data = await invoiceService.search(searchTerm, params);
            } else {
                data = await invoiceService.getAll(params);
            }

            if (Array.isArray(data)) setInvoices(data);
            else if (data?.content) setInvoices(data.content);
            else setInvoices([]);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar faturas');
            setInvoices([]);
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

    const handleStatusChange = async (id, newStatus) => {
        try {
            await invoiceService.updatePaymentStatus(id, newStatus);
            toast.success('Status atualizado com sucesso!');
            loadInvoices();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar status');
        }
    };

    const formatMoney = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    const formatData = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleDateString('pt-BR');
        } catch (e) { return '-'; }
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

    const handlePrintInvoice = async (id) => {
        try {
            const blob = await invoiceService.getInvoicePdf(id);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao gerar PDF da Fatura');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Faturas</h1>
            </div>

            <div className="mb-6">
                <SearchBar onSearch={handleSearch} placeholder="Buscar por número, cliente ou placa..." />
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Carregando faturas...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <SortableTh label="Fatura" sortKey="id" className="w-20" />
                            <SortableTh label="OS Origem" sortKey="serviceOrderId" className="w-24" /> {/* Nova Coluna OS */}
                            <SortableTh label="Cliente" sortKey="clientName" />
                            <SortableTh label="Veículo" sortKey="licensePlate" />
                            <SortableTh label="Emissão" sortKey="issueDate" />
                            <SortableTh label="Valor" sortKey="totalAmount" />
                            <SortableTh label="Status" sortKey="paymentStatus" />
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                    Nenhuma fatura encontrada.
                                </td>
                            </tr>
                        ) : (
                            invoices.map((invoice) => {
                                const statusInfo = statusConfig[invoice.paymentStatus] || { label: invoice.paymentStatus, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
                                const StatusIcon = statusInfo.icon;

                                return (
                                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                                            #{invoice.id}
                                        </td>

                                        {/* Coluna ID da OS com Link */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                                            {invoice.serviceOrderId ? (
                                                <div
                                                    onClick={() => navigate(`/service-orders/edit/${invoice.serviceOrderId}`)}
                                                    className="flex items-center cursor-pointer hover:underline gap-1"
                                                    title="Ir para Ordem de Serviço"
                                                >
                                                    <FileText className="w-3 h-3" />
                                                    OS #{invoice.serviceOrderId}
                                                </div>
                                            ) : '-'}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <div className="font-medium">{invoice.clientName || 'Cliente Removido'}</div>
                                        </td>

                                        {/* Coluna Veículo (Placa/Modelo) */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {invoice.licensePlate ? (
                                                <div className="flex flex-col">
                                                        <span className="font-bold uppercase flex items-center gap-1">
                                                            <Car className="w-3 h-3 text-gray-400" />
                                                            {invoice.licensePlate}
                                                        </span>
                                                    <span className="text-xs text-gray-500">{invoice.vehicleModel || ''}</span>
                                                </div>
                                            ) : '-'}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatData(invoice.issueDate)}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            {formatMoney(invoice.totalAmount)}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {statusInfo.label}
                                                </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handlePrintInvoice(invoice.id)}
                                                    className="text-gray-500 hover:text-gray-800 p-1 hover:bg-gray-100 rounded"
                                                    title="Imprimir Fatura"
                                                >
                                                    <Printer className="w-5 h-5" />
                                                </button>
                                                <select
                                                    value={invoice.paymentStatus}
                                                    onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                                                    className="text-xs border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 py-1 pl-2 pr-6 bg-white shadow-sm cursor-pointer hover:border-primary-400"
                                                    disabled={invoice.paymentStatus === 'PAID' || invoice.paymentStatus === 'CANCELED'}
                                                >
                                                    <option value="PENDING">Pendente</option>
                                                    <option value="PAID">Pago</option>
                                                    <option value="OVERDUE">Vencido</option>
                                                    <option value="CANCELED">Cancelar</option>
                                                </select>
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

export default InvoiceList;