import { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const statusLabels = {
        PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
        PAID: { label: 'Pago', color: 'bg-green-100 text-green-800' },
        OVERDUE: { label: 'Vencido', color: 'bg-red-100 text-red-800' },
    };

    const statusOptions = [
        { value: 'PENDING', label: 'Pendente' },
        { value: 'PAID', label: 'Pago' },
        { value: 'OVERDUE', label: 'Vencido' },
    ];

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const data = await invoiceService.getAll();

            if (Array.isArray(data)) {
                setInvoices(data);
            } else if (data?.content && Array.isArray(data.content)) {
                setInvoices(data.content);
            } else {
                setInvoices([]);
            }
        } catch (error) {
            toast.error('Erro ao carregar faturas');
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        if (!query.trim()) {
            loadInvoices();
            return;
        }

        try {
            setLoading(true);
            const data = await invoiceService.search(query);

            if (Array.isArray(data)) {
                setInvoices(data);
            } else if (data?.content && Array.isArray(data.content)) {
                setInvoices(data.content);
            } else {
                setInvoices([]);
            }
        } catch (error) {
            toast.error('Erro ao buscar faturas');
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await invoiceService.updatePaymentStatus(id, newStatus);
            toast.success('Status atualizado com sucesso');
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

            <div className="mb-6">
                <SearchBar onSearch={handleSearch} placeholder="Buscar faturas..." />
            </div>

            {loading ? (
                <div className="text-center py-8">Carregando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data de Emissão
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {invoices?.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    Nenhuma fatura encontrada
                                </td>
                            </tr>
                        ) : (
                            invoices?.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{invoice.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {invoice.client?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        R$ {invoice.totalAmount?.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              statusLabels[invoice.paymentStatus]?.color || 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {statusLabels[invoice.paymentStatus]?.label || invoice.paymentStatus}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <select
                                            value={invoice.paymentStatus}
                                            onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                                            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                        >
                                            {statusOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
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

export default InvoiceList;