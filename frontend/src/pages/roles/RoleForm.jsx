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
        description: '',
        receivesCommission: false
    });

    useEffect(() => {
        if (id) loadRole();
    }, [id]);

    const loadRole = async () => {
        try {
            const data = await roleService.getById(id);
            setFormData({
                name: data.name,
                description: data.description || '',
                receivesCommission: data.receivesCommission || false
            });
            // eslint-disable-next-line no-unused-vars
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
                toast.success('Cargo atualizado!');
            } else {
                await roleService.create(formData);
                toast.success('Cargo criado!');
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
                        placeholder="Ex: Mecânico Chefe"
                        required
                        icon={ShieldCheck}
                    />

                    <Input
                        label="Descrição (Opcional)"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Ex: Responsável pela equipe técnica..."
                    />

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <input
                            type="checkbox"
                            id="commission"
                            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
                            checked={formData.receivesCommission}
                            onChange={(e) => setFormData({...formData, receivesCommission: e.target.checked})}
                        />
                        <label htmlFor="commission" className="text-gray-700 font-medium cursor-pointer select-none">
                            Este cargo recebe comissão sobre serviços?
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
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