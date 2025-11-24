import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../services/clientService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { confirmDelete, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const ClientList = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState(''); // Estado para busca
    const navigate = useNavigate();

    useEffect(() => {
        loadClients();
    }, [sortConfig, searchTerm]); // Recarrega se ordenação ou busca mudar

    const loadClients = async () => {
        try {
            setLoading(true);
            const params = { sort: `${sortConfig.key},${sortConfig.direction}` };
            let data;

            if (searchTerm) {
                // Usa o endpoint de busca se houver termo
                data = await clientService.search(searchTerm, params);
            } else {
                data = await clientService.getAll(params);
            }

            if (Array.isArray(data)) setClients(data);
            else if (data?.content) setClients(data.content);
            else setClients([]);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar clientes');
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchTerm(query);
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

    const SortableTh = ({ label, sortKey, className = "" }) => (
        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors ${className}`} onClick={() => handleSort(sortKey)}>
            <div className="flex items-center">{label} <SortIcon columnKey={sortKey} /></div>
        </th>
    );

    const handleDelete = async (id) => {
        if (await confirmDelete('Excluir Cliente?', 'Isso removerá o cliente permanentemente.')) {
            try {
                await clientService.delete(id);
                await showAlert('Excluído!', 'Cliente removido com sucesso.');
                loadClients();
            } catch (error) {
                showAlert('Erro!', parseApiError(error), 'error');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
                <Button onClick={() => navigate('/clients/new')} className="flex items-center gap-2"><Plus className="w-5 h-5" /> Novo Cliente</Button>
            </div>
            <div className="mb-6">
                <SearchBar onSearch={handleSearch} placeholder="Buscar por nome, email ou CPF..." />
            </div>
            {loading ? <div className="text-center py-8">Carregando...</div> : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <SortableTh label="Nome" sortKey="name" />
                            <SortableTh label="CPF" sortKey="cpf" />
                            <SortableTh label="Email" sortKey="email" />
                            <SortableTh label="Telefone" sortKey="phone" />
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {clients?.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4 text-gray-500">Nenhum cliente encontrado.</td></tr>
                        ) : (
                            clients?.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.cpf}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => navigate(`/clients/edit/${client.id}`)} className="text-primary-600 hover:text-primary-900 mr-3"><Edit className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5" /></button>
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
export default ClientList;