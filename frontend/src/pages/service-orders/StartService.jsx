import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { serviceOrderService } from '../../services/serviceOrderService';
import { employeeService } from '../../services/employeeService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AsyncSelect from '../../components/common/AsyncSelect';
import toast from 'react-hot-toast';
import { Play, ArrowLeft, Car, User, Users, Plus, X } from 'lucide-react';
import { parseApiError } from '../../utils/errorUtils';

const StartService = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [osData, setOsData] = useState(null);
    const [initialMileage, setInitialMileage] = useState('');

    // Estados para Funcionários
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [tempEmployee, setTempEmployee] = useState(null);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const data = await serviceOrderService.getById(id);
            setOsData(data);

            // 1. Carrega a quilometragem se já estiver salva
            if (data.initialMileage) {
                setInitialMileage(data.initialMileage);
            }

            // 2. Carrega funcionários já vinculados à OS
            if (data.employees && Array.isArray(data.employees)) {
                const formattedEmployees = data.employees.map(item => {
                    // O item pode ser o ServiceOrderEmployee (vínculo) que contém o 'employee'
                    const empData = item.employee || item;

                    return {
                        id: empData.id,
                        name: empData.name,
                        // Correção: Acessa .name pois Role agora é um objeto
                        role: empData.role?.name || 'Sem Cargo',
                        // Preserva a comissão se já estiver definida no vínculo
                        commissionPercentage: item.commissionPercentage || 0
                    };
                });
                setSelectedEmployees(formattedEmployees);
            }
        } catch (error) {
            console.error("Erro ao carregar OS:", error);
            toast.error('Erro ao carregar dados da OS');
            navigate('/service-orders');
        }
    };

    // Busca para o seletor (AsyncSelect)
    const fetchEmployees = async (query) => {
        try {
            const response = await employeeService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(e => ({
                value: e.id,
                label: e.name,
                // Correção: Acessa .name para não quebrar o React com objeto
                subLabel: e.role?.name || 'Sem Cargo',
                // Guarda infos extras para usar ao selecionar
                fullData: e
            }));
        } catch (e) {
            return [];
        }
    };

    // Adicionar funcionário à lista visual
    const handleAddEmployee = () => {
        if (!tempEmployee) return;

        // Evita duplicados
        if (selectedEmployees.some(e => e.id === tempEmployee.value)) {
            toast.error('Funcionário já adicionado.');
            return;
        }

        // Pega a role do objeto selecionado ou do dado completo
        const roleName = tempEmployee.subLabel;

        const newEmployee = {
            id: tempEmployee.value,
            name: tempEmployee.label,
            role: roleName,
            commissionPercentage: 0 // Default ao adicionar por aqui
        };

        setSelectedEmployees([...selectedEmployees, newEmployee]);
        setTempEmployee(null);
    };

    const handleRemoveEmployee = (empId) => {
        setSelectedEmployees(selectedEmployees.filter(e => e.id !== empId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!initialMileage) {
            toast.error('A quilometragem inicial é obrigatória');
            return;
        }

        setLoading(true);
        try {
            const updateData = {
                status: 'EM_PROGRESSO',
                initialMileage: parseInt(initialMileage),
                // Envia a lista atualizada de funcionários
                employees: selectedEmployees.map(emp => ({
                    id: emp.id,
                    commissionPercentage: emp.commissionPercentage || 0,
                    workedHours: 0 // Zera horas ao iniciar (serão preenchidas depois)
                }))
            };

            await serviceOrderService.update(id, updateData);
            toast.success('Serviço iniciado com sucesso!');
            navigate('/service-orders');
        } catch (error) {
            const message = parseApiError(error);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!osData) return <div className="p-8 text-center text-gray-500">Carregando informações...</div>;

    return (
        <div className="max-w-3xl mx-auto pt-10 pb-20">
            <div className="mb-6">
                <button onClick={() => navigate('/service-orders')} className="flex items-center text-gray-500 hover:text-primary-600 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </button>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Play className="w-6 h-6 text-primary-600 ml-1" />
                    </div>
                    Iniciar Serviço
                </h1>
                <p className="text-gray-600 mt-2 ml-14">OS #{osData.id} - Confirme os dados iniciais.</p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-6 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                            <Car className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Veículo</p>
                            <p className="font-medium text-gray-900">
                                {osData.vehicle?.model} <span className="text-gray-400">|</span> {osData.vehicle?.licensePlate}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                            <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Cliente</p>
                            <p className="font-medium text-gray-900">{osData.client?.name}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">1</span>
                            Dados de Entrada
                        </h3>
                        <div className="pl-8">
                            <Input
                                label="Quilometragem Atual (KM)"
                                type="number"
                                value={initialMileage}
                                onChange={(e) => setInitialMileage(e.target.value)}
                                placeholder="Ex: 125000"
                                required
                                autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                * Verifique o painel do veículo e insira o valor exato.
                            </p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">2</span>
                            Equipe Técnica
                        </h3>

                        <div className="pl-8">
                            <div className="flex gap-3 items-end mb-4">
                                <div className="flex-grow">
                                    <AsyncSelect
                                        label="Adicionar Técnico"
                                        placeholder="Buscar por nome..."
                                        fetchOptions={fetchEmployees}
                                        value={tempEmployee}
                                        onChange={setTempEmployee}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleAddEmployee}
                                    disabled={!tempEmployee}
                                    className="mb-4 h-[42px] flex items-center justify-center min-w-[42px] px-0"
                                    title="Adicionar"
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {selectedEmployees.length === 0 ? (
                                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
                                        Nenhum técnico vinculado a esta OS.
                                    </div>
                                ) : (
                                    selectedEmployees.map((emp) => (
                                        <div key={emp.id} className="flex justify-between items-center bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 p-2 rounded-full">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800">{emp.name}</span>
                                                    <span className="text-xs text-gray-500">{emp.role}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEmployee(emp.id)}
                                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                title="Remover"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full justify-center py-3 text-lg font-semibold shadow-lg shadow-blue-200">
                            {loading ? 'Processando...' : 'Confirmar Início de Serviço'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StartService;