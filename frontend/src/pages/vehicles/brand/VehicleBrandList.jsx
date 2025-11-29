import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleBrandService } from '../../../services/vehicleBrandService';
import SearchBar from '../../../components/common/SearchBar';
import Button from '../../../components/common/Button';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { confirmDelete, showAlert } from '../../../utils/alert';
import { parseApiError } from '../../../utils/errorUtils';

const VehicleBrandList = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadBrands();
    }, [searchTerm]);

    const loadBrands = async () => {
        try {
            setLoading(true);
            let data;
            if (searchTerm) {
                data = await vehicleBrandService.search(searchTerm);
            } else {
                data = await vehicleBrandService.getAll();
            }

            if (Array.isArray(data)) setBrands(data);
            else if (data?.content) setBrands(data.content);
            else setBrands([]);
        } catch (error) {
            toast.error('Erro ao carregar marcas');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (await confirmDelete('Excluir Marca?', 'Modelos vinculados podem ser afetados.')) {
            try {
                await vehicleBrandService.delete(id);
                toast.success('Marca excluída!');
                loadBrands();
            } catch (error) {
                showAlert('Erro', parseApiError(error), 'error');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Tag className="w-8 h-8 text-primary-600" /> Marcas de Veículos
                </h1>
                <Button onClick={() => navigate('/vehicle-brands/new')} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Nova Marca
                </Button>
            </div>

            <div className="mb-6">
                <SearchBar onSearch={setSearchTerm} placeholder="Buscar marca..." />
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {brands.length === 0 ? (
                        <tr><td colSpan="2" className="text-center py-4 text-gray-500">Nenhuma marca encontrada.</td></tr>
                    ) : (
                        brands.map((brand) => (
                            <tr key={brand.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{brand.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => navigate(`/vehicle-brands/edit/${brand.id}`)} className="text-primary-600 hover:text-primary-900 mr-3">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(brand.id)} className="text-red-600 hover:text-red-900">
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

export default VehicleBrandList;