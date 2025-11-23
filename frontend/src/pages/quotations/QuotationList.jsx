import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, FileText, ArrowRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { confirmDelete, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const QuotationList = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const navigate = useNavigate();

    const statusConfig = {
        AWAITING_CONVERSION: { label: 'Aguardando Aprovação', color: 'bg-yellow-100 text-yellow-800' },
        CONVERTED_TO_ORDER: { label: 'Convertido em OS', color: 'bg-green-100 text-green-800' },
        CANCELED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    };

    useEffect(() => { loadQuotations(); }, [sortConfig]);

    const loadQuotations = async () => {
        try {
            setLoading(true);
            const params = { sort: `${sortConfig.key},${sortConfig.direction}` };
            const data = await quotationService.getAll(params);
            if (Array.isArray(data)) setQuotations(data);
            else if (data?.content) setQuotations(data.content);
            else setQuotations([]);
        } catch (error) {
            toast.error('Erro ao carregar orçamentos');
            setQuotations([]);
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
        if (await confirmDelete('Excluir Orçamento?')) {
            try { await quotationService.delete(id); await showAlert('Excluído!', 'Orçamento removido.'); loadQuotations(); }
            catch (e) { showAlert('Erro', parseApiError(e), 'error'); }
        }
    };

    const handleDownloadPDF = async (id) => {
        try {
            const blob = await quotationService.downloadPDF(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `orcamento-${id}.pdf`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('PDF gerado com sucesso');
        } catch { toast.error('Erro ao gerar PDF'); }
    };

    const handleConvertToServiceOrder = async (id) => {
        if (await window.confirm('Converter em ordem de serviço?')) {
            try { await quotationService.convertToServiceOrder(id); await showAlert('Sucesso!', 'Convertido com sucesso.'); loadQuotations(); }
            catch (e) { showAlert('Erro', parseApiError(e), 'error'); }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Orçamentos</h1>
                <Button onClick={() => navigate('/quotations/new')} className="flex items-center gap-2"><Plus className="w-5 h-5" /> Novo Orçamento</Button>
            </div>
            <div className="mb-6"><SearchBar onSearch={() => loadQuotations()} placeholder="Buscar orçamentos..." /></div>
            {loading ? <div className="text-center py-8">Carregando...</div> : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <SortableTh label="ID" sortKey="id" />
                            <SortableTh label="Veículo" sortKey="vehicle.model" />
                            <SortableTh label="Cliente" sortKey="client.name" />
                            <SortableTh label="Status" sortKey="status" />
                            <SortableTh label="Total" sortKey="TotalCost" />
                            <SortableTh label="Data" sortKey="entryTime" />
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {quotations?.map((q) => {
                            const statusInfo = statusConfig[q.status] || { label: q.status, color: 'bg-gray-100' };
                            return (
                                <tr key={q.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{q.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{q.vehicleLicensePlate || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{q.clientName || '-'}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>{statusInfo.label}</span></td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">R$ {(q.grand_total || q.totalCost || 0).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{q.entryTime ? new Date(q.entryTime).toLocaleDateString() : '-'}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleDownloadPDF(q.id)} className="text-blue-600"><FileText className="w-5 h-5" /></button>
                                            {q.status === 'AWAITING_CONVERSION' && <button onClick={() => handleConvertToServiceOrder(q.id)} className="text-green-600"><ArrowRight className="w-5 h-5" /></button>}
                                            <button onClick={() => navigate(`/quotations/edit/${q.id}`)} className="text-primary-600"><Edit className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(q.id)} className="text-red-600"><Trash2 className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
export default QuotationList;