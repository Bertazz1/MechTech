import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { partService } from '../../services/partService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { confirmDelete, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const PartList = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => { loadParts(); }, [sortConfig, searchTerm]);

    const loadParts = async () => {
        try {
            setLoading(true);
            const params = { sort: `${sortConfig.key},${sortConfig.direction}` };
            let data;

            if (searchTerm) {
                data = await partService.search(searchTerm, params);
            } else {
                data = await partService.getAll(params);
            }

            if (Array.isArray(data)) setParts(data);
            else if (data?.content) setParts(data.content);
            else setParts([]);
        } catch (error) {
            toast.error('Erro ao carregar peças');
            setParts([]);
        } finally { setLoading(false); }
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
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-1 text-primary-600" /> : <ArrowDown className="w-4 h-4 ml-1 text-primary-600" />;
    };

    const SortableTh = ({ label, sortKey }) => (
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort(sortKey)}>
            <div className="flex items-center">{label} <SortIcon columnKey={sortKey} /></div>
        </th>
    );

    const handleDelete = async (id) => {
        if (await confirmDelete('Excluir Peça?')) {
            try { await partService.delete(id); await showAlert('Excluído!', 'Peça removida.'); loadParts(); }
            catch (e) { showAlert('Erro', parseApiError(e), 'error'); }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Peças</h1>
                <Button onClick={() => navigate('/parts/new')} className="flex items-center gap-2"><Plus className="w-5 h-5" /> Nova Peça</Button>
            </div>
            <div className="mb-6">
                <SearchBar onSearch={handleSearch} placeholder="Buscar por nome, código ou fornecedor..." />
            </div>
            {loading ? <div className="text-center py-8">Carregando...</div> : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <SortableTh label="Nome" sortKey="name" />
                            <SortableTh label="Código" sortKey="code" />
                            <SortableTh label="Preço" sortKey="price" />
                            <SortableTh label="Fornecedor" sortKey="supplier" />
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {parts?.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4 text-gray-500">Nenhuma peça encontrada.</td></tr>
                        ) : (
                            parts?.map((part) => (
                                <tr key={part.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{part.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{part.code}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">R$ {part.price?.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{part.supplier}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button onClick={() => navigate(`/parts/edit/${part.id}`)} className="text-primary-600 mr-3"><Edit className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(part.id)} className="text-red-600"><Trash2 className="w-5 h-5" /></button>
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
export default PartList;