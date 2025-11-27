import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { Users, Car, ClipboardList, Receipt, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        clientsCount: 0,
        vehiclesCount: 0,
        activeOrdersCount: 0,
        pendingInvoicesCount: 0,
        monthlyRevenue: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getStats();
            setStats(data);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar dados do painel.');
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        { label: 'Clientes', value: stats.clientsCount, icon: Users, color: 'bg-blue-500' },
        { label: 'Veículos', value: stats.vehiclesCount, icon: Car, color: 'bg-green-500' },
        { label: 'OS em Andamento', value: stats.activeOrdersCount, icon: ClipboardList, color: 'bg-yellow-500' },
        { label: 'Faturas Pendentes', value: stats.pendingInvoicesCount, icon: Receipt, color: 'bg-red-500' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Faturamento do Mês</p>
                    <p className="text-2xl font-bold text-green-600">
                        R$ {Number(stats.monthlyRevenue || 0).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">{card.label}</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-2">
                                        {loading ? '...' : card.value}
                                    </p>
                                </div>
                                <div className={`${card.color} p-3 rounded-lg text-white shadow-lg shadow-${card.color}/30`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Acesso Rápido</h2>
                <div className="flex flex-wrap gap-4">
                    <button onClick={() => navigate('/service-orders/new')} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                        + Nova OS
                    </button>
                    <button onClick={() => navigate('/clients/new')} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                        + Novo Cliente
                    </button>
                    <button onClick={() => navigate('/reports/commissions')} className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Relatório de Comissões
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;