import { useState, useEffect, useMemo } from 'react'; // Adicionado useMemo
import { useNavigate, useParams } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import { clientService } from '../../services/clientService';
import { vehicleService } from '../../services/vehicleService';
import { partService } from '../../services/partService';
import { repairService } from '../../services/repairService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import toast from 'react-hot-toast';
import { Plus, Trash2, Calculator } from 'lucide-react'; // Icone Calculator opcional
import { parseApiError } from '../../utils/errorUtils';

const QuotationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [clients, setClients] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [parts, setParts] = useState([]);
    const [services, setServices] = useState([]);

    const [formData, setFormData] = useState({
        clientId: '',
        vehicleId: '',
        partItems: [],    // { partId, quantity, unitPrice }
        serviceItems: [], // { serviceId, quantity, unitPrice }
        discount: 0,
        observation: ''
    });

    // --- CÁLCULOS EM TEMPO REAL ---
    const totals = useMemo(() => {
        const partsTotal = formData.partItems.reduce((acc, item) => {
            return acc + (Number(item.quantity) * Number(item.unitPrice || 0));
        }, 0);

        const servicesTotal = formData.serviceItems.reduce((acc, item) => {
            return acc + (Number(item.quantity) * Number(item.unitPrice || 0));
        }, 0);

        const subtotal = partsTotal + servicesTotal;
        const total = subtotal - Number(formData.discount || 0);

        return { partsTotal, servicesTotal, subtotal, total };
    }, [formData.partItems, formData.serviceItems, formData.discount]);
    // ------------------------------

    useEffect(() => {
        loadDependencies();
        if (id) {
            loadQuotation();
        }
    }, [id]);

    const loadDependencies = async () => {
        try {
            const [clientsData, vehiclesData, partsData, servicesData] = await Promise.all([
                clientService.getAll(),
                vehicleService.getAll(),
                partService.getAll(),
                repairService.getAll()
            ]);
            setClients(Array.isArray(clientsData) ? clientsData : clientsData.content || []);
            setVehicles(Array.isArray(vehiclesData) ? vehiclesData : vehiclesData.content || []);
            setParts(Array.isArray(partsData) ? partsData : partsData.content || []);
            setServices(Array.isArray(servicesData) ? servicesData : servicesData.content || []);
        } catch (error) {
            toast.error('Erro ao carregar dados');
        }
    };

    const loadQuotation = async () => {
        try {
            const data = await quotationService.getById(id);
            setFormData({
                clientId: data.client?.id || '',
                vehicleId: data.vehicle?.id || '',
                // Mapeia garantindo que unitPrice venha do backend ou use o preço da peça/serviço
                partItems: data.partItems?.map(item => ({
                    partId: item.part.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice || item.part.price
                })) || [],
                serviceItems: data.serviceItems?.map(item => ({
                    serviceId: item.service.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice || item.service.baseCost
                })) || [],
                discount: data.discount || 0,
                observation: data.observation || ''
            });
        } catch (error) {
            toast.error(parseApiError(error));
            navigate('/quotations');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (id) {
                await quotationService.update(id, formData);
                toast.success('Orçamento atualizado com sucesso');
            } else {
                await quotationService.create(formData);
                toast.success('Orçamento criado com sucesso');
            }
            navigate('/quotations');
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE PEÇAS ---
    const addPartItem = () => {
        setFormData({ ...formData, partItems: [...formData.partItems, { partId: '', quantity: 1, unitPrice: 0 }] });
    };

    const removePartItem = (index) => {
        const newItems = formData.partItems.filter((_, i) => i !== index);
        setFormData({ ...formData, partItems: newItems });
    };

    const handlePartChange = (index, partId) => {
        const selectedPart = parts.find(p => p.id === Number(partId));
        const newItems = [...formData.partItems];
        newItems[index].partId = partId;
        // Auto-preenche o preço ao selecionar a peça
        if (selectedPart) {
            newItems[index].unitPrice = selectedPart.price;
        }
        setFormData({ ...formData, partItems: newItems });
    };

    const updatePartItem = (index, field, value) => {
        const newItems = [...formData.partItems];
        newItems[index][field] = value;
        setFormData({ ...formData, partItems: newItems });
    };

    // --- LÓGICA DE SERVIÇOS ---
    const addServiceItem = () => {
        setFormData({ ...formData, serviceItems: [...formData.serviceItems, { serviceId: '', quantity: 1, unitPrice: 0 }] });
    };

    const removeServiceItem = (index) => {
        const newItems = formData.serviceItems.filter((_, i) => i !== index);
        setFormData({ ...formData, serviceItems: newItems });
    };

    const handleServiceChange = (index, serviceId) => {
        const selectedService = services.find(s => s.id === Number(serviceId));
        const newItems = [...formData.serviceItems];
        newItems[index].serviceId = serviceId;
        // Auto-preenche o preço ao selecionar o serviço
        if (selectedService) {
            newItems[index].unitPrice = selectedService.baseCost;
        }
        setFormData({ ...formData, serviceItems: newItems });
    };

    const updateServiceItem = (index, field, value) => {
        const newItems = [...formData.serviceItems];
        newItems[index][field] = value;
        setFormData({ ...formData, serviceItems: newItems });
    };

    return (
        <div className="max-w-5xl mx-auto pb-20"> {/* Aumentei max-width e padding bottom */}
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {id ? 'Editar Orçamento' : 'Novo Orçamento'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ... Card Cliente e Veículo (Sem alterações) ... */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Dados Principais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Cliente"
                            name="clientId"
                            value={formData.clientId}
                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                            options={clients.map(c => ({ value: c.id, label: c.name }))}
                            required
                        />
                        <Select
                            label="Veículo"
                            name="vehicleId"
                            value={formData.vehicleId}
                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            options={vehicles.map(v => ({ value: v.id, label: `${v.model} - ${v.licensePlate}` }))}
                            required
                        />
                    </div>
                    <div className="mt-4">
                        <Input
                            label="Observações"
                            name="observation"
                            value={formData.observation}
                            onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                        />
                    </div>
                </div>

                {/* Card Peças */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-700">Peças</h2>
                        <Button type="button" onClick={addPartItem} variant="secondary" className="text-sm py-1">
                            + Adicionar Peça
                        </Button>
                    </div>
                    {formData.partItems.map((item, index) => (
                        <div key={index} className="flex gap-3 items-end mb-3 border-b pb-3 last:border-0">
                            <div className="flex-grow">
                                <Select
                                    label="Peça"
                                    value={item.partId}
                                    onChange={(e) => handlePartChange(index, e.target.value)}
                                    options={parts.map(p => ({ value: p.id, label: `${p.name} (Estoque: ${p.stockQuantity})` }))}
                                    required
                                />
                            </div>
                            <div className="w-24">
                                <Input
                                    label="Qtd"
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updatePartItem(index, 'quantity', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="w-32">
                                <Input
                                    label="Valor Unit."
                                    type="number"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={(e) => updatePartItem(index, 'unitPrice', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="w-28 pb-3 text-right font-medium text-gray-600">
                                R$ {(item.quantity * item.unitPrice).toFixed(2)}
                            </div>
                            <button type="button" onClick={() => removePartItem(index)} className="text-red-500 p-2 hover:bg-red-50 rounded mb-2">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    {formData.partItems.length === 0 && <p className="text-gray-400 text-sm italic">Nenhuma peça adicionada.</p>}

                    {/* Subtotal Peças */}
                    <div className="mt-4 text-right text-sm font-medium text-gray-600">
                        Total Peças: R$ {totals.partsTotal.toFixed(2)}
                    </div>
                </div>

                {/* Card Serviços */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-700">Mão de Obra / Serviços</h2>
                        <Button type="button" onClick={addServiceItem} variant="secondary" className="text-sm py-1">
                            + Adicionar Serviço
                        </Button>
                    </div>
                    {formData.serviceItems.map((item, index) => (
                        <div key={index} className="flex gap-3 items-end mb-3 border-b pb-3 last:border-0">
                            <div className="flex-grow">
                                <Select
                                    label="Serviço"
                                    value={item.serviceId}
                                    onChange={(e) => handleServiceChange(index, e.target.value)}
                                    options={services.map(s => ({ value: s.id, label: s.name }))}
                                    required
                                />
                            </div>
                            <div className="w-24">
                                <Input
                                    label="Qtd"
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateServiceItem(index, 'quantity', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="w-32">
                                <Input
                                    label="Valor Unit."
                                    type="number"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={(e) => updateServiceItem(index, 'unitPrice', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="w-28 pb-3 text-right font-medium text-gray-600">
                                R$ {(item.quantity * item.unitPrice).toFixed(2)}
                            </div>
                            <button type="button" onClick={() => removeServiceItem(index)} className="text-red-500 p-2 hover:bg-red-50 rounded mb-2">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    {formData.serviceItems.length === 0 && <p className="text-gray-400 text-sm italic">Nenhum serviço adicionado.</p>}

                    {/* Subtotal Serviços */}
                    <div className="mt-4 text-right text-sm font-medium text-gray-600">
                        Total Serviços: R$ {totals.servicesTotal.toFixed(2)}
                    </div>
                </div>

                {/* Card Totais Finais */}
                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-500">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                        <Calculator className="w-5 h-5" /> Resumo Financeiro
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="text-gray-600">
                            <p className="flex justify-between"><span>Peças:</span> <span>R$ {totals.partsTotal.toFixed(2)}</span></p>
                            <p className="flex justify-between mt-1"><span>Serviços:</span> <span>R$ {totals.servicesTotal.toFixed(2)}</span></p>
                            <p className="flex justify-between mt-1 font-medium border-t pt-1"><span>Subtotal:</span> <span>R$ {totals.subtotal.toFixed(2)}</span></p>
                        </div>

                        <div>
                            <Input
                                label="Desconto (R$)"
                                type="number"
                                step="0.01"
                                value={formData.discount}
                                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-500 uppercase font-bold tracking-wide">Total Final</p>
                            <p className="text-3xl font-bold text-primary-600">R$ {totals.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Orçamento'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => navigate('/quotations')}>
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default QuotationForm;