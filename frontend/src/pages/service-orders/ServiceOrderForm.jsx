import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { serviceOrderService } from '../../services/serviceOrderService';
import { clientService } from '../../services/clientService';
import { vehicleService } from '../../services/vehicleService';
import { partService } from '../../services/partService';
import { repairService } from '../../services/repairService';
import { employeeService } from '../../services/employeeService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AsyncSelect from '../../components/common/AsyncSelect';
import toast from 'react-hot-toast';
import { Trash2, Calculator, Wrench, Package, Info, CheckCircle } from 'lucide-react';
import { parseApiError } from '../../utils/errorUtils';
import { confirmAction } from '../../utils/alert';

const ServiceOrderForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Estados para os AsyncSelects principais
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    // Lista de todos os funcionários para os seletores de itens
    const [allEmployees, setAllEmployees] = useState([]);

    function getLocalDateTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    }

    const [formData, setFormData] = useState({
        clientId: '',
        vehicleId: '',
        description: '',
        status: 'PENDENTE',
        initialMileage: '',
        entryDate: getLocalDateTime(),
        partItems: [],
        serviceItems: [],
        discount: 0
    });

    const totals = useMemo(() => {
        const partsTotal = formData.partItems.reduce((acc, item) => {
            return acc + (Number(item.quantity) * Number(item.unitCost || 0));
        }, 0);

        const servicesTotal = formData.serviceItems.reduce((acc, item) => {
            return acc + (Number(item.quantity) * Number(item.unitCost || 0));
        }, 0);

        const subtotal = partsTotal + servicesTotal;
        const total = subtotal;

        return { partsTotal, servicesTotal, subtotal, total };
    }, [formData.partItems, formData.serviceItems]);

    const statusOptions = [
        { value: 'PENDENTE', label: 'Pendente' },
        { value: 'EM_PROGRESSO', label: 'Em Progresso' },
        { value: 'COMPLETO', label: 'Completo' },
        { value: 'CANCELADO', label: 'Cancelado' },
    ];

    useEffect(() => {
        loadDependencies();
        if (id) {
            loadServiceOrder();
        }
    }, [id]);

    const loadDependencies = async () => {
        try {
            const data = await employeeService.getAll();
            const list = Array.isArray(data) ? data : (data.content || []);
            setAllEmployees(list);
        } catch (e) {
            console.error("Erro ao carregar funcionários", e);
        }
    };

    // --- Funções de Busca (Adapters) ---

    const fetchClients = async (query) => {
        try {
            const response = await clientService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(c => ({ value: c.id, label: c.name, subLabel: c.cpf }));
        } catch (e) { return []; }
    };

    // CORREÇÃO: Exibição correta de Marca/Modelo
    const fetchVehicles = async (query) => {
        try {
            const response = await vehicleService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(v => {
                // Tenta pegar do objeto aninhado model.brand ou campos planos se existirem
                const brandName = v.model?.brand?.name || v.brandName || '';
                const modelName = v.model?.name || v.modelName || '';
                return {
                    value: v.id,
                    label: `${brandName} ${modelName} - ${v.licensePlate}`,
                    subLabel: `Proprietário: ${v.clientName}`,
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
                subLabel: `Cód: ${p.code} | Estoque: R$ ${p.price.toFixed(2)}`,
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
                subLabel: `Base: R$ ${(s.baseCost || s.cost || 0).toFixed(2)}`,
                price: s.baseCost || s.cost
            }));
        } catch (e) { return []; }
    };

    // --- Carregamento da OS ---
    const loadServiceOrder = async () => {
        try {
            const data = await serviceOrderService.getById(id);

            if (data.client) {
                setSelectedClient({ value: data.client.id, label: data.client.name, subLabel: data.client.cpf });
            }

            // Preenche seletor de veículo com os dados aninhados
            if (data.vehicle) {
                const brandName = data.vehicle.model?.brand?.name || '';
                const modelName = data.vehicle.model?.name || '';
                setSelectedVehicle({
                    value: data.vehicle.id,
                    label: `${brandName} ${modelName} - ${data.vehicle.licensePlate}`
                });
            }

            let formattedEntryDate = getLocalDateTime();
            if (data.entryDate) {
                formattedEntryDate = data.entryDate.length > 16 ? data.entryDate.slice(0, 16) : data.entryDate;
            }

            const loadedParts = (data.partItems || []).map(item => ({
                partId: item.partId || item.part?.id,
                quantity: item.quantity,
                unitCost: item.unitCost || item.unitPrice || item.price,
                selectedOption: {
                    value: item.partId || item.part?.id,
                    label: item.partName || item.part?.name || 'Peça carregada'
                }
            }));

            const loadedServices = (data.serviceItems || []).map(item => ({
                serviceId: item.serviceId || item.repairService?.id,
                quantity: item.quantity,
                unitCost: item.serviceCost || item.unitCost || item.cost,
                employeeId: item.employeeId || '',
                selectedOption: {
                    value: item.serviceId || item.repairService?.id,
                    label: item.serviceName || item.repairService?.name || 'Serviço carregado'
                }
            }));

            setFormData({
                clientId: data.client?.id || '',
                vehicleId: data.vehicle?.id || '',
                description: data.description || '',
                status: data.status || 'PENDENTE',
                initialMileage: data.initialMileage || '',
                entryDate: formattedEntryDate,
                partItems: loadedParts,
                serviceItems: loadedServices,
                discount: data.discount || 0
            });
        } catch (error) {
            toast.error(parseApiError(error));
            navigate('/service-orders');
        }
    };

    // --- Handlers ---

    const handleClientChange = (option) => {
        setSelectedClient(option);
        setFormData(prev => ({ ...prev, clientId: option ? option.value : '' }));
    };

    const handleVehicleChange = (option) => {
        setSelectedVehicle(option);
        if (option) {
            setFormData(prev => ({ ...prev, vehicleId: option.value }));

            // Seleciona o cliente automaticamente usando os dados planos
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

    const prepareDataToSend = (statusOverride = null) => {
        return {
            ...formData,
            status: statusOverride || formData.status,
            initialMileage: formData.initialMileage ? parseInt(formData.initialMileage) : null,
            entryDate: formData.entryDate,

            partItems: formData.partItems
                .filter(item => item.selectedOption)
                .map(item => ({
                    id: item.selectedOption.value,
                    quantity: Number(item.quantity),
                    unitCost: Number(item.unitCost) // Envia unitCost editável
                })),

            serviceItems: formData.serviceItems
                .filter(item => item.selectedOption)
                .map(item => ({
                    id: item.selectedOption.value,
                    quantity: Number(item.quantity),
                    unitCost: Number(item.unitCost), // Envia unitCost editável
                    employeeId: item.employeeId ? Number(item.employeeId) : null
                }))
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const dataToSend = prepareDataToSend();

        try {
            if (id) {
                await serviceOrderService.update(id, dataToSend);
                toast.success('OS atualizada com sucesso');
            } else {
                await serviceOrderService.create(dataToSend);
                toast.success('OS criada com sucesso');
            }
            navigate('/service-orders');
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleFinishOrder = async () => {
        const isConfirmed = await confirmAction(
            'Finalizar Serviço?',
            'Isso encerrará a OS, registrará a data de saída e permitirá gerar a fatura. Deseja continuar?',
            'Sim, Finalizar',
            '#16a34a'
        );
        if (!isConfirmed) return;
        setLoading(true);
        const dataToSend = prepareDataToSend('COMPLETO');

        try {
            await serviceOrderService.update(id, dataToSend);
            toast.success('Serviço finalizado com sucesso!');
            navigate('/service-orders');
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLoading(false);
        }
    };

    // -- Manipulação de Itens (Peças) --
    const addPartItem = () => setFormData({ ...formData, partItems: [...formData.partItems, { selectedOption: null, quantity: 1, unitCost: 0 }] });
    const removePartItem = (index) => setFormData({ ...formData, partItems: formData.partItems.filter((_, i) => i !== index) });

    const handlePartSelect = (index, option) => {
        const newItems = [...formData.partItems];
        newItems[index].selectedOption = option;
        if (option) newItems[index].unitCost = option.price || 0;
        setFormData({ ...formData, partItems: newItems });
    };

    const updatePartItem = (index, field, value) => {
        const newItems = [...formData.partItems];
        newItems[index][field] = value;
        setFormData({ ...formData, partItems: newItems });
    };

    // -- Manipulação de Itens (Serviços) --
    const addServiceItem = () => setFormData({ ...formData, serviceItems: [...formData.serviceItems, { selectedOption: null, quantity: 1, unitCost: 0, employeeId: '' }] });
    const removeServiceItem = (index) => setFormData({ ...formData, serviceItems: formData.serviceItems.filter((_, i) => i !== index) });

    const handleServiceSelect = (index, option) => {
        const newItems = [...formData.serviceItems];
        newItems[index].selectedOption = option;
        if (option) newItems[index].unitCost = option.price || 0;
        setFormData({ ...formData, serviceItems: newItems });
    };

    const updateServiceItem = (index, field, value) => {
        const newItems = [...formData.serviceItems];
        newItems[index][field] = value;
        setFormData({ ...formData, serviceItems: newItems });
    };

    const handleServiceEmployeeChange = (index, employeeId) => {
        const newItems = [...formData.serviceItems];
        newItems[index].employeeId = employeeId;
        setFormData({ ...formData, serviceItems: newItems });
    };

    const isReadOnly = formData.status === 'COMPLETO' || formData.status === 'CANCELADO';

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    {id ? `Ordem de Serviço #${id}` : 'Nova Ordem de Serviço'}
                </h1>
                {id && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                        ${formData.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                        formData.status === 'EM_PROGRESSO' ? 'bg-blue-100 text-blue-800' :
                            formData.status === 'COMPLETO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {statusOptions.find(s => s.value === formData.status)?.label || formData.status}
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* BLOCO 1: Detalhes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary-500" /> Detalhes da OS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AsyncSelect
                            label="Veículo"
                            placeholder="Buscar..."
                            fetchOptions={fetchVehicles}
                            value={selectedVehicle}
                            onChange={handleVehicleChange}
                            required
                            disabled={isReadOnly}
                        />
                        <AsyncSelect
                            label="Cliente"
                            placeholder="Buscar..."
                            fetchOptions={fetchClients}
                            value={selectedClient}
                            onChange={handleClientChange}
                            required
                            disabled={isReadOnly}
                        />
                        {id && formData.status !== 'PENDENTE' && (
                            <>
                                <Input
                                    label="Data de Entrada"
                                    type="datetime-local"
                                    name="entryDate"
                                    value={formData.entryDate}
                                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                                    required
                                    disabled={isReadOnly}
                                />
                                <Input
                                    label="Quilometragem Inicial (KM)"
                                    name="initialMileage"
                                    type="number"
                                    value={formData.initialMileage}
                                    onChange={(e) => setFormData({ ...formData, initialMileage: e.target.value })}
                                    placeholder="Ex: 50000"
                                    disabled={isReadOnly}
                                />
                            </>
                        )}
                    </div>
                    <div className="mt-2">
                        <Input
                            label="Descrição do Problema / Serviço"
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            disabled={isReadOnly}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* BLOCO 2: Peças */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary-500" /> Peças
                            </h2>
                            {!isReadOnly && (
                                <Button type="button" onClick={addPartItem} variant="secondary" className="text-xs py-1 px-3">
                                    + Adicionar
                                </Button>
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
                                            required
                                            className="mb-0 text-sm"
                                            disabled={isReadOnly}
                                            placeholder="Qtd"
                                        />
                                    </div>
                                    {/* CORREÇÃO: Campo de preço editável */}
                                    <div className="w-24">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unitCost}
                                            onChange={(e) => updatePartItem(index, 'unitCost', e.target.value)}
                                            required
                                            className="mb-0 text-sm"
                                            disabled={isReadOnly}
                                            placeholder="R$"
                                        />
                                    </div>
                                    {!isReadOnly && (
                                        <button type="button" onClick={() => removePartItem(index)} className="text-red-400 hover:text-red-600 pt-2">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-right text-sm font-bold text-gray-700">
                            Subtotal Peças: R$ {totals.partsTotal.toFixed(2)}
                        </div>
                    </div>

                    {/* BLOCO 3: Serviços */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-primary-500" /> Serviços
                            </h2>
                            {!isReadOnly && (
                                <Button type="button" onClick={addServiceItem} variant="secondary" className="text-xs py-1 px-3">
                                    + Adicionar
                                </Button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {formData.serviceItems.map((item, index) => (
                                <div key={index} className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="flex gap-2 items-start">
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
                                                required
                                                className="mb-0 text-sm"
                                                disabled={isReadOnly}
                                                placeholder="Qtd"
                                            />
                                        </div>
                                        {/* CORREÇÃO: Campo de custo editável */}
                                        <div className="w-24">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unitCost}
                                                onChange={(e) => updateServiceItem(index, 'unitCost', e.target.value)}
                                                required
                                                className="mb-0 text-sm"
                                                disabled={isReadOnly}
                                                placeholder="R$"
                                            />
                                        </div>
                                        {!isReadOnly && (
                                            <button type="button" onClick={() => removeServiceItem(index)} className="text-red-400 hover:text-red-600 pt-2">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center mt-1">
                                        <div className="w-full">
                                            <select
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-1.5"
                                                value={item.employeeId}
                                                onChange={(e) => handleServiceEmployeeChange(index, e.target.value)}
                                                disabled={isReadOnly}
                                            >
                                                <option value="">Selecione o Técnico Responsável</option>
                                                {allEmployees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>
                                                        {emp.name} {emp.role?.name ? `(${emp.role.name})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-right text-sm font-bold text-gray-700">
                            Subtotal Serviços: R$ {totals.servicesTotal.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Totais */}
                <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-primary-500">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                        <Calculator className="w-5 h-5" /> Resumo Financeiro
                    </h2>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-gray-600 text-sm space-y-1 w-full md:w-auto">
                            <p className="flex justify-between gap-8"><span>Peças:</span> <span>R$ {totals.partsTotal.toFixed(2)}</span></p>
                            <p className="flex justify-between gap-8"><span>Mão de Obra:</span> <span>R$ {totals.servicesTotal.toFixed(2)}</span></p>
                            <p className="flex justify-between gap-8 font-semibold"><span>Subtotal:</span> <span>R$ {totals.total.toFixed(2)}</span></p>
                        </div>
                        <div className="bg-gray-50 px-8 py-4 rounded-xl text-center border border-gray-200 w-full md:w-auto">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wide mb-1">Total Final</p>
                            <p className="text-3xl font-bold text-primary-600">R$ {totals.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4 justify-end">
                    <Button type="button" variant="secondary" onClick={() => navigate('/service-orders')}>
                        Voltar
                    </Button>

                    {!isReadOnly && formData.status !== 'COMPLETO' && (
                        <Button type="submit" disabled={loading} variant="secondary">
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    )}

                    {formData.status === 'EM_PROGRESSO' && (
                        <Button
                            type="button"
                            disabled={loading}
                            onClick={handleFinishOrder}
                            className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Finalizar Serviço
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ServiceOrderForm;