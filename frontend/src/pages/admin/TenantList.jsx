import { useState, useEffect } from 'react';
import { tenantService } from '../../services/tenantService';
import SearchBar from '../../components/common/SearchBar';
import toast from 'react-hot-toast';
import { Building, CheckCircle, XCircle, Power } from 'lucide-react';
import Button from '../../components/common/Button';

const TenantList = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTenants();
    }, []);

    const loadTenants = async () => {
        try {
            setLoading(true);
            const data = await tenantService.getAll();
            if (Array.isArray(data)) setTenants(data);
            else if (data?.content) setTenants(data.content);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar empresas.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (tenant) => {
        const action = tenant.active ? 'desativar' : 'ativar';
        if (!confirm(`Tem certeza que deseja ${action} a empresa ${tenant.name}?`)) return;

        try {
            const updatedTenant = await tenantService.update(tenant.id, { active: !tenant.active });
            setTenants(tenants.map(t => t.id === tenant.id ? updatedTenant : t));
            toast.success(`Empresa ${action}da com sucesso!`);
        } catch (error) {
            toast.error(`Erro ao ${action} empresa.`);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Building className="w-8 h-8 text-primary-600" /> Empresas
                </h1>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan="5" className="text-center py-4">Carregando...</td></tr>
                    ) : tenants.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-4 text-gray-500">Nenhuma empresa encontrada.</td></tr>
                    ) : (
                        tenants.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{tenant.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.document}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {tenant.active ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Ativo
                                            </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                <XCircle className="w-3 h-3 mr-1" /> Inativo
                                            </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <Button
                                        variant="icon"
                                        onClick={() => handleToggleActive(tenant)}
                                        className={tenant.active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                                        title={tenant.active ? 'Desativar' : 'Ativar'}
                                    >
                                        <Power className="w-5 h-5" />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TenantList;