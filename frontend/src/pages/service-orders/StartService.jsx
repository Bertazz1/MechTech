import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { serviceOrderService } from '../../services/serviceOrderService';
import { employeeService } from '../../services/employeeService'; // <--- Importado
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AsyncSelect from '../../components/common/AsyncSelect'; // <--- Importado
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
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const data = await serviceOrderService.getById(id);
            setOsData(data);
            if (data.initialMileage) setInitialMileage(data.initialMileage);

            // Carrega funcionários já vinculados (se houver)
            if (data.employees && Array.isArray(data.employees)) {
                const formattedEmployees = data.employees.map(e => ({
                    id: e.employeeId || e.id,
                    name: e.employeeName || e.name,
                    role: e.role || 'Técnico'
                }));
                setSelectedEmployees(formattedEmployees);
            }
        } catch (error) {
            toast.error('Erro ao carregar dados da OS');
            navigate('/service-orders');
        }
    };

    // Função de busca para o AsyncSelect
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

    // Adicionar funcionário à lista
    const handleAddEmployee = () => {
        if (!tempEmployee) return;

        if (selectedEmployees.some(e => e.id === tempEmployee.value)) {
            toast.error('Funcionário já adicionado.');
            return;
        }

        const newEmployee = {
            id: tempEmployee.value,
            name: tempEmployee.label,
            role: tempEmployee.subLabel
        };

        setSelectedEmployees([...selectedEmployees, newEmployee]);
        setTempEmployee(null);
    };

    // Remover funcionário da lista
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
            // Prepara o objeto para atualização
            const updateData = {
                status: 'EM_PROGRESSO',
                initialMileage: parseInt(initialMileage),
                // Mapeia os funcionários para o formato esperado pelo DTO (Set<ServiceOrderEmployeeDto>)
                employees: selectedEmployees.map(emp => ({
                    id: emp.id,
                    commissionPercentage: 0, // Valor padrão ao iniciar
                    workedHours: 0           // Valor padrão ao iniciar
                }))
            };

            await serviceOrderService.update(id, updateData);
            toast.success('Serviço iniciado e equipe vinculada!');
            navigate('/service-orders');
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLoading(false);
        }
    };

    if (!osData) return <div className="p-8 text-center text-gray-500">Carregando informações...</div>;

    return (
        <div className="max-w-2xl mx-auto pt-10 pb-20">
            <div className="mb-6">
                <button onClick={() => navigate('/service-orders')} className="flex items-center text-gray-500 hover:text-primary-600 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </button>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Play className="w-8 h-8 text-primary-600" /> Iniciar Serviço
                </h1>
                <p className="text-gray-600 mt-2">Confirme os dados e a equipe técnica para começar.</p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                {/* Resumo da OS */}
                <div className="bg-gray-50 p-6 border-b border-gray-200 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <Car className="w-3 h-3" /> Veículo
                        </p>
                        <p className="font-medium text-gray-800">
                            {osData.vehicle?.model} - {osData.vehicle?.licensePlate}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <User className="w-3 h-3" /> Cliente
                        </p>
                        <p className="font-medium text-gray-800">{osData.client?.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">

                    {/* Seção 1: Quilometragem */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Dados do Veículo</h3>
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

                    <hr className="border-gray-100" />

                    {/* Seção 2: Equipe Técnica */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary-500" /> Equipe Responsável
                        </h3>

                        <div className="flex gap-3 items-end mb-4">
                            <div className="flex-grow">
                                <AsyncSelect
                                    label="Adicionar Técnico"
                                    placeholder="Buscar por nome..."
                                    fetchOptions={fetchEmployees}
                                    value={tempEmployee}
                                    onChange={setTempEmployee}
                                    className="mb-0"
                                />
                            </div>
                            <Button type="button" onClick={handleAddEmployee} disabled={!tempEmployee} className="mb-4 h-[42px]">
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            {selectedEmployees.length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center">Nenhum técnico vinculado.</p>
                            ) : (
                                selectedEmployees.map((emp) => (
                                    <div key={emp.id} className="flex justify-between items-center bg-white px-4 py-3 rounded-md border border-gray-200 shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-800">{emp.name}</span>
                                            <span className="text-xs text-gray-500">{emp.role}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEmployee(emp.id)}
                                            className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                                            title="Remover"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full justify-center py-3 text-lg mt-6">
                        {loading ? 'Iniciando...' : 'Confirmar e Iniciar Serviço'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default StartService;