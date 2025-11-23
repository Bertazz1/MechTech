import { useState, useEffect } from 'react';
import { Users, Car, ClipboardList, Receipt, AlertCircle } from 'lucide-react';
import { clientService } from '../../services/clientService';
import { vehicleService } from '../../services/vehicleService';
import { serviceOrderService } from '../../services/serviceOrderService';
import { invoiceService } from '../../services/invoiceService';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);

    // Agora o estado guarda o valor E se houve erro para cada item
    const [statsData, setStatsData] = useState({
        clients: { value: 0, error: false },
        vehicles: { value: 0, error: false },
        activeOrders: { value: 0, error: false },
        pendingInvoices: { value: 0, error: false }
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Promise.allSettled seria ideal, mas com catch(return null) simulamos algo similar
            // Retornamos NULL em caso de erro para diferenciar de ARRAY VAZIO
            const [clientsData, vehiclesData, ordersData, invoicesData] = await Promise.all([
                clientService.getAll().catch(err => { console.error('Erro Clients:', err); return null; }),
                vehicleService.getAll().catch(err => { console.error('Erro Vehicles:', err); return null; }),
                serviceOrderService.getAll().catch(err => { console.error('Erro Orders:', err); return null; }),
                invoiceService.getAll().catch(err => { console.error('Erro Invoices:', err); return null; })
            ]);

            // Função auxiliar para processar contagem ou detectar erro
            const processData = (data, filterFn = null) => {
                if (data === null) return { value: 0, error: true }; // Se for null, foi erro

                let list = [];
                if (Array.isArray(data)) list = data;
                else if (data?.content) list = data.content;
                else if (data?.totalElements !== undefined) return { value: data.totalElements, error: false };

                // Aplica filtro se necessário (ex: contar apenas ordens ativas)
                if (filterFn) {
                    return { value: list.filter(filterFn).length, error: false };
                }

                return { value: list.length, error: false };
            };

            // Atualiza o estado processando cada resposta
            setStatsData({
                clients: processData(clientsData),
                vehicles: processData(vehiclesData),
                activeOrders: processData(ordersData, order =>
                    order.status !== 'COMPLETO' && order.status !== 'CANCELADO'
                ),
                pendingInvoices: processData(invoicesData, invoice =>
                    invoice.paymentStatus === 'PENDING' || invoice.paymentStatus === 'OVERDUE'
                )
            });

        } catch (error) {
            console.error("Erro fatal no dashboard:", error);
            toast.error('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Clientes', data: statsData.clients, icon: Users, color: 'bg-blue-500' },
        { label: 'Veículos', data: statsData.vehicles, icon: Car, color: 'bg-green-500' },
        { label: 'Ordens Ativas', data: statsData.activeOrders, icon: ClipboardList, color: 'bg-yellow-500' },
        { label: 'Faturas Pendentes', data: statsData.pendingInvoices, icon: Receipt, color: 'bg-red-500' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <div className="flex gap-2">
                    {loading && <span className="text-sm text-gray-500 animate-pulse self-center">Atualizando...</span>}
                    {/* Botão de recarregar manual em caso de erro */}
                    <button
                        onClick={loadDashboardData}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Recarregar dados"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    const isError = stat.data.error;

                    return (
                        <div
                            key={index}
                            className={`bg-white rounded-xl shadow-sm border p-6 transition-all duration-300 group
                ${isError ? 'border-red-200 bg-red-50/30' : 'border-gray-100 hover:shadow-lg hover:-translate-y-1'}
              `}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                                    <div className="mt-2">
                                        {loading ? (
                                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                                        ) : isError ? (
                                            <div className="flex items-center text-red-500 gap-2" title="Erro ao carregar dados">
                                                <AlertCircle className="w-6 h-6" />
                                                <span className="text-sm font-medium">Erro</span>
                                            </div>
                                        ) : (
                                            <p className="text-3xl font-bold text-gray-900">{stat.data.value}</p>
                                        )}
                                    </div>
                                </div>
                                <div className={`${stat.color} p-4 rounded-xl shadow-lg opacity-90 group-hover:opacity-100 transition-opacity`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Bem-vindo ao MyMechanic</h2>
                <p className="text-gray-600 mb-4">
                    Esta é a visão geral da sua oficina. Use o menu lateral para gerenciar as áreas específicas.
                </p>

                <div className="flex flex-wrap gap-4 mt-4">
                    <h3 className="w-full text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Acesso Rápido</h3>
                    <a href="/service-orders/new" className="text-sm px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                        + Nova Ordem de Serviço
                    </a>
                    <a href="/clients/new" className="text-sm px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                        + Novo Cliente
                    </a>
                    <a href="/quotations/new" className="text-sm px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                        + Novo Orçamento
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;