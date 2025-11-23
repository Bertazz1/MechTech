import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Wrench,
    Users,
    Car,
    UserCircle,
    Package,
    PenTool,
    FileText,
    ClipboardList,
    Receipt,
    LogOut,
    Menu,
    X
} from 'lucide-react';

const Sidebar = () => {
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: Wrench },
        { path: '/clients', label: 'Clientes', icon: Users },
        { path: '/vehicles', label: 'Veículos', icon: Car },
        { path: '/service-orders', label: 'Ordens de Serviço', icon: ClipboardList },
        { path: '/quotations', label: 'Orçamentos', icon: FileText },
        { path: '/invoices', label: 'Faturas', icon: Receipt },
        { path: '/parts', label: 'Peças', icon: Package },
        { path: '/repair-services', label: 'Serviços', icon: PenTool },
        { path: '/employees', label: 'Funcionários', icon: UserCircle },
    ];

    return (
        <>
            {/* Botão Mobile para abrir o menu */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-primary-600 focus:outline-none"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Overlay para fechar ao clicar fora no mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`fixed left-0 top-0 h-screen bg-slate-900 text-white transition-transform duration-300 z-40 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 w-64 shadow-xl flex flex-col`}
            >
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-600 p-2 rounded-lg">
                            <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-wide">MyMechanic</h1>
                    </div>
                </div>

                <nav className="px-3 py-6 flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)} // Fecha menu ao clicar no mobile
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                                        isActive
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`
                                }
                            >
                                <Icon className="w-5 h-5 mr-3 transition-colors" />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-medium">Sair</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;