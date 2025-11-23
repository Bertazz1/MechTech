import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast'; // Ainda usado para erros de carregamento simples
import { Plus, Edit, Trash2 } from 'lucide-react';
import { confirmDelete, showAlert } from '../../utils/alert';
import { parseApiError } from '../../utils/errorUtils';

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        try {
            setLoading(true);
            const data = await vehicleService.getAll();

            if (Array.isArray(data)) setVehicles(data);
            else if (data?.content) setVehicles(data.content);
            else setVehicles([]);

        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar veículos');
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        if (!query.trim()) {
            loadVehicles();
            return;
        }
        try {
            setLoading(true);
            const data = await vehicleService.search(query);
            if (Array.isArray(data)) setVehicles(data);
            else if (data?.content) setVehicles(data.content);
            else setVehicles([]);
        } catch (error) {
            toast.error('Erro ao buscar veículos');
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirmDelete(
            'Excluir Veículo?',
            'Esta ação removerá o veículo permanentemente.'
        );

        if (!isConfirmed) return;

        try {
            await vehicleService.delete(id);
            await showAlert('Excluído!', 'O veículo foi removido com sucesso.');
            loadVehicles();
        } catch (error) {
            const message = parseApiError(error);
            showAlert('Erro!', message, 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Veículos</h1>
                <Button onClick={() => navigate('/vehicles/new')} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Novo Veículo
                </Button>
            </div>

            <div className="mb-6">
                <SearchBar onSearch={handleSearch} placeholder="Buscar veículos..." />
            </div>

            {loading ? (
                <div className="text-center py-8">Carregando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ano</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cor</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {vehicles?.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Nenhum veículo encontrado</td>
                            </tr>
                        ) : (
                            vehicles?.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.brand}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.model}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.year}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.licensePlate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.color}</td>
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