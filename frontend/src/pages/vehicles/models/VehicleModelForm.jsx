import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vehicleModelService } from '../../../services/vehicleModelService';
import { vehicleBrandService } from '../../../services/vehicleBrandService';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import AsyncSelect from '../../../components/common/AsyncSelect';
import toast from 'react-hot-toast';
import { Car } from 'lucide-react';
import { parseApiError } from '../../../utils/errorUtils';

const VehicleModelForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        brandId: ''
    });

    // Função de busca de marcas (estável)
    const fetchBrands = async (query) => {
        try {
            const response = await vehicleBrandService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(b => ({ value: b.id, label: b.name }));
        } catch (e) { return []; }
    };

    // Carrega os dados do modelo
    const loadModel = useCallback(async () => {
        try {
            const data = await vehicleModelService.getById(id);

            // Preenche o formulário
            setFormData({
                name: data.name,
                brandId: data.brand ? data.brand.id : ''
            });

            // PREENCHE O SELETOR DE MARCA
            if (data.brand) {
                setSelectedBrand({
                    value: data.brand.id,
                    label: data.brand.name
                });
            }
        } catch (error) {
            console.error("Erro ao carregar modelo:", error);
            toast.error('Erro ao carregar modelo');
            navigate('/vehicle-models');
        }
    }, [id, navigate]);

    useEffect(() => {
        if (id) {
            loadModel();
        }
    }, [id, loadModel]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!formData.brandId) {
                toast.error('Selecione uma marca');
                setLoading(false);
                return;
            }

            if (id) {
                await vehicleModelService.update(id, formData);
                toast.success('Modelo atualizado!');
            } else {
                await vehicleModelService.create(formData);
                toast.success('Modelo criado!');
            }
            navigate('/vehicle-models');
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {id ? 'Editar Modelo' : 'Novo Modelo'}
            </h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Seletor de Marca */}
                    <div className="relative">
                        <AsyncSelect
                            label="Marca do Veículo"
                            placeholder="Busque a marca..."
                            fetchOptions={fetchBrands}
                            value={selectedBrand} // O componente deve reagir a esta prop
                            onChange={(option) => {
                                setSelectedBrand(option);
                                setFormData(prev => ({ ...prev, brandId: option ? option.value : '' }));
                            }}
                            required
                        />
                    </div>

                    <Input
                        label="Nome do Modelo"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Corolla, Civic, Gol"
                        required
                        icon={Car}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => navigate('/vehicle-models')}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleModelForm;