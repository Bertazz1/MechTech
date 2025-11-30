import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleModelService } from '../../../services/vehicleModelService';
import SearchBar from '../../../components/common/SearchBar';
import Button from '../../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Car } from 'lucide-react';
import { confirmDelete, showAlert } from '../../../utils/alert';
import { parseApiError } from '../../../utils/errorUtils';

const VehicleModelList = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadModels();
    }, [searchTerm]);

    const loadModels = async () => {
        try {
            setLoading(true);
            let data;
            if (searchTerm) {
                data = await vehicleModelService.search(searchTerm);
            } else {
                data = await vehicleModelService.getAll();
            }

            if (Array.isArray(data)) setModels(data);
            else if (data?.content) setModels(data.content);
            else setModels([]);
        } catch (error) {
            toast.error('Erro ao carregar modelos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (await confirmDelete('Excluir Modelo?')) {
            try {
                await vehicleModelService.delete(id);
                toast.success('Modelo excluído!');
                loadModels();
            } catch (error) {
                showAlert('Erro', parseApiError(error), 'error');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Car className="w-8 h-8 text-primary-600" /> Modelos de Veículos
                </h1>
                <Button onClick={() => navigate('/vehicle-models/new')} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Novo Modelo
                </Button>
            </div>

            <div className="mb-6">
                <SearchBar onSearch={setSearchTerm} placeholder="Buscar modelo..." />
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {models.length === 0 ? (
                        <tr><td colSpan="3" className="text-center py-4 text-gray-500">Nenhum modelo encontrado.</td></tr>
                    ) : (
                        models.map((model) => (
                            <tr key={model.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    {model.brandName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{model.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => navigate(`/vehicle-models/edit/${model.id}`)} className="text-primary-600 hover:text-primary-900 mr-3">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(model.id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VehicleModelList;