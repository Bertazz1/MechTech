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
import toast from 'react-hot-toast';
import { Trash2, Calculator, User, Wrench, Package, Info } from 'lucide-react';
import { parseApiError } from '../../utils/errorUtils';

const ServiceOrderForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [clients, setClients] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [parts, setParts] = useState([]);
    const [services, setServices] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [formData, setFormData] = useState({
        clientId: '',
        vehicleId: '',
        description: '',
        status: 'PENDENTE',
        initialMileage: '',
        partItems: [],
        serviceItems: [],
        employees: [],
    });

    const totals = useMemo(() => {
        const partsTotal = formData.partItems.reduce((acc, item) => {
            return acc + (Number(item.quantity) * Number(item.unitCost || 0));
        }, 0);

        const servicesTotal = formData.serviceItems.reduce((acc, item) => {
            return acc + (Number(item.quantity) * Number(item.unitCost || 0));
        }, 0);

        const total = partsTotal + servicesTotal;

        return { partsTotal, servicesTotal, total };
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
            const [clientsData, vehiclesData, partsData, servicesData, employeesData] = await Promise.all([
                clientService.getAll(),
                vehicleService.getAll(),
                partService.getAll(),
                repairService.getAll(),
                employeeService.getAll()
            ]);
            setClients(Array.isArray(clientsData) ? clientsData : clientsData.content || []);
            setVehicles(Array.isArray(vehiclesData) ? vehiclesData : vehiclesData.content || []);
            setParts(Array.isArray(partsData) ? partsData : partsData.content || []);
            setServices(Array.isArray(servicesData) ? servicesData : servicesData.content || []);
            setEmployees(Array.isArray(employeesData) ? employeesData : employeesData.content || []);
        } catch (error) {
            toast.error('Erro ao carregar dados auxiliares');
        }
    };

    const loadServiceOrder = async () => {
        try {
            const data = await serviceOrderService.getById(id);
            setFormData({
                clientId: data.client?.id || '',
                vehicleId: data.vehicle?.id || '',
                description: data.description || '',
                status: data.status || 'PENDENTE',
                initialMileage: data.initialMileage || '',

                partItems: data.partItems?.map(item => ({
                    partId: item.partId || item.part?.id,
                    quantity: item.quantity,
                    unitCost: item.unitCost // Frontend usa unitCost
                })) || [],

                serviceItems: data.serviceItems?.map(item => ({
                    serviceId: item.serviceId || item.repairService?.id,
                    quantity: item.quantity,
                    unitCost: item.serviceCost || item.unitCost // Frontend usa unitCost
                })) || [],

                // Carregar como objetos para manter compatibilidade com o state
                employees: data.employees?.map(e => ({
                    id: e.employeeId || e.id,
                    commissionPercentage: e.commissionPercentage || 0,
                    workedHours: e.workedHours || 0
                })) || [],

                discount: data.discount || 0
            });
        } catch (error) {
            toast.error(parseApiError(error));
            navigate('/service-orders');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Mapeia os dados para o formato exato que o DTO do Java espera
        const dataToSend = {
            ...formData,
            initialMileage: formData.initialMileage ? parseInt(formData.initialMileage) : null,

            // Mapeamento de Peças: partId -> id, unitCost -> price
            partItems: formData.partItems.map(item => ({
                id: item.partId,
                quantity: Number(item.quantity),
                price: Number(item.unitCost)
            })),

            // Mapeamento de Serviços: serviceId -> id, unitCost -> cost
            serviceItems: formData.serviceItems.map(item => ({
                id: item.serviceId,
                quantity: Number(item.quantity),
                cost: Number(item.unitCost)
            })),

            // Funcionários já estão como objetos { id, ... }, backend espera Set<ServiceOrderEmployeeDto>
            employees: formData.employees.map(emp => ({
                id: emp.id, // Backend DTO usa "Id" (maiúsculo) ou "id" dependendo do Lombok/Jackson, mas JSON padrão é minúsculo
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

    // -- Manipulação de Itens --
    const addPartItem = () => setFormData({ ...formData, partItems: [...formData.partItems, { partId: '', quantity: 1, unitCost: 0 }] });
    const removePartItem = (index) => setFormData({ ...formData, partItems: formData.partItems.filter((_, i) => i !== index) });

    const handlePartChange = (index, partId) => {
        const selectedPart = parts.find(p => p.id === Number(partId));
        const newItems = [...formData.partItems];
        newItems[index].partId = partId;
        if (selectedPart) newItems[index].unitCost = selectedPart.price;
        setFormData({ ...formData, partItems: newItems });
    };

    const updatePartItem = (index, field, value) => {
        const newItems = [...formData.partItems];
        newItems[index][field] = value;
        setFormData({ ...formData, partItems: newItems });
    };

    const addServiceItem = () => setFormData({ ...formData, serviceItems: [...formData.serviceItems, { serviceId: '', quantity: 1, unitCost: 0 }] });
    const removeServiceItem = (index) => setFormData({ ...formData, serviceItems: formData.serviceItems.filter((_, i) => i !== index) });

    const handleServiceChange = (index, serviceId) => {
        const selectedService = services.find(s => s.id === Number(serviceId));
        const newItems = [...formData.serviceItems];
        newItems[index].serviceId = serviceId;
        // Usa cost ou baseCost do serviço
        if (selectedService) newItems[index].unitCost = selectedService.cost || selectedService.baseCost || 0;
        setFormData({ ...formData, serviceItems: newItems });
    };

    const updateServiceItem = (index, field, value) => {
        const newItems = [...formData.serviceItems];
        newItems[index][field] = value;
        setFormData({ ...formData, serviceItems: newItems });
    };

    const handleEmployeeChange = (e) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => Number(option.value));

        // Preserva dados existentes (comissão/horas) se o funcionário já estava selecionado
        const newEmployees = selectedIds.map(id => {
            const existing = formData.employees.find(emp => emp.id === id);
            return existing || { id, commissionPercentage: 0, workedHours: 0 };
        });

        setFormData({ ...formData, employees: newEmployees });
    };

    const isReadOnly = formData.status === 'COMPLETO' || formData.status === 'CANCELADO';

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    {id ? `OS #${id}` : 'Nova Ordem de Serviço'}
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
                        <Select
                            label="Cliente"
                            value={formData.clientId}
                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                            options={clients.map(c => ({ value: c.id, label: c.name }))}
                            required
                            disabled={isReadOnly}
                        />
                        <Select
                            label="Veículo"
                            value={formData.vehicleId}
                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            options={vehicles.map(v => ({ value: v.id, label: `${v.model} - ${v.licensePlate}` }))}
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
                            required
                            disabled={isReadOnly}
                        />
                    </div>
                </div>

                {/* BLOCO 2: Funcionários */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-500" /> Equipe Responsável
                    </h2>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Selecione os Técnicos (Ctrl+Click para múltiplos)</label>
                        <select
                            multiple
                            value={formData.employees.map(e => e.id)}
                            onChange={handleEmployeeChange}
                            disabled={isReadOnly}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 h-32 transition-colors"
                        >
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Mantenha a tecla Ctrl pressionada para selecionar mais de um.</p>
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
                                        <Select
                                            value={item.partId}
                                            onChange={(e) => handlePartChange(index, e.target.value)}
                                            options={parts.map(p => ({ value: p.id, label: p.name }))}
                                            required
                                            className="mb-0 text-sm"
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
                                        <Select
                                            value={item.serviceId}
                                            onChange={(e) => handleServiceChange(index, e.target.value)}
                                            options={services.map(s => ({ value: s.id, label: s.name }))}
                                            required
                                            className="mb-0 text-sm"
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

