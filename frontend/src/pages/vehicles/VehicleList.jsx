import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Car, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { confirmDelete, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadVehicles();
    }, [sortConfig, searchTerm]);

    const loadVehicles = async () => {
        try {
            setLoading(true);
            const params = { sort: `${sortConfig.key},${sortConfig.direction}` };
            let data;

            if (searchTerm) {
                data = await vehicleService.search(searchTerm, params);
            } else {
                data = await vehicleService.getAll(params);
            }

            if (Array.isArray(data)) setVehicles(data);
            else if (data?.content) setVehicles(data.content);
            else setVehicles([]);
        } catch (error) {
            toast.error('Erro ao carregar veículos');
            setVehicles([]);
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

    const SortableTh = ({ label, sortKey, className = "" }) => (
        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors ${className}`} onClick={() => handleSort(sortKey)}>
            <div className="flex items-center">{label} <SortIcon columnKey={sortKey} /></div>
        </th>
    );

    const handleDelete = async (id) => {
        if (await confirmDelete('Excluir Veículo?')) {
            try {
                await vehicleService.delete(id);
                await showAlert('Excluído!', 'Veículo removido.');
                loadVehicles();
            } catch (error) {
                showAlert('Erro', parseApiError(error), 'error');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Car className="w-8 h-8 text-primary-600" /> Veículos
                </h1>
                <Button onClick={() => navigate('/vehicles/new')} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Novo Veículo
                </Button>
            </div>

            <div className="mb-6">
                <SearchBar onSearch={handleSearch} placeholder="Buscar por placa, modelo..." />
            </div>

            {loading ? (
                <div className="text-center py-8">Carregando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <SortableTh label="Marca" sortKey="brand" />
                            <SortableTh label="Modelo" sortKey="model" />
                            <SortableTh label="Ano" sortKey="year" />
                            <SortableTh label="Placa" sortKey="licensePlate" />
                            <SortableTh label="Cor" sortKey="color" />
                            <SortableTh label="Dono" sortKey="client.name" />
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {vehicles.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-4 text-gray-500">Nenhum veículo encontrado.</td></tr>
                        ) : (
                            vehicles.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-gray-50">
                                    {/* Acesso aos dados aninhados (ajuste conforme seu DTO Response) */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {/* Tenta pegar do DTO plano ou aninhado */}
                                        {vehicle.brandName || vehicle.model?.brand?.name || vehicle.model?.brandName || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {vehicle.modelName || vehicle.model?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{vehicle.year}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 uppercase">{vehicle.licensePlate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{vehicle.color}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {vehicle.clientName || vehicle.client?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)} className="text-primary-600 hover:text-primary-900 mr-3">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(vehicle.id)} className="text-red-600 hover:text-red-900">
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

export default VehicleList;