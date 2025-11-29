import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { vehicleModelService } from '../../services/vehicleModelService';
import { clientService } from '../../services/clientService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AsyncSelect from '../../components/common/AsyncSelect';
import toast from 'react-hot-toast';
import { Search, Car, User, Calendar, Palette, Hash, Tag } from 'lucide-react';
import { parseApiError } from '../../utils/errorUtils';

const VehicleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // Estados
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);

    // Estado derivado para exibir a marca (apenas leitura)
    const [displayBrand, setDisplayBrand] = useState('');

    const [formData, setFormData] = useState({
        modelId: '',
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

    // --- Buscas ---

    const fetchClients = async (query) => {
        try {
            const response = await clientService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(c => ({ value: c.id, label: `${c.name}`, subLabel: c.cpf }));
        } catch (e) { return []; }
    };

    // Agora buscamos modelos DIRETAMENTE pelo nome (ex: "Civic")
    const fetchModels = async (query) => {
        try {
            const response = await vehicleModelService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);

            return list.map(m => ({
                value: m.id,
                label: m.name,
                // Mostra a marca no subtítulo para ajudar a diferenciar (ex: Gol - Volkswagen)
                subLabel: m.brandName || (m.brand ? m.brand.name : ''),
                // Guardamos o objeto brand completo para usar ao selecionar
                brandData: m.brand || { name: m.brandName }
            }));
        } catch (e) { return []; }
    };

    const loadVehicle = async () => {
        try {
            const data = await vehicleService.getById(id);

            setFormData({
                modelId: data.modelId || (data.model ? data.model.id : ''),
                year: data.year,
                licensePlate: data.licensePlate ? formatLicensePlate(data.licensePlate) : '',
                color: data.color,
                clientId: data.clientId || (data.client ? data.client.id : '')
            });

            if (data.client) {
                setSelectedClient({ value: data.client.id, label: data.client.name, subLabel: data.client.cpf });
            }

            // Preenche o modelo e a marca
            if (data.model || data.modelName) {
                const modelName = data.modelName || data.model.name;
                const brandName = data.brandName || (data.model?.brand?.name);

                setSelectedModel({
                    value: data.modelId || data.model.id,
                    label: modelName,
                    subLabel: brandName
                });
                setDisplayBrand(brandName || '');
            }

        } catch (error) {
            toast.error(parseApiError(error));
            navigate('/vehicles');
        }
    };

    // --- Handler do Modelo ---
    const handleModelChange = (option) => {
        setSelectedModel(option);
        if (option) {
            setFormData(prev => ({ ...prev, modelId: option.value }));
            // Atualiza o campo de texto da marca baseado no modelo selecionado
            // O fetchModels retorna 'subLabel' ou 'brandData'
            const brandName = option.brandData?.name || option.subLabel;
            setDisplayBrand(brandName);
        } else {
            setFormData(prev => ({ ...prev, modelId: '' }));
            setDisplayBrand('');
        }
    };

    // --- Busca Pela Placa ---
    const handlePlateLookup = async () => {
        const plate = formData.licensePlate;
        const cleanPlate = plate.replace(/[^a-zA-Z0-9]/g, '');

        if (!cleanPlate || cleanPlate.length < 7) {
            toast.error('Digite uma placa válida.');
            return;
        }

        try {
            setSearchLoading(true);
            const data = await vehicleService.lookupPlate(cleanPlate);

            if (data) {
                setFormData(prev => ({
                    ...prev,
                    year: data.year || prev.year,
                    color: data.color || prev.color,
                }));

                // Tenta mostrar a marca e modelo que vieram da API para ajudar o usuário a selecionar manualmente
                let msg = 'Dados encontrados.';
                if (data.brand || data.model) {
                    msg += ` Sugestão: ${data.brand} - ${data.model}`;
                }
                toast.success(msg);
            }
        } catch (error) {
            toast.error('Veículo não encontrado.');
        } finally {
            setSearchLoading(false);
        }
    };

    const formatLicensePlate = (value) => {
        if (!value) return '';
        let v = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (v.length > 7) v = v.slice(0, 7);
        return v;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'licensePlate') {
            setFormData({ ...formData, [name]: formatLicensePlate(value) });
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
            licensePlate: formData.licensePlate.replace('-', '')
        };

        try {
            if (id) {
                await vehicleService.update(id, dataToSend);
                toast.success('Veículo atualizado!');
            } else {
                await vehicleService.create(dataToSend);
                toast.success('Veículo criado!');
            }
            navigate('/vehicles');
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setFieldErrors({ licensePlate: "Placa já cadastrada." });
                toast.error("Placa duplicada.");
            } else {
                toast.error(parseApiError(error));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {id ? 'Editar Veículo' : 'Novo Veículo'}
            </h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Proprietário */}
                        <div className={fieldErrors.clientId ? 'border-red-500' : ''}>
                            <AsyncSelect
                                label="Proprietário (Cliente)"
                                placeholder="Busque por nome ou CPF..."
                                fetchOptions={fetchClients}
                                value={selectedClient}
                                onChange={(opt) => {
                                    setSelectedClient(opt);
                                    setFormData({ ...formData, clientId: opt ? opt.value : '' });
                                }}
                                required
                            />
                        </div>

                        {/* Placa */}
                        <div className="relative">
                            <Input
                                label="Placa"
                                name="licensePlate"
                                value={formData.licensePlate}
                                onChange={handleChange}
                                placeholder="ABC1D23"
                                error={fieldErrors.licensePlate}
                                maxLength={8}
                                required
                                icon={Hash}
                            />
                            <button
                                type="button"
                                onClick={handlePlateLookup}
                                disabled={searchLoading || !formData.licensePlate}
                                className="absolute top-[34px] right-2 p-1.5 text-gray-500 hover:text-primary-600 hover:bg-blue-50 rounded transition-colors"
                                title="Buscar dados automaticamente"
                            >
                                {searchLoading ? (
                                    <span className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full block"></span>
                                ) : (
                                    <Search className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* Modelo (Principal) */}
                        <AsyncSelect
                            label="Modelo do Veículo"
                            placeholder="Busque o modelo "
                            fetchOptions={fetchModels}
                            value={selectedModel}
                            onChange={handleModelChange}
                            required
                        />

                        {/* Marca (Read-Only) */}
                        <div>
                            <Input
                                label="Marca"
                                value={displayBrand}
                                readOnly
                                disabled
                                className="bg-gray-50 text-gray-600 border-gray-200"
                                icon={Tag}
                            />
                        </div>

                        <Input
                            label="Ano"
                            name="year"
                            type="number"
                            value={formData.year}
                            onChange={handleChange}
                            error={fieldErrors.year}
                            required
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            icon={Calendar}
                        />

                        <Input
                            label="Cor"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            error={fieldErrors.color}
                            required
                            icon={Palette}
                        />
                    </div>

                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100 justify-end">
                        <Button type="button" variant="secondary" onClick={() => navigate('/vehicles')}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleForm;