import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import { clientService } from '../../services/clientService';
import { vehicleService } from '../../services/vehicleService';
import { partService } from '../../services/partService';
import { repairService } from '../../services/repairService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AsyncSelect from '../../components/common/AsyncSelect';
import toast from 'react-hot-toast';
import { Trash2, Calculator, Wrench, Package, Info } from 'lucide-react';
import { parseApiError } from '../../utils/errorUtils';

const QuotationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const [formData, setFormData] = useState({
        clientId: '',
        vehicleId: '',
        description: '',
        status: 'AWAITING_CONVERSION',
        partItems: [],
        serviceItems: [],
        discount: 0
    });

    const totals = useMemo(() => {
        const partsTotal = formData.partItems.reduce((acc, item) => {
            return acc + (Number(item.quantity) * Number(item.unitPrice || 0));
        }, 0);

        const servicesTotal = formData.serviceItems.reduce((acc, item) => {
            return acc + (Number(item.quantity) * Number(item.serviceCost || 0));
        }, 0);

        const subtotal = partsTotal + servicesTotal;
        const total = subtotal - Number(formData.discount || 0);

        return { partsTotal, servicesTotal, subtotal, total };
    }, [formData.partItems, formData.serviceItems, formData.discount]);

    useEffect(() => {
        if (id) {
            loadQuotation();
        }
    }, [id]);

    const fetchClients = async (query) => {
        try {
            const response = await clientService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(c => ({ value: c.id, label: c.name, subLabel: c.cpf }));
        } catch (e) { return []; }
    };

    const fetchVehicles = async (query) => {
        try {
            const response = await vehicleService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(v => {
                const brandName = v.brandName || v.model?.brand?.name || 'Marca';
                const modelName = v.modelName || v.model?.name || 'Modelo';
                return {
                    value: v.id,
                    label: `${brandName} ${modelName} - ${v.licensePlate}`,
                    subLabel: v.clientName ? `Proprietário: ${v.clientName}` : 'Sem proprietário',
                    clientData: { id: v.clientId, name: v.clientName }
                };
            });
        } catch (e) { return []; }
    };

    const fetchParts = async (query) => {
        try {
            const response = await partService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(p => ({
                value: p.id,
                label: p.name,
                subLabel: `Cód: ${p.code} | R$ ${p.price.toFixed(2)}`,
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
                subLabel: `R$ ${(s.baseCost || s.cost || 0).toFixed(2)}`,
                price: s.baseCost || s.cost
            }));
        } catch (e) { return []; }
    };

    const loadQuotation = async () => {
        try {
            const data = await quotationService.getById(id);

            if (data.client) {
                setSelectedClient({ value: data.client.id, label: data.client.name, subLabel: data.client.cpf });
            }

            if (data.vehicle) {
                const brandName = data.vehicle.model?.brand?.name || data.vehicle.brandName || '';
                const modelName = data.vehicle.model?.name || data.vehicle.modelName || '';
                setSelectedVehicle({
                    value: data.vehicle.id,
                    label: `${brandName} ${modelName} - ${data.vehicle.licensePlate}`
                });
            }

            const loadedParts = (data.partItems || []).map(item => ({
                partId: item.partId || item.part?.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                selectedOption: {
                    value: item.partId || item.part?.id,
                    label: item.partName || item.part?.name || 'Peça carregada'
                }
            }));

            const loadedServices = (data.serviceItems || []).map(item => ({
                serviceId: item.serviceId || item.repairService?.id,
                quantity: item.quantity,
                serviceCost: item.serviceCost,
                selectedOption: {
                    value: item.serviceId || item.repairService?.id,
                    label: item.serviceName || item.repairService?.name || 'Serviço carregado'
                }
            }));

            setFormData({
                clientId: data.client?.id || '',
                vehicleId: data.vehicle?.id || '',
                description: data.description || '',
                status: data.status || 'AWAITING_CONVERSION',
                partItems: loadedParts,
                serviceItems: loadedServices,
                discount: data.discount || 0
            });
        } catch (error) {
            toast.error(parseApiError(error));
            navigate('/quotations');
        }
    };

    const handleClientChange = (option) => {
        setSelectedClient(option);
        setFormData(prev => ({ ...prev, clientId: option ? option.value : '' }));
    };

    const handleVehicleChange = (option) => {
        setSelectedVehicle(option);
        if (option) {
            setFormData(prev => ({ ...prev, vehicleId: option.value }));

            if (option.clientData && option.clientData.id) {
                const clientOption = {
                    value: option.clientData.id,
                    label: option.clientData.name,
                    subLabel: 'Vinculado ao veículo'
                };
                setSelectedClient(clientOption);
                setFormData(prev => ({ ...prev, clientId: option.clientData.id }));
                toast.success(`Cliente definido: ${option.clientData.name}`);
            }
        } else {
            setFormData(prev => ({ ...prev, vehicleId: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dataToSend = {
            ...formData,
            partItems: formData.partItems.filter(i => i.selectedOption).map(item => ({
                id: item.selectedOption.value,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice)
            })),
            serviceItems: formData.serviceItems.filter(i => i.selectedOption).map(item => ({
                id: item.selectedOption.value,
                quantity: Number(item.quantity),
                unitCost: Number(item.serviceCost)
            }))
        };

        try {
            if (id) {
                await quotationService.update(id, dataToSend);
                toast.success('Orçamento atualizado!');
            } else {
                await quotationService.create(dataToSend);
                toast.success('Orçamento criado!');
            }
            navigate('/quotations');
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const addPartItem = () => setFormData({ ...formData, partItems: [...formData.partItems, { selectedOption: null, quantity: 1, unitPrice: 0 }] });
    const removePartItem = (index) => setFormData({ ...formData, partItems: formData.partItems.filter((_, i) => i !== index) });

    const handlePartSelect = (index, option) => {
        const newItems = [...formData.partItems];
        newItems[index].selectedOption = option;
        if (option) newItems[index].unitPrice = option.price || 0;
        setFormData({ ...formData, partItems: newItems });
    };

    const updatePartItem = (index, field, value) => {
        const newItems = [...formData.partItems];
        newItems[index][field] = value;
        setFormData({ ...formData, partItems: newItems });
    };

    const addServiceItem = () => setFormData({ ...formData, serviceItems: [...formData.serviceItems, { selectedOption: null, quantity: 1, serviceCost: 0 }] });
    const removeServiceItem = (index) => setFormData({ ...formData, serviceItems: formData.serviceItems.filter((_, i) => i !== index) });

    const handleServiceSelect = (index, option) => {
        const newItems = [...formData.serviceItems];
        newItems[index].selectedOption = option;
        if (option) newItems[index].serviceCost = option.price || 0;
        setFormData({ ...formData, serviceItems: newItems });
    };

    const updateServiceItem = (index, field, value) => {
        const newItems = [...formData.serviceItems];
        newItems[index][field] = value;
        setFormData({ ...formData, serviceItems: newItems });
    };

    const isReadOnly = formData.status === 'CONVERTED_TO_ORDER' || formData.status === 'CANCELED';

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    {id ? `Orçamento #${id}` : 'Novo Orçamento'}
                </h1>
                {id && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800`}>
                        {formData.status}
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary-500" /> Informações
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <AsyncSelect
                            label="Veículo"
                            placeholder="Buscar por placa ou modelo..."
                            fetchOptions={fetchVehicles}
                            value={selectedVehicle}
                            onChange={handleVehicleChange}
                            required
                            disabled={isReadOnly}
                        />
                        <AsyncSelect
                            label="Cliente"
                            placeholder="Buscar por nome..."
                            fetchOptions={fetchClients}
                            value={selectedClient}
                            onChange={handleClientChange}
                            required
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="mt-4">
                        <Input
                            label="Descrição / Observações"
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            disabled={isReadOnly}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Peças */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary-500" /> Peças
                            </h2>
                            {!isReadOnly && (
                                <Button type="button" onClick={addPartItem} variant="secondary" className="text-xs py-1 px-3">+ Adicionar</Button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {formData.partItems.map((item, index) => (
                                <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="flex-grow">
                                        <AsyncSelect
                                            fetchOptions={fetchParts}
                                            value={item.selectedOption}
                                            onChange={(val) => handlePartSelect(index, val)}
                                            placeholder="Buscar peça..."
                                            disabled={isReadOnly}
                                        />
                                    </div>
                                    <div className="w-16">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updatePartItem(index, 'quantity', e.target.value)}
                                            className="mb-0 text-sm"
                                            disabled={isReadOnly}
                                            placeholder="Qtd"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unitPrice}
                                            onChange={(e) => updatePartItem(index, 'unitPrice', e.target.value)}
                                            className="mb-0 text-sm"
                                            disabled={isReadOnly}
                                            placeholder="R$"
                                        />
                                    </div>
                                    {!isReadOnly && (
                                        <button type="button" onClick={() => removePartItem(index)} className="text-red-400 pt-2"><Trash2 className="w-4 h-4" /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-right text-sm font-bold text-gray-700">
                            Total Peças: R$ {totals.partsTotal.toFixed(2)}
                        </div>
                    </div>

                    {/* Serviços */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-primary-500" /> Serviços
                            </h2>
                            {!isReadOnly && (
                                <Button type="button" onClick={addServiceItem} variant="secondary" className="text-xs py-1 px-3">+ Adicionar</Button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {formData.serviceItems.map((item, index) => (
                                <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="flex-grow">
                                        <AsyncSelect
                                            fetchOptions={fetchServices}
                                            value={item.selectedOption}
                                            onChange={(val) => handleServiceSelect(index, val)}
                                            placeholder="Buscar serviço..."
                                            disabled={isReadOnly}
                                        />
                                    </div>
                                    <div className="w-16">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateServiceItem(index, 'quantity', e.target.value)}
                                            className="mb-0 text-sm"
                                            disabled={isReadOnly}
                                            placeholder="Qtd"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.serviceCost}
                                            onChange={(e) => updateServiceItem(index, 'serviceCost', e.target.value)}
                                            className="mb-0 text-sm"
                                            disabled={isReadOnly}
                                            placeholder="R$"
                                        />
                                    </div>
                                    {!isReadOnly && (
                                        <button type="button" onClick={() => removeServiceItem(index)} className="text-red-400 pt-2"><Trash2 className="w-4 h-4" /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-right text-sm font-bold text-gray-700">
                            Total Serviços: R$ {totals.servicesTotal.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Totais */}
                <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-primary-500">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                        <Calculator className="w-5 h-5" /> Resumo
                    </h2>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-gray-600 text-sm space-y-1 w-full md:w-auto">
                            <p className="flex justify-between gap-8"><span>Subtotal:</span> <span>R$ {totals.subtotal.toFixed(2)}</span></p>
                            <p className="flex justify-between gap-8 font-bold text-primary-600"><span>Total Estimado:</span> <span>R$ {totals.total.toFixed(2)}</span></p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4 justify-end">
                    <Button type="button" variant="secondary" onClick={() => navigate('/quotations')}>
                        Voltar
                    </Button>
                    {!isReadOnly && (
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Orçamento'}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default QuotationForm;