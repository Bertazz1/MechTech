import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { clientService } from '../../services/clientService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AsyncSelect from '../../components/common/AsyncSelect';
import toast from 'react-hot-toast';
import { parseApiError, getValidationErrors } from '../../utils/errorUtils';

const VehicleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // Estado para o cliente selecionado (objeto { value, label })
    const [selectedClient, setSelectedClient] = useState(null);

    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: '',
        licensePlate: '',
        color: '',
        clientId: ''
    });

    useEffect(() => {
        if (id) {
            loadVehicle();
        }
    }, [id]);

    // Função de busca para o AsyncSelect
    const fetchClients = async (query) => {
        try {
            const response = await clientService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(c => ({
                value: c.id,
                label: `${c.name}`,
                subLabel: `CPF: ${c.cpf}`
            }));
        } catch (e) {
            return [];
        }
    };

    const loadVehicle = async () => {
        try {
            const data = await vehicleService.getById(id);
            setFormData({
                brand: data.brand,
                model: data.model,
                year: data.year,
                licensePlate: data.licensePlate ? formatLicensePlate(data.licensePlate) : '',
                color: data.color,
                clientId: data.client?.id || ''
            });

            // Preenche o AsyncSelect se houver cliente vinculado
            if (data.client) {
                setSelectedClient({
                    value: data.client.id,
                    label: data.client.name,
                    subLabel: `CPF: ${data.client.cpf}`
                });
            }
        } catch (error) {
            toast.error(parseApiError(error));
            navigate('/vehicles');
        }
    };

    const formatLicensePlate = (value) => {
        if (!value) return '';
        let v = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (v.length > 7) v = v.slice(0, 7);
        const isMercosul = v.length > 4 && isNaN(v[4]);
        if (isMercosul) {
            return v;
        } else {
            return v.replace(/^([A-Z]{3})(\d)/, '$1-$2');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
        if (name === 'licensePlate') {
            setFormData({ ...formData, [name]: formatLicensePlate(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleClientChange = (option) => {
        setSelectedClient(option);
        setFormData(prev => ({ ...prev, clientId: option ? option.value : '' }));
        if (fieldErrors.clientId) {
            setFieldErrors(prev => ({ ...prev, clientId: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({});

        const dataToSend = {
            ...formData,
            licensePlate: formData.licensePlate.replace('-', '')
        };

        try {
            if (id) {
                await vehicleService.update(id, dataToSend);
                toast.success('Veículo atualizado com sucesso');
            } else {
                await vehicleService.create(dataToSend);
                toast.success('Veículo criado com sucesso');
            }
            navigate('/vehicles');
        } catch (error) {
            // Tratamento específico para conflito (Duplicidade)
            if (error.response && error.response.status === 409) {
                const message = error.response.data.message || "Esta placa já está cadastrada no sistema.";

                // Define o erro no campo específico para ficar vermelho
                setFieldErrors({ licensePlate: message });
                toast.error("Erro de validação: Placa duplicada.");
            } else {
                // Tratamento padrão para outros erros
                toast.error(parseApiError(error));
                const validationErrors = getValidationErrors(error);
                if (Object.keys(validationErrors).length > 0) {
                    setFieldErrors(validationErrors);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {id ? 'Editar Veículo' : 'Novo Veículo'}
            </h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className={fieldErrors.clientId ? 'border-red-500' : ''}>
                            <AsyncSelect
                                label="Proprietário (Cliente)"
                                placeholder="Busque por nome ou CPF..."
                                fetchOptions={fetchClients}
                                value={selectedClient}
                                onChange={handleClientChange}
                                required
                            />
                            {fieldErrors.clientId && <p className="mt-1 text-sm text-red-600">{fieldErrors.clientId}</p>}
                        </div>

                        <Input
                            label="Placa"
                            name="licensePlate"
                            value={formData.licensePlate}
                            onChange={handleChange}
                            placeholder="ABC-1234"
                            error={fieldErrors.licensePlate}
                            maxLength={8}
                            required
                        />

                        <Input
                            label="Marca"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            error={fieldErrors.brand}
                            required
                        />

                        <Input
                            label="Modelo"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            error={fieldErrors.model}
                            required
                        />

                        <Input
                            label="Ano"
                            name="year"
                            type="number"
                            value={formData.year}
                            onChange={handleChange}
                            error={fieldErrors.year}
                            required
                        />

                        <Input
                            label="Cor"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            error={fieldErrors.color}
                            required
                        />
                    </div>

                    <div className="flex gap-4 mt-6">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => navigate('/vehicles')}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleForm;