import { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';
import SearchBar from '../../components/common/SearchBar';
import toast from 'react-hot-toast';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

    const statusLabels = {
        PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
        PAID: { label: 'Pago', color: 'bg-green-100 text-green-800' },
        OVERDUE: { label: 'Vencido', color: 'bg-red-100 text-red-800' },
    };

    useEffect(() => { loadInvoices(); }, [sortConfig]);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const params = { sort: `${sortConfig.key},${sortConfig.direction}` };
            const data = await invoiceService.getAll(params);
            if (Array.isArray(data)) setInvoices(data);
            else if (data?.content) setInvoices(data.content);
            else setInvoices([]);
        } catch (error) {
            toast.error('Erro ao carregar faturas');
            setInvoices([]);
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

    const handleStatusChange = async (id, newStatus) => {
        try {
            await invoiceService.updatePaymentStatus(id, newStatus);
            toast.success('Status atualizado');
            loadInvoices();
        } catch (error) {
            toast.error('Erro ao atualizar status');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Faturas</h1>
            </div>
            <div className="mb-6"><SearchBar onSearch={() => loadInvoices()} placeholder="Buscar faturas..." /></div>
            {loading ? <div className="text-center py-8">Carregando...</div> : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <SortableTh label="ID" sortKey="id" />
                            <SortableTh label="Cliente" sortKey="client.name" />
                            <SortableTh label="Valor Total" sortKey="totalAmount" />
                            <SortableTh label="Emissão" sortKey="issueDate" />
                            <SortableTh label="Status" sortKey="paymentStatus" />
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {invoices?.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{invoice.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{invoice.client?.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">R$ {invoice.totalAmount?.toFixed(2)}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusLabels[invoice.paymentStatus]?.color}`}>{statusLabels[invoice.paymentStatus]?.label || invoice.paymentStatus}</span></td>
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                    <select value={invoice.paymentStatus} onChange={(e) => handleStatusChange(invoice.id, e.target.value)} className="px-3 py-1 border rounded-lg text-sm">
                                        <option value="PENDING">Pendente</option>
                                        <option value="PAID">Pago</option>
                                        <option value="OVERDUE">Vencido</option>
                                    </select>
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
export default InvoiceList;