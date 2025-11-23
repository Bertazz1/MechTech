import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { partService } from '../../services/partService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { confirmDelete, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const PartList = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadParts();
    }, []);

    const loadParts = async () => {
        try {
            setLoading(true);
            const data = await partService.getAll();
            if (Array.isArray(data)) setParts(data);
            else if (data?.content) setParts(data.content);
            else setParts([]);
        } catch (error) {
            toast.error('Erro ao carregar peças');
            setParts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        if (!query.trim()) {
            loadParts();
            return;
        }
        try {
            setLoading(true);
            const data = await partService.search(query);
            if (Array.isArray(data)) setParts(data);
            else if (data?.content) setParts(data.content);
            else setParts([]);
        } catch (error) {
            toast.error('Erro ao buscar peças');
            setParts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirmDelete(
            'Excluir Peça?',
            'Esta ação removerá a peça do estoque.'
        );

        if (!isConfirmed) return;

        try {
            await partService.delete(id);
            await showAlert('Excluído!', 'Peça removida com sucesso.');
            loadParts();
        } catch (error) {
            const message = parseApiError(error);
            showAlert('Erro!', message, 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Peças</h1>
                <Button onClick={() => navigate('/parts/new')} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nova Peça
                </Button>
            </div>

            <div className="mb-6">
                <SearchBar onSearch={handleSearch} placeholder="Buscar peças..." />
            </div>

            {loading ? (
                <div className="text-center py-8">Carregando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {parts?.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Nenhuma peça encontrada</td>
                            </tr>
                        ) : (
                            parts?.map((part) => (
                                <tr key={part.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{part.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {part.price?.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.supplier}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => navigate(`/parts/edit/${part.id}`)} className="text-primary-600 hover:text-primary-900 mr-3">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(part.id)} className="text-red-600 hover:text-red-900">
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

export default PartList;