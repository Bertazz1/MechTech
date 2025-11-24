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
import Select from '../../components/common/Select';
import AsyncSelect from '../../components/common/AsyncSelect';
import toast from 'react-hot-toast';
import { Trash2, Calculator, User, Wrench, Package, Info, Plus, X } from 'lucide-react';
import { parseApiError } from '../../utils/errorUtils';

const ServiceOrderForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Estados para os AsyncSelects principais
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    // Estado temporário para seleção de funcionário antes de adicionar à lista
    const [tempEmployee, setTempEmployee] = useState(null);

    // Função auxiliar para pegar data atual formatada para input datetime-local
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
        entryDate: getLocalDateTime(), // Inicializa com data atual
        partItems: [],
        serviceItems: [],
        employees: [],
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
        // Se tiver desconto futuro, implementar aqui: const total = subtotal - discount;
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
        if (id) {
            loadServiceOrder();
        }
    }, [id]);

    // --- Funções de Busca (Adapters para AsyncSelect) ---

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
            return list.map(v => ({
                value: v.id,
                label: `${v.brand} ${v.model} - ${v.licensePlate}`,
                subLabel: v.client ? `Proprietário: ${v.client.name}` : null,
                client: v.client // Passa o objeto cliente para auto-seleção
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

    const fetchEmployees = async (query) => {
        try {
            const response = await employeeService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(e => ({
                value: e.id,
                label: e.name,
                subLabel: e.role
            }));
        } catch (e) { return []; }
    };

    // --- Carregamento de Dados ---

    const loadServiceOrder = async () => {
        try {
            const data = await serviceOrderService.getById(id);

            // Preenche Selects Principais
            if (data.client) {
                setSelectedClient({ value: data.client.id, label: data.client.name, subLabel: data.client.cpf });
            }
            if (data.vehicle) {
                setSelectedVehicle({ value: data.vehicle.id, label: `${data.vehicle.model} - ${data.vehicle.licensePlate}` });
            }

            // Formata a data vinda do backend para o input
            let formattedEntryDate = getLocalDateTime();
            if (data.entryDate) {
                formattedEntryDate = data.entryDate.length > 16 ? data.entryDate.slice(0, 16) : data.entryDate;
            }

            // Preenche Itens com dados para AsyncSelect
            const loadedParts = (data.partItems || []).map(item => ({
                partId: item.partId || item.part?.id,
                quantity: item.quantity,
                unitCost: item.unitCost,
                // Objeto para o AsyncSelect da linha
                selectedOption: {
                    value: item.partId || item.part?.id,
                    label: item.partName || item.part?.name || 'Peça carregada'
                }
            }));

            const loadedServices = (data.serviceItems || []).map(item => ({
                serviceId: item.serviceId || item.repairService?.id,
                quantity: item.quantity,
                unitCost: item.serviceCost || item.unitCost,
                // Objeto para o AsyncSelect da linha
                selectedOption: {
                    value: item.serviceId || item.repairService?.id,
                    label: item.serviceName || item.repairService?.name || 'Serviço carregado'
                }
            }));

            // Preenche Funcionários com labels para exibição
            const loadedEmployees = (data.employees || []).map(e => ({
                id: e.employeeId || e.id,
                name: e.employeeName || e.name,
                commissionPercentage: e.commissionPercentage || 0,
                workedHours: e.workedHours || 0
            }));

            setFormData({
                clientId: data.client?.id || '',
                vehicleId: data.vehicle?.id || '',
                description: data.description || '',
                status: data.status || 'PENDENTE',
                initialMileage: data.initialMileage || '',
                entryDate: formattedEntryDate, // Define a data carregada
                partItems: loadedParts,
                serviceItems: loadedServices,
                employees: loadedEmployees,
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
            // Auto-seleciona o cliente se vier no objeto do veículo e ainda não tiver cliente selecionado
            if (option.client && !selectedClient) {
                const clientOption = { value: option.client.id, label: option.client.name, subLabel: option.client.cpf };
                setSelectedClient(clientOption);
                setFormData(prev => ({ ...prev, clientId: option.client.id }));
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
            initialMileage: formData.initialMileage ? parseInt(formData.initialMileage) : null,
            // Envia a data de entrada
            entryDate: formData.entryDate,

            partItems: formData.partItems
                .filter(item => item.selectedOption)
                .map(item => ({
                    id: item.selectedOption.value,
                    quantity: Number(item.quantity),
                    price: Number(item.unitCost)
                })),

            serviceItems: formData.serviceItems
                .filter(item => item.selectedOption)
                .map(item => ({
                    id: item.selectedOption.value,
                    quantity: Number(item.quantity),
                    cost: Number(item.unitCost)
                })),

            employees: formData.employees.map(emp => ({
                id: emp.id,
                commissionPercentage: Number(emp.commissionPercentage || 0),
                workedHours: Number(emp.workedHours || 0)
            }))
        };

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

    // -- Peças e Serviços (Lógica de Lista) --

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

    const addServiceItem = () => setFormData({ ...formData, serviceItems: [...formData.serviceItems, { selectedOption: null, quantity: 1, unitCost: 0 }] });
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

    // -- Funcionários (Lógica de Adicionar/Remover da Lista) --

    const handleAddEmployee = () => {
        if (!tempEmployee) return;

        if (formData.employees.some(e => e.id === tempEmployee.value)) {
            toast.error('Funcionário já adicionado.');
            return;
        }

        const newEmployee = {
            id: tempEmployee.value,
            name: tempEmployee.label,
            commissionPercentage: 0,
            workedHours: 0
        };

        setFormData(prev => ({ ...prev, employees: [...prev.employees, newEmployee] }));
        setTempEmployee(null);
    };

    const handleRemoveEmployee = (empId) => {
        setFormData(prev => ({ ...prev, employees: prev.employees.filter(e => e.id !== empId) }));
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
                {/* BLOCO 1: Informações Gerais */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary-500" /> Detalhes da OS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

                        {/* Novo Campo de Data */}
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
                    </div>
                    <div className="mt-2">
                        <Input
                            label="Descrição do Problema / Serviço"
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            disabled={isReadOnly}
                        />
                    </div>
                </div>

                {/* BLOCO 2: Funcionários */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-500" /> Equipe Responsável
                    </h2>

                    {!isReadOnly && (
                        <div className="flex gap-3 items-end mb-4">
                            <div className="flex-grow max-w-md">
                                <AsyncSelect
                                    label="Adicionar Técnico"
                                    placeholder="Buscar funcionário..."
                                    fetchOptions={fetchEmployees}
                                    value={tempEmployee}
                                    onChange={setTempEmployee}
                                />
                            </div>
                            <Button type="button" onClick={handleAddEmployee} disabled={!tempEmployee} className="mb-4 h-[42px]">
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    <div className="space-y-2">
                        {formData.employees.length === 0 && <p className="text-sm text-gray-400 italic">Nenhum funcionário atribuído.</p>}
                        {formData.employees.map((emp) => (
                            <div key={emp.id} className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                <span className="font-medium text-gray-700">{emp.name}</span>
                                {!isReadOnly && (
                                    <button type="button" onClick={() => handleRemoveEmployee(emp.id)} className="text-red-400 hover:text-red-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* BLOCO 3: Peças */}
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
                        {formData.partItems.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">Nenhuma peça adicionada.</p>}

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
                                        />
                                    </div>
                                    <div className="w-24 pt-2 text-right font-medium text-sm text-gray-600">
                                        R$ {(item.quantity * item.unitCost).toFixed(2)}
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

                    {/* BLOCO 4: Serviços */}
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
                        {formData.serviceItems.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">Nenhum serviço adicionado.</p>}

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
                                            required
                                            className="mb-0 text-sm"
                                            disabled={isReadOnly}
                                        />
                                    </div>
                                    <div className="w-24 pt-2 text-right font-medium text-sm text-gray-600">
                                        R$ {(item.quantity * item.unitCost).toFixed(2)}
                                    </div>
                                    {!isReadOnly && (
                                        <button type="button" onClick={() => removeServiceItem(index)} className="text-red-400 hover:text-red-600 pt-2">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-right text-sm font-bold text-gray-700">
                            Subtotal Serviços: R$ {totals.servicesTotal.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* BLOCO 5: Totais */}
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
                    {!isReadOnly && (
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ServiceOrderForm;