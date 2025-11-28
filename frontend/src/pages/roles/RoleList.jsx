import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleService } from '../../services/roleService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, ShieldCheck, Check, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { confirmDelete, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const RoleList = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadRoles();
    }, [sortConfig, searchTerm]);

    const loadRoles = async () => {
        try {
            setLoading(true);
            const params = { sort: `${sortConfig.key},${sortConfig.direction}` };
            let data;

            if (searchTerm) {
                data = await roleService.search(searchTerm, params);
            } else {
                data = await roleService.getAll(params);
            }

            if (Array.isArray(data)) setRoles(data);
            else if (data?.content) setRoles(data.content);
            else setRoles([]);
        } catch (error) {
            toast.error('Erro ao carregar cargos');
            setRoles([]);
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
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-1 text-primary-600" /> : <ArrowDown className="w-4 h-4 ml-1 text-primary-600" />;
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirmDelete(
            'Excluir Cargo?',
            'Funcionários com este cargo precisarão ser atualizados.'
        );

        if (isConfirmed) {
            try {
                await roleService.delete(id);
                await showAlert('Excluído!', 'Cargo removido com sucesso.');
                loadRoles();
            } catch (error) {
                showAlert('Erro', parseApiError(error), 'error');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-primary-600" /> Cargos
                </h1>
                <Button onClick={() => navigate('/roles/new')} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Novo Cargo
                </Button>
            </div>

            <div className="mb-6">
                <SearchBar onSearch={handleSearch} placeholder="Buscar por nome..." />
            </div>

            {loading ? (
                <div className="text-center py-8">Carregando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center">Nome <SortIcon columnKey="name" /></div>
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Comissão?
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {roles.length === 0 ? (
                            <tr><td colSpan="3" className="text-center py-4 text-gray-500">Nenhum cargo encontrado.</td></tr>
                        ) : (
                            roles.map((role) => (
                                <tr key={role.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{role.name}</td>
                                    <td className="px-6 py-4 text-center">
                                        {role.receivesCommission ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <Check className="w-3 h-3 mr-1" /> Sim
                                                </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    <X className="w-3 h-3 mr-1" /> Não
                                                </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => navigate(`/roles/edit/${role.id}`)} className="text-primary-600 hover:text-primary-900 mr-3">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:text-red-900">
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

export default RoleList;