import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, FileText, ArrowRight } from 'lucide-react';
import { confirmDelete, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const QuotationList = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Configuração visual dos status
    const statusConfig = {
        AWAITING_CONVERSION: { label: 'Aguardando Aprovação', color: 'bg-yellow-100 text-yellow-800' },
        CONVERTED_TO_ORDER: { label: 'Convertido em OS', color: 'bg-green-100 text-green-800' },
        CANCELED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    };

    useEffect(() => {
        loadQuotations();
    }, []);

    const loadQuotations = async () => {
        try {
            setLoading(true);
            const data = await quotationService.getAll();

            // Debug: Veja no console o que exatamente está chegando
            console.log("Dados da listagem:", data);

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

    const handleSearch = async (query) => {
        if (!query.trim()) {
            loadQuotations();
            return;
        }
        try {
            setLoading(true);
            const data = await quotationService.search(query);
            if (Array.isArray(data)) setQuotations(data);
            else if (data?.content) setQuotations(data.content);
            else setQuotations([]);
        } catch (error) {
            toast.error('Erro ao buscar orçamentos');
            setQuotations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirmDelete('Excluir Orçamento?');
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
            const a = document.createElement('a');
            a.href = url;
            a.download = `orcamento-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('PDF gerado com sucesso');
        } catch (error) {
            toast.error('Erro ao gerar PDF');
        }
    };

    const handleConvertToServiceOrder = async (id) => {
        if (!window.confirm('Deseja converter este orçamento em ordem de serviço?')) {
            return;
        }
        try {
            await quotationService.convertToServiceOrder(id);
            await showAlert('Sucesso!', 'Orçamento convertido em OS.');
            loadQuotations();
        } catch (error) {
            const message = parseApiError(error);
            showAlert('Erro!', message, 'error');
        }
    };



    const getClientName = (q) => {
        return q.clientName || 'Cliente N/A';
    };

    const getVehicleInfo = (q) => {
        return q.vehicleLicensePlate || 'Veículo N/A';
    };

    const getTotalValue = (q) => {
        const val = q.grand_total ?? q.totalCost ?? q.total ?? 0;
        return Number(val);
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
                <SearchBar onSearch={handleSearch} placeholder="Buscar orçamentos..." />
            </div>

            {loading ? (
                <div className="text-center py-8">Carregando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
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
                                            {getVehicleInfo(quotation)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {getClientName(quotation)}
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
                                            <button onClick={() => handleDownloadPDF(quotation.id)} className="text-blue-600 hover:text-blue-900 mr-3" title="PDF"><FileText className="w-5 h-5" /></button>
                                            {statusKey === 'AWAITING_CONVERSION' && (
                                                <button onClick={() => handleConvertToServiceOrder(quotation.id)} className="text-green-600 hover:text-green-900 mr-3" title="Converter"><ArrowRight className="w-5 h-5" /></button>
                                            )}
                                            <button onClick={() => navigate(`/quotations/edit/${quotation.id}`)} className="text-primary-600 hover:text-primary-900 mr-3" title="Editar"><Edit className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(quotation.id)} className="text-red-600 hover:text-red-900" title="Excluir"><Trash2 className="w-5 h-5" /></button>
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