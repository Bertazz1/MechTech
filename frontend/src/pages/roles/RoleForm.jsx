import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { roleService } from '../../services/roleService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { parseApiError } from '../../utils/errorUtils';

const RoleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        receivesCommission: false
    });

    useEffect(() => {
        if (id) {
            loadRole();
        }
    }, [id]);

    const loadRole = async () => {
        try {
            const data = await roleService.getById(id);
            setFormData({
                name: data.name,
                receivesCommission: data.receivesCommission || false
            });
        } catch (error) {
            toast.error('Erro ao carregar cargo');
            navigate('/roles');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (id) {
                await roleService.update(id, formData);
                toast.success('Cargo atualizado com sucesso');
            } else {
                await roleService.create(formData);
                toast.success('Cargo criado com sucesso');
            }
            navigate('/roles');
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {id ? 'Editar Cargo' : 'Novo Cargo'}
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Nome do Cargo"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: Mecânico Sênior"
                        required
                        icon={ShieldCheck}
                    />

                    {/* Checkbox de Comissão */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary-200 transition-colors">
                        <div className="flex items-center h-5">
                            <input
                                id="commission"
                                type="checkbox"
                                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                                checked={formData.receivesCommission}
                                onChange={(e) => setFormData({...formData, receivesCommission: e.target.checked})}
                            />
                        </div>
                        <div className="ml-2 text-sm">
                            <label htmlFor="commission" className="font-medium text-gray-700 cursor-pointer select-none">
                                Elegível para Comissão?
                            </label>
                            <p className="text-gray-500 text-xs mt-0.5">
                                Habilita o campo de porcentagem no cadastro de funcionários com este cargo.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button type="button" variant="secondary" onClick={() => navigate('/roles')}>
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

export default RoleForm;