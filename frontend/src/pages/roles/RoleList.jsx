import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleService } from '../../services/roleService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, ShieldCheck, Check, X } from 'lucide-react'; // Ícone ShieldCheck para cargo
import { confirmDelete, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const RoleList = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadRoles();
    }, [searchTerm]);

    const loadRoles = async () => {
        try {
            setLoading(true);
            let data;
            if (searchTerm) {
                data = await roleService.search(searchTerm);
            } else {
                data = await roleService.getAll();
            }

            if (Array.isArray(data)) setRoles(data);
            else if (data?.content) setRoles(data.content);
            else setRoles([]);
        } catch (error) {
            toast.error('Erro ao carregar cargos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (await confirmDelete('Excluir Cargo?', 'Funcionários vinculados podem ficar sem cargo.')) {
            try {
                await roleService.delete(id);
                toast.success('Cargo excluído!');
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
                    <ShieldCheck className="w-8 h-8 text-primary-600" /> Cargos e Funções
                </h1>
                <Button onClick={() => navigate('/roles/new')} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Novo Cargo
                </Button>
            </div>

            <div className="mb-6">
                <SearchBar onSearch={setSearchTerm} placeholder="Buscar cargo..." />
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Comissionado?</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {roles.map((role) => (
                        <tr key={role.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{role.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{role.description || '-'}</td>
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
                                <button onClick={() => navigate(`/roles/edit/${role.id}`)} className="text-primary-600 hover:text-primary-900 mr-3"><Edit className="w-5 h-5" /></button>
                                <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5" /></button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoleList;