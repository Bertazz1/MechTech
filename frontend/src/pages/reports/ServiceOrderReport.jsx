import { useState, useMemo } from 'react';
import { reportService } from '../../services/reportService';
import { clientService } from '../../services/clientService';
import { vehicleService } from '../../services/vehicleService';
import { employeeService } from '../../services/employeeService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AsyncSelect from '../../components/common/AsyncSelect';
import Select from '../../components/common/Select';
import toast from 'react-hot-toast';
import { Search, FileText, Filter, X } from 'lucide-react';
import { parseApiError } from '../../utils/errorUtils';

const ServiceOrderReport = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        startDate: firstDay,
        endDate: lastDay,
        employeeId: '',
        clientId: '',
        vehicleId: '',
        status: ''
    });

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const statusOptions = [
        { value: 'PENDENTE', label: 'Pendente' },
        { value: 'EM_PROGRESSO', label: 'Em Progresso' },
        { value: 'COMPLETO', label: 'Completo' },
        { value: 'CANCELADO', label: 'Cancelado' },
    ];

    const formatMoney = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    // CORREÇÃO: Formato Brasileiro dd/MM/yyyy
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        // Ajuste: Mostra data e hora ou só data conforme preferência. Aqui: dd/MM/yyyy HH:mm
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const fetchEmployees = async (query) => {
        try {
            const response = await employeeService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(e => ({ value: e.id, label: e.name }));
        } catch (e) { return []; }
    };

    const fetchClients = async (query) => {
        try {
            const response = await clientService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(c => ({ value: c.id, label: c.name, subLabel: c.cpf }));
        } catch (e) { return []; }
    };

    // CORREÇÃO: Busca veículo e traz dados do dono
    const fetchVehicles = async (query) => {
        try {
            const response = await vehicleService.search(query);
            const list = Array.isArray(response) ? response : (response.content || []);
            return list.map(v => {
                // Suporta estrutura aninhada ou plana
                const modelName = v.model?.name || v.modelName || '';
                const clientName = v.client?.name || v.clientName;
                const clientId = v.client?.id || v.clientId;

                return {
                    value: v.id,
                    label: `${modelName} - ${v.licensePlate}`,
                    subLabel: clientName ? `Dono: ${clientName}` : '',
                    // Objeto com dados do cliente para preenchimento automático
                    clientData: clientId ? { id: clientId, name: clientName, cpfCnpj: v.client?.cpfCnpj } : null
                };
            });
        } catch (e) { return []; }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await reportService.getServiceOrders(filters);
            setReportData(data);
            setSearched(true);
            if (data.length === 0) toast.success("Nenhum registro encontrado.");
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setFilters({
            startDate: firstDay,
            endDate: lastDay,
            employeeId: '',
            clientId: '',
            vehicleId: '',
            status: ''
        });
        setSelectedEmployee(null);
        setSelectedClient(null);
        setSelectedVehicle(null);
        setReportData([]);
        setSearched(false);
    };

    const totals = useMemo(() => {
        return reportData.reduce((acc, curr) => ({
            parts: acc.parts + (curr.partsTotal || 0),
            services: acc.services + (curr.servicesTotal || 0),
            total: acc.total + (curr.totalAmount || 0)
        }), { parts: 0, services: 0, total: 0 });
    }, [reportData]);

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                </div>
                Relatório de Ordens de Serviço
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <form onSubmit={handleSearch}>
                    <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold border-b pb-2">
                        <Filter className="w-5 h-5" /> Filtros
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <Input label="Início" type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
                        <Input label="Fim" type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
                        <Select label="Status" options={statusOptions} value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} />
                        <AsyncSelect
                            label="Funcionário"
                            placeholder="Buscar..."
                            fetchOptions={fetchEmployees}
                            value={selectedEmployee}
                            onChange={(opt) => {
                                setSelectedEmployee(opt);
                                setFilters(prev => ({ ...prev, employeeId: opt ? opt.value : '' }));
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Seletor de Veículo com Auto-Select de Cliente */}
                        <AsyncSelect
                            label="Veículo"
                            placeholder="Buscar placa/modelo..."
                            fetchOptions={fetchVehicles}
                            value={selectedVehicle}
                            onChange={(opt) => {
                                setSelectedVehicle(opt);
                                setFilters(prev => ({ ...prev, vehicleId: opt ? opt.value : '' }));

                                // CORREÇÃO: Preenche o cliente automaticamente
                                if (opt && opt.clientData) {
                                    const clientOpt = {
                                        value: opt.clientData.id,
                                        label: opt.clientData.name,
                                        subLabel: opt.clientData.cpf || 'Vinculado'
                                    };
                                    setSelectedClient(clientOpt);
                                    setFilters(prev => ({ ...prev, clientId: opt.clientData.id }));
                                    toast.success(`Filtro de cliente definido: ${opt.clientData.name}`);
                                }
                            }}
                        />
                        <AsyncSelect
                            label="Cliente"
                            placeholder="Buscar cliente..."
                            fetchOptions={fetchClients}
                            value={selectedClient}
                            onChange={(opt) => {
                                setSelectedClient(opt);
                                setFilters(prev => ({ ...prev, clientId: opt ? opt.value : '' }));
                            }}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <Button type="button" variant="secondary" onClick={handleClearFilters} className="flex items-center gap-2">
                            <X className="w-4 h-4" /> Limpar
                        </Button>
                        <Button type="submit" disabled={loading} className="flex items-center gap-2">
                            {loading ? 'Buscando...' : <><Search className="w-4 h-4" /> Gerar</>}
                        </Button>
                    </div>
                </form>
            </div>

            {searched && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OS #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Veículo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrada</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saída</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.length === 0 ? (
                                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">Nenhum registro.</td></tr>
                            ) : (
                                reportData.map((os) => (
                                    <tr key={os.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700">#{os.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{os.clientName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {os.vehiclePlate} <span className="text-xs text-gray-400">({os.vehicleModel})</span>
                                        </td>
                                        {/* Datas formatadas */}
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(os.entryDate)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{os.exitDate ? formatDate(os.exitDate) : '-'}</td>
                                        <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                                    ${os.status === 'COMPLETO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {os.status}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatMoney(os.totalAmount)}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                            <tfoot className="bg-gray-100 border-t border-gray-200">
                            <tr>
                                <td colSpan="6" className="px-6 py-3 text-sm font-bold text-gray-700 text-right">TOTAL:</td>
                                <td className="px-6 py-3 text-sm font-bold text-primary-700 text-right bg-blue-50">{formatMoney(totals.total)}</td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceOrderReport;