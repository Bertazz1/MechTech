import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { repairService } from '../../services/repairService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { confirmDelete, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const RepairServiceList = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const navigate = useNavigate();

    useEffect(() => { loadServices(); }, [sortConfig]);

    const loadServices = async () => {
        try {
            setLoading(true);
            const params = { sort: `${sortConfig.key},${sortConfig.direction}` };
            const data = await repairService.getAll(params);
            if (Array.isArray(data)) setServices(data);
            else if (data?.content) setServices(data.content);
            else setServices([]);
        } catch (error) {
            toast.error('Erro ao carregar serviços');
            setServices([]);
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
        if (await confirmDelete('Excluir Serviço?')) {
            try { await repairService.delete(id); await showAlert('Excluído!', 'Serviço removido.'); loadServices(); }
            catch (e) { showAlert('Erro', parseApiError(e), 'error'); }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Serviços</h1>
                <Button onClick={() => navigate('/repair-services/new')} className="flex items-center gap-2"><Plus className="w-5 h-5" /> Novo Serviço</Button>
            </div>
            <div className="mb-6"><SearchBar onSearch={() => loadServices()} placeholder="Buscar serviços..." /></div>
            {loading ? <div className="text-center py-8">Carregando...</div> : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <SortableTh label="Nome" sortKey="name" />
                            <SortableTh label="Descrição" sortKey="description" />
                            <SortableTh label="Custo Base" sortKey="cost" />
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {services?.map((service) => (
                            <tr key={service.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{service.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {service.baseCost?.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                    <button onClick={() => navigate(`/repair-services/edit/${service.id}`)} className="text-primary-600 mr-3"><Edit className="w-5 h-5" /></button>
                                    <button onClick={() => handleDelete(service.id)} className="text-red-600"><Trash2 className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
export default RepairServiceList;