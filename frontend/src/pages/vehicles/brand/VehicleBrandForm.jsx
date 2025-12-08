import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vehicleBrandService } from '../../../services/vehicleBrandService';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import toast from 'react-hot-toast';
import { Tag } from 'lucide-react';
import { parseApiError } from '../../../utils/errorUtils';
import { capitalizeFirstLetter } from '../../../utils/textUtils';

const VehicleBrandForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        if (id) loadBrand();
    }, [id]);

    const loadBrand = async () => {
        try {
            const data = await vehicleBrandService.getById(id);
            setFormData({ name: data.name });
        } catch (error) {
            toast.error('Erro ao carregar marca');
            navigate('/vehicle-brands');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await vehicleBrandService.update(id, formData);
                toast.success('Marca atualizada!');
            } else {
                await vehicleBrandService.create(formData);
                toast.success('Marca criada!');
            }
            navigate('/vehicle-brands');
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {id ? 'Editar Marca' : 'Nova Marca'}
            </h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Nome da Marca"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ name: capitalizeFirstLetter(e.target.value) })}
                        placeholder="Ex: Toyota, Ford, Honda"
                        required
                        icon={Tag}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => navigate('/vehicle-brands')}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleBrandForm;