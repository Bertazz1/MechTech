import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeService } from '../../services/employeeService';
import { roleService } from '../../services/roleService'; // Importar RoleService
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AsyncSelect from '../../components/common/AsyncSelect'; // Importar AsyncSelect
import toast from 'react-hot-toast';
import { User, Phone, Mail, Briefcase, Calendar, Percent, FileText } from 'lucide-react';

const EmployeeForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Estado para o Cargo selecionado (controle do AsyncSelect)
    const [selectedRole, setSelectedRole] = useState(null);
    const [showCommission, setShowCommission] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        roleId: '', // Agora usamos roleId
        email: '',
        phone: '',
        cpf: '',
        commissionPercentage: ''
    });

    useEffect(() => {
        if (id) {
            loadEmployee();
        }
    }, [id]);

    const formatCPF = (value) => {
        if (!value) return '';
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    // Busca cargos para o seletor
    const fetchRoles = async (query) => {
        try {
            const response = await roleService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(r => ({
                value: r.id,
                label: r.name,
                receivesCommission: r.receivesCommission // Traz essa flag do backend
            }));
            // eslint-disable-next-line no-unused-vars
        } catch (e) { return []; }
    };

    const loadEmployee = async () => {
        try {
            const data = await employeeService.getById(id);

            // Preenche o select com o cargo atual
            if (data.role) {
                setSelectedRole({
                    value: data.role.id,
                    label: data.role.name,
                    receivesCommission: data.role.receivesCommission
                });
                setShowCommission(data.role.receivesCommission);
            }

            setFormData({
                name: data.name || '',
                roleId: data.role?.id || '',
                email: data.email || '',
                phone: data.phone || '',
                cpf: data.cpf ? formatCPF(data.cpf) : '',
                commissionPercentage: data.commissionPercentage || ''
            });
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Erro ao carregar funcionário');
            navigate('/employees');
        }
    };

    const handleRoleChange = (option) => {
        setSelectedRole(option);
        if (option) {
            setFormData(prev => ({ ...prev, roleId: option.value }));
            setShowCommission(option.receivesCommission);

            // Se o cargo não tem comissão, zera o valor
            if (!option.receivesCommission) {
                setFormData(prev => ({ ...prev, commissionPercentage: 0 }));
            }
        } else {
            setFormData(prev => ({ ...prev, roleId: '' }));
            setShowCommission(false);
        }
    };

    const handleCommissionChange = (e) => {
        const { value } = e.target;
        if (parseFloat(value) > 100) {
            setFormData(prev => ({ ...prev, commissionPercentage: 100 }));
        } else {
            setFormData(prev => ({ ...prev, commissionPercentage: value }));
        }

    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'cpf') {
            setFormData({ ...formData, [name]: formatCPF(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.roleId) {
                toast.error('Selecione um cargo.');
                setLoading(false);
                return;
            }

            const dataToSend = {
                ...formData,
                cpf: formData.cpf.replace(/\D/g, ''),
                commissionPercentage: formData.commissionPercentage ? parseFloat(formData.commissionPercentage) : 0
            };

            if (id) {
                await employeeService.update(id, dataToSend);
                toast.success('Funcionário atualizado com sucesso');
            } else {
                await employeeService.create(dataToSend);
                toast.success('Funcionário criado com sucesso');
            }
            navigate('/employees');
        } catch (error) {
            console.error("Erro ao salvar funcionário:", error);
            toast.error(error.response?.data?.message || 'Erro ao salvar funcionário. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {id ? 'Editar Funcionário' : 'Novo Funcionário'}
            </h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <Input
                            label="Nome Completo"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            icon={User}
                        />

                        <Input
                            label="CPF"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            placeholder="000.000.000-00"
                            required
                            icon={FileText}
                        />

                        {/* SELETOR DE CARGO COM BUSCA */}
                        <div className="relative">
                            <AsyncSelect
                                label="Cargo / Função"
                                placeholder="Busque o cargo..."
                                fetchOptions={fetchRoles}
                                value={selectedRole}
                                onChange={handleRoleChange}
                                required
                            />
                        </div>

                        <Input
                            label="E-mail"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            icon={Mail}
                        />

                        <Input
                            label="Telefone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            icon={Phone}
                        />


                        {/* CAMPO CONDICIONAL DE COMISSÃO */}
                        {showCommission && (
                            <div className="md:col-span-1 animate-fadeIn">
                                <Input
                                    label="Comissão (%)"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    name="commissionPercentage"
                                    value={formData.commissionPercentage}
                                    onChange={handleCommissionChange}
                                    placeholder="Ex: 10.5"
                                    icon={Percent}
                                    required={showCommission}
                                />
                                <p className="text-xs text-gray-500 mt-1 ml-1">
                                    % aplicada sobre a mão de obra.
                                </p>
                            </div>
                        )}

                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                        <Button type="button" variant="secondary" onClick={() => navigate('/employees')}>
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

export default EmployeeForm;