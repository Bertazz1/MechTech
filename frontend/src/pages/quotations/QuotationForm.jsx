import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import { vehicleService } from '../../services/vehicleService'; // O serviço já tem o método search
import { partService } from '../../services/partService';
import { repairService } from '../../services/repairService';
import Select from '../../components/common/Select';
import AsyncSelect from '../../components/common/AsyncSelect'; // Usando o componente dinâmico
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { parseApiError, getValidationErrors } from '../../utils/errorUtils';

const QuotationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        vehicleId: '',
        entryTime: getLocalDateTime(),
        description: '',
        status: 'AWAITING_CONVERSION',
        items: [],
    });

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);

    // Função auxiliar de data
    function getLocalDateTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    }

    const statusOptions = [
        { value: 'CANCELED', label: 'Cancelado' },
    ];

    // Cálculos
    const totals = useMemo(() => {
        const partsTotal = formData.items
            .filter(i => i.type === 'PART')
            .reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);

        const servicesTotal = formData.items
            .filter(i => i.type === 'SERVICE')
            .reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);

        return { partsTotal, servicesTotal, total: partsTotal + servicesTotal };
    }, [formData.items]);

    useEffect(() => {
        if (id) {
            loadQuotation();
        }
    }, [id]);

    const loadQuotation = async () => {
        try {
            const data = await quotationService.getById(id);

            const loadedItems = [];

            // Mapeia Peças
            if (data.partItems) {
                data.partItems.forEach(item => {
                    loadedItems.push({
                        type: 'PART',
                        selectedOption: {
                            value: item.partId || item.part?.id,
                            label: item.partName || item.part?.name || `Peça #${item.partId}`,
                            price: item.unitPrice
                        },
                        quantity: item.quantity,
                        unitPrice: item.unitPrice
                    });
                });
            }

            // Mapeia Serviços
            if (data.serviceItems) {
                data.serviceItems.forEach(item => {
                    loadedItems.push({
                        type: 'SERVICE',
                        selectedOption: {
                            value: item.serviceId,
                            label: item.serviceName,
                            price: item.serviceCost
                        },
                        quantity: item.quantity || 1,
                        unitPrice: item.serviceCost
                    });
                });
            }

            let formattedEntryTime = '';
            if (data.entryTime) {
                formattedEntryTime = data.entryTime.length > 16 ? data.entryTime.slice(0, 16) : data.entryTime;
            }

            // Preenche o veículo selecionado visualmente
            if (data.vehicle) {
                setSelectedVehicle({
                    value: data.vehicle.id,
                    label: `${data.vehicle.model} - ${data.vehicle.licensePlate}`,
                    subLabel: data.vehicle.brand,
                    client: data.client // Guarda o cliente para exibir
                });
            }

            setFormData({
                vehicleId: data.vehicle?.id || '',
                entryTime: formattedEntryTime,
                description: data.description || '',
                status: data.status || 'AWAITING_CONVERSION',
                items: loadedItems
            });

            if (data.client) {
                setSelectedClient(data.client);
            }
        } catch (error) {
            console.error(error);
            toast.error(parseApiError(error));
            navigate('/quotations');
        }
    };


    //  Busca de Veículos
    const fetchVehicles = async (query) => {
        try {
            const response = await vehicleService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);

            return list.map(v => ({
                value: v.id,
                label: `${v.brand} ${v.model} - ${v.licensePlate}`,
                subLabel: v.client ? `Cliente: ${v.client.name}` : 'Sem dono',
                client: v.client
            }));
        } catch (e) { return []; }
    };

    const fetchParts = async (query) => {
        try {
            const response = await partService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(p => ({
                value: p.id,
                label: p.name,
                subLabel: `Código: ${p.code} | R$ ${p.price.toFixed(2)}`,
                price: p.price
            }));
        } catch (e) { return []; }
    };

    const fetchServices = async (query) => {
        try {
            const response = await repairService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(s => ({
                value: s.id,
                label: s.name,
                subLabel: `Custo Base: R$ ${s.baseCost?.toFixed(2)}`,
                price: s.baseCost || s.cost
            }));
        } catch (e) { return []; }
    };


    const handleVehicleChange = (option) => {
        setSelectedVehicle(option);

        if (option) {
            setFormData(prev => ({ ...prev, vehicleId: option.value }));
            // Preenche o cliente automaticamente baseado no veículo selecionado
            setSelectedClient(option.client || null);
        } else {
            setFormData(prev => ({ ...prev, vehicleId: '' }));
            setSelectedClient(null);
        }
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { type: 'PART', selectedOption: null, quantity: 1, unitPrice: 0 }]
        }));
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        if (field === 'selectedOption' && value) {
            newItems[index].unitPrice = value.price || 0;
        }

        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({});

        const partItems = formData.items
            .filter(i => i.type === 'PART' && i.selectedOption)
            .map(i => ({
                id: i.selectedOption.value,
                quantity: Number(i.quantity),
                unitPrice: Number(i.unitPrice)
            }));

        const serviceItems = formData.items
            .filter(i => i.type === 'SERVICE' && i.selectedOption)
            .map(i => ({
                id: i.selectedOption.value,
                quantity: Number(i.quantity),
                unitPrice: Number(i.unitPrice)
            }));

        const dataToSend = {
            vehicleId: formData.vehicleId,
            entryTime: formData.entryTime,
            description: formData.description,
            partItems,
            serviceItems
        };

        if (id) {
            dataToSend.status = formData.status;
        }

        try {
            if (id) {
                await quotationService.update(id, dataToSend);
                toast.success('Orçamento atualizado com sucesso');
            } else {
                await quotationService.create(dataToSend);
                toast.success('Orçamento criado com sucesso');
            }
            navigate('/quotations');
        } catch (error) {
            const message = parseApiError(error);
            toast.error(message);

            if (error.response && error.response.status === 422) {
                const errors = getValidationErrors(error);
                setFieldErrors(errors);

                if(partItems.length === 0 && serviceItems.length === 0) {
                    toast.error("Adicione pelo menos um item válido.");
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {id ? 'Editar Orçamento' : 'Novo Orçamento'}
            </h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                        {/* Seletor Dinâmico de Veículos */}
                        <AsyncSelect
                            label="Veículo"
                            placeholder="Busque por placa ou modelo..."
                            fetchOptions={fetchVehicles}
                            value={selectedVehicle}
                            onChange={handleVehicleChange}
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Data de Entrada"
                                type="datetime-local"
                                value={formData.entryTime}
                                onChange={(e) => setFormData({...formData, entryTime: e.target.value})}
                                error={fieldErrors.entryTime}
                                required
                            />

                            {id && (
                                <Select
                                    label="Status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    options={statusOptions}
                                />
                            )}
                        </div>
                    </div>

                    {selectedClient && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                            <p className="text-sm font-medium text-blue-700">Cliente Vinculado:</p>
                            <p className="text-lg font-semibold text-blue-900">{selectedClient.name}</p>
                            <p className="text-sm text-blue-600">{selectedClient.email}</p>
                        </div>
                    )}

                    <div className="mb-6">
                        <Input
                            label="Descrição / Observações"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            error={fieldErrors.description}
                        />
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Itens</h3>
                            <Button type="button" onClick={addItem} className="flex items-center gap-2 text-sm">
                                <Plus className="w-4 h-4" /> Adicionar Item
                            </Button>
                        </div>

                        {formData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3 p-4 bg-gray-50 rounded-lg border border-gray-200 items-center shadow-sm">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                                    <select
                                        value={item.type}
                                        onChange={(e) => {
                                            const newItems = [...formData.items];
                                            newItems[index].type = e.target.value;
                                            newItems[index].selectedOption = null;
                                            newItems[index].unitPrice = 0;
                                            setFormData({...formData, items: newItems});
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                                    >
                                        <option value="PART">Peça</option>
                                        <option value="SERVICE">Serviço</option>
                                    </select>
                                </div>

                                <div className="md:col-span-5">
                                    <AsyncSelect
                                        label="Item (Busca)"
                                        placeholder={item.type === 'PART' ? "Busque peças..." : "Busque serviços..."}
                                        fetchOptions={item.type === 'PART' ? fetchParts : fetchServices}
                                        value={item.selectedOption}
                                        onChange={(val) => updateItem(index, 'selectedOption', val)}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Qtd</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Preço Unit.</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                    />
                                </div>

                                <div className="md:col-span-1 flex justify-center mt-4 md:mt-0">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="text-red-500 hover:text-red-700 transition-colors p-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {formData.items.length === 0 && (
                            <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                Nenhum item adicionado.
                            </div>
                        )}
                    </div>

                    <div className="bg-white border-t-4 border-primary-500 rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                            <Calculator className="w-5 h-5" /> Resumo
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="text-gray-600 space-y-1 text-sm">
                                <p className="flex justify-between"><span>Total Peças:</span> <strong>R$ {totals.partsTotal.toFixed(2)}</strong></p>
                                <p className="flex justify-between"><span>Total Serviços:</span> <strong>R$ {totals.servicesTotal.toFixed(2)}</strong></p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide mb-1">Valor Total</p>
                                <p className="text-3xl font-bold text-primary-600">R$ {totals.total.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <Button type="submit" disabled={loading || formData.items.length === 0}>
                            {loading ? 'Salvando...' : 'Salvar Orçamento'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => navigate('/quotations')}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuotationForm;