import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { clientService } from '../../services/clientService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import toast from 'react-hot-toast';
import { parseApiError, getValidationErrors } from '../../utils/errorUtils';

const VehicleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: '',
        licensePlate: '',
        color: '',
        clientId: ''
    });

    useEffect(() => {
        loadClients();
        if (id) {
            loadVehicle();
        }
    }, [id]);

    const loadClients = async () => {
        try {
            const data = await clientService.getAll();
            if (Array.isArray(data)) {
                setClients(data);
            } else if (data?.content && Array.isArray(data.content)) {
                setClients(data.content);
            } else {
                setClients([]);
            }
        } catch (error) {
            toast.error('Erro ao carregar lista de clientes');
            setClients([]);
        }
    };

    const loadVehicle = async () => {
        try {
            const data = await vehicleService.getById(id);
            setFormData({
                brand: data.brand,
                model: data.model,
                year: data.year,
                // Formata a placa ao carregar do banco
                licensePlate: data.licensePlate ? formatLicensePlate(data.licensePlate) : '',
                color: data.color,
                clientId: data.client?.id || ''
            });
        } catch (error) {
            toast.error(parseApiError(error));
            navigate('/vehicles');
        }
    };

    // --- FUNÇÃO DE MÁSCARA DE PLACA ---
    const formatLicensePlate = (value) => {
        if (!value) return '';

        // 1. Remove tudo que não for letra ou número e transforma em maiúscula
        let v = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

        // 2. Limita a 7 caracteres
        if (v.length > 7) v = v.slice(0, 7);

        // 3. Verifica se é Mercosul (A 5ª posição, index 4, é uma letra?)
        // Ex: ABC1D23 (D é letra) vs ABC1234 (2 é número)
        const isMercosul = v.length > 4 && isNaN(v[4]);

        if (isMercosul) {
            return v; // Retorna formato Mercosul limpo (ABC1D23)
        } else {
            // Retorna formato Antigo com hífen (ABC-1234)
            // Adiciona o hífen apenas se já tiver números após as letras
            return v.replace(/^([A-Z]{3})(\d)/, '$1-$2');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }

        if (name === 'licensePlate') {
            // Aplica a máscara no campo de placa
            setFormData({ ...formData, [name]: formatLicensePlate(value) });
        } else if (name === 'licensePlate') {
            // Força maiúscula para outros campos que precisem (opcional)
            setFormData({ ...formData, [name]: value.toUpperCase() });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({});

        // Limpa a placa (remove hífen) antes de enviar para o backend
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
            toast.error(parseApiError(error));
            const validationErrors = getValidationErrors(error);
            if (Object.keys(validationErrors).length > 0) {
                setFieldErrors(validationErrors);
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

                        <Select
                            label="Proprietário (Cliente)"
                            name="clientId"
                            value={formData.clientId}
                            onChange={handleChange}
                            options={clients.map(client => ({
                                value: client.id,
                                label: `${client.name} (CPF: ${client.cpf})`
                            }))}
                            error={fieldErrors.clientId}
                            required
                        />

                        <Input
                            label="Placa"
                            name="licensePlate"
                            value={formData.licensePlate}
                            onChange={handleChange}
                            placeholder="ABC-1234"
                            error={fieldErrors.licensePlate}
                            maxLength={8} // 7 chars + 1 hífen
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