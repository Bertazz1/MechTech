import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    Car,
    ClipboardList,
    FileText,
    Wrench,
    Package,
    Receipt,
    UserCog,
    LogOut,
    Building,
    DollarSign // <--- Ícone para Comissões
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/service-orders', label: 'Ordens de Serviço', icon: ClipboardList },
        { path: '/quotations', label: 'Orçamentos', icon: FileText },
        { path: '/invoices', label: 'Faturas', icon: Receipt },
        { path: '/reports/commissions', label: 'Comissões', icon: DollarSign }, // <--- NOVO ITEM
        { path: '/clients', label: 'Clientes', icon: Users },
        { path: '/vehicles', label: 'Veículos', icon: Car },
        { path: '/parts', label: 'Peças', icon: Package },
        { path: '/repair-services', label: 'Serviços', icon: Wrench },
        { path: '/employees', label: 'Funcionários', icon: UserCog },
    ];

    // Verifica se a rota está ativa para aplicar estilo de destaque
    const isActive = (path) => location.pathname === path;

    return (
        <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed left-0 top-0 overflow-y-auto z-50">
            {/* Header / Logo */}
            <div className="p-6 border-b border-gray-800 flex items-center gap-2">
                <div className="bg-primary-600 p-1.5 rounded-lg">
                    <Wrench className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">MyMechanic</span>
            </div>

            {/* Navegação Principal */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                            isActive(item.path)
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                        <item.icon
                            className={`w-5 h-5 mr-3 transition-colors ${
                                isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-white'
                            }`}
                        />
                        <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                ))}

                {/* Separador */}
                <div className="pt-4 pb-2">
                    <div className="border-t border-gray-800 mx-2"></div>
                    <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Configurações
                    </p>
                </div>

                {/* Link da Empresa */}
                <Link
                    to="/settings/company"
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                        isActive('/settings/company')
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                    <Building
                        className={`w-5 h-5 mr-3 transition-colors ${
                            isActive('/settings/company') ? 'text-white' : 'text-gray-500 group-hover:text-white'
                        }`}
                    />
                    <span className="font-medium text-sm">Minha Oficina</span>
                </Link>
            </nav>

            {/* Rodapé do Usuário */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold border border-gray-600">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.fullname || user?.name || 'Usuário'}
                        </p>
                        <p className="text-xs text-gray-500 truncate" title={user?.email}>
                            {user?.email || 'email@exemplo.com'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 hover:text-red-300 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair do Sistema
                </button>
            </div>
        </div>
    );
};

export default Sidebar;