// frontend/src/pages/admin/UserList.jsx
import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Users, Trash2, Shield, User } from 'lucide-react';
import { confirmDelete, showAlert } from '../../utils/alert';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAll();
            if (Array.isArray(data)) setUsers(data);
            else if (data?.content) setUsers(data.content);
        } catch (error) {
            toast.error('Erro ao carregar usuários.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (await confirmDelete('Excluir Usuário?', 'Essa ação não pode ser desfeita.')) {
            try {
                await userService.delete(id);
                toast.success('Usuário removido.');
                loadUsers();
            } catch (error) {
                toast.error('Erro ao excluir usuário.');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Users className="w-8 h-8 text-primary-600" /> Gestão de Usuários
                </h1>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.fullName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        u.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {u.role === 'ROLE_ADMIN' ? <Shield className="w-3 h-3 mr-1"/> : <User className="w-3 h-3 mr-1"/>}
                                        {u.role === 'ROLE_ADMIN' ? 'Admin' : 'Cliente'}
                                    </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserList;