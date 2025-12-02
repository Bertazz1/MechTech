import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { repairService } from '../../services/repairService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { parseApiError, getValidationErrors } from '../../utils/errorUtils';
import { capitalizeFirstLetter } from '../../utils/textUtils';

const RepairServiceForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cost: '',
    });

    useEffect(() => {
        if (id) {
            loadService();
        }
    }, [id]);

    const loadService = async () => {
        try {
            const data = await repairService.getById(id);
            setFormData({
                name: data.name,
                description: data.description,
                cost: data.cost || data.baseCost || ''
            });
        } catch (error) {
            toast.error(parseApiError(error));
            navigate('/repair-services');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }

        if (name === 'name') {
            setFormData({ ...formData, [name]: capitalizeFirstLetter(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({});

        const dataToSend = {
            ...formData,
            cost: parseFloat(formData.cost)
        };

        try {
            if (id) {
                await repairService.update(id, dataToSend);
                toast.success('Serviço atualizado com sucesso');
            } else {
                await repairService.create(dataToSend);
                toast.success('Serviço criado com sucesso');
            }
            navigate('/repair-services');
        } catch (error) {
            const message = parseApiError(error);
            toast.error(message);

            const validationErrors = getValidationErrors(error);
            if (Object.keys(validationErrors).length > 0) {
                setFieldErrors(validationErrors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {id ? 'Editar Serviço' : 'Novo Serviço'}
            </h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Nome"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={fieldErrors.name}
                        required
                    />

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                                fieldErrors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                        />
                        {fieldErrors.description && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
                        )}
                    </div>

                    <Input
                        label="Custo Base (R$)"
                        type="number"
                        step="0.01"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        error={fieldErrors.cost}
                        required
                    />

                    <div className="flex gap-4 mt-6">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => navigate('/repair-services')}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RepairServiceForm;