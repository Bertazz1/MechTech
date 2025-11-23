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
import { Trash2, Calculator } from 'lucide-react';
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
        partItems: [],
        serviceItems: [],
        employees: [],
        discount: 0
    });

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
            toast.error('Erro ao carregar dados');
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
                partItems: data.partItems?.map(item => ({
                    partId: item.part.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice || item.part.price
                })) || [],
                serviceItems: data.serviceItems?.map(item => ({
                    serviceId: item.service.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice || item.service.cost || item.service.baseCost // CORREÇÃO DE CARREGAMENTO
                })) || [],
                employees: data.employees?.map(e => e.id) || [],
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

        try {
            if (id) {
                await serviceOrderService.update(id, formData);
                toast.success('OS atualizada com sucesso');
            } else {
                await serviceOrderService.create(formData);
                toast.success('OS criada com sucesso');
            }
            navigate('/service-orders');
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLoading(false);
        }
    };

    // PEÇAS
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

    // SERVIÇOS
    const addServiceItem = () => {
        setFormData({ ...formData, serviceItems: [...formData.serviceItems, { serviceId: '', quantity: 1, unitPrice: 0 }] });
    };

    const removeServiceItem = (index) => {
        const newItems = formData.serviceItems.filter((_, i) => i !== index);
        setFormData({ ...formData, serviceItems: newItems });
    };

    // CORREÇÃO AQUI TAMBÉM
    const handleServiceChange = (index, serviceId) => {
        const selectedService = services.find(s => s.id === Number(serviceId));
        const newItems = [...formData.serviceItems];
        newItems[index].serviceId = serviceId;

        if (selectedService) {
            const price = selectedService.cost !== undefined ? selectedService.cost : selectedService.baseCost;
            newItems[index].unitPrice = price || 0;
        }
        setFormData({ ...formData, serviceItems: newItems });
    };

    const updateServiceItem = (index, field, value) => {
        const newItems = [...formData.serviceItems];
        newItems[index][field] = value;
        setFormData({ ...formData, serviceItems: newItems });
    };

    const handleEmployeeChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
        setFormData({ ...formData, employees: selectedOptions });
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {id ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Detalhes da OS</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Cliente"
                            value={formData.clientId}
                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                            options={clients.map(c => ({ value: c.id, label: c.name }))}
                            required
                        />
                        <Select
                            label="Veículo"
                            value={formData.vehicleId}
                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            options={vehicles.map(v => ({ value: v.id, label: `${v.model} - ${v.licensePlate}` }))}
                            required
                        />
                        <Select
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            options={statusOptions}
                            required
                        />
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Funcionários (Ctrl para múltiplos)</label>
                            <select
                                multiple
                                value={formData.employees}
                                onChange={handleEmployeeChange}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 h-32"
                            >
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Input
                            label="Descrição do Problema / Serviço"
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-700">Peças Utilizadas</h2>
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
                                    options={parts.map(p => ({ value: p.id, label: `${p.name}` }))}
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
                    <div className="mt-4 text-right text-sm font-medium text-gray-600">
                        Total Peças: R$ {totals.partsTotal.toFixed(2)}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-700">Serviços Realizados</h2>
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
                                    // CORREÇÃO NO RÓTULO AQUI TAMBÉM
                                    options={services.map(s => {
                                        const price = s.cost !== undefined ? s.cost : s.baseCost;
                                        return { value: s.id, label: `${s.name} (R$ ${Number(price || 0).toFixed(2)})` };
                                    })}
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
                    <div className="mt-4 text-right text-sm font-medium text-gray-600">
                        Total Serviços: R$ {totals.servicesTotal.toFixed(2)}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-500">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                        <Calculator className="w-5 h-5" /> Resumo da OS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="text-gray-600">
                            <p className="flex justify-between"><span>Peças:</span> <span>R$ {totals.partsTotal.toFixed(2)}</span></p>
                            <p className="flex justify-between mt-1"><span>Serviços:</span> <span>R$ {totals.servicesTotal.toFixed(2)}</span></p>
                            <p className="flex justify-between mt-1 font-medium border-t pt-1"><span>Subtotal:</span> <span>R$ {totals.subtotal.toFixed(2)}</span></p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-500 uppercase font-bold tracking-wide">Total Final</p>
                            <p className="text-3xl font-bold text-primary-600">R$ {totals.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar OS'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => navigate('/service-orders')}>
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ServiceOrderForm;