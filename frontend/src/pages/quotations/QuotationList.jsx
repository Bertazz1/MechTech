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

    useEffect(() => {
        loadQuotations();
    }, []);

    const loadQuotations = async () => {
        try {
            setLoading(true);
            const data = await quotationService.getAll();
            if (Array.isArray(data)) setQuotations(data);
            else if (data?.content) setQuotations(data.content);
            else setQuotations([]);
        } catch (error) {
            toast.error('Erro ao carregar orçamentos'); // <---
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
            toast.error('Erro ao buscar orçamentos'); // <---
            setQuotations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirmDelete(
            'Excluir Orçamento?', // <---
            'Esta ação não pode ser desfeita.'
        );

        if (!isConfirmed) return;

        try {
            await quotationService.delete(id);
            await showAlert('Excluído!', 'Orçamento removido com sucesso.'); // <---
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
            a.download = `orcamento-${id}.pdf`; // <--- Nome do arquivo
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
        if (!window.confirm('Deseja converter este orçamento em ordem de serviço?')) { // <---
            return;
        }

        try {
            await quotationService.convertToServiceOrder(id);
            await showAlert('Sucesso!', 'Orçamento convertido em OS.'); // <---
            loadQuotations();
        } catch (error) {
            const message = parseApiError(error);
            showAlert('Erro!', message, 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Orçamentos</h1> {/* <--- */}
                <Button onClick={() => navigate('/quotations/new')} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Novo Orçamento {/* <--- */}
                </Button>
            </div>

            <div className="mb-6">
                <SearchBar onSearch={handleSearch} placeholder="Buscar orçamentos..." /> {/* <--- */}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {quotations?.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Nenhum orçamento encontrado</td> {/* <--- */}
                            </tr>
                        ) : (
                            quotations?.map((quotation) => (
                                <tr key={quotation.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{quotation.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quotation.vehicle?.model}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quotation.client?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {quotation.total?.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(quotation.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDownloadPDF(quotation.id)} className="text-blue-600 hover:text-blue-900 mr-3" title="Gerar PDF">
                                            <FileText className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleConvertToServiceOrder(quotation.id)} className="text-green-600 hover:text-green-900 mr-3" title="Converter em OS">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => navigate(`/quotations/edit/${quotation.id}`)} className="text-primary-600 hover:text-primary-900 mr-3">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(quotation.id)} className="text-red-600 hover:text-red-900">
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

export default QuotationList;