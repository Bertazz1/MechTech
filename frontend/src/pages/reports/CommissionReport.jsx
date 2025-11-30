import { useState } from 'react';
import { reportService } from '../../services/reportService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Search, DollarSign, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const CommissionReport = () => {
    // Datas padrão: primeiro e último dia do mês atual
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [dates, setDates] = useState({ start: firstDay, end: lastDay });
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await reportService.getCommissions(dates.start, dates.end);
            setReportData(data);
            setSearched(true);
        } catch (error) {
            toast.error('Erro ao gerar relatório');
        } finally {
            setLoading(false);
        }
    };

    const totalCommissions = reportData.reduce((acc, curr) => acc + curr.totalCommission, 0);

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                Relatório de Comissões
            </h1>

            {/* Filtro */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-1/3">
                        <Input
                            label="Data Início"
                            type="date"
                            value={dates.start}
                            onChange={(e) => setDates({...dates, start: e.target.value})}
                            required
                        />
                    </div>
                    <div className="w-full md:w-1/3">
                        <Input
                            label="Data Fim"
                            type="date"
                            value={dates.end}
                            onChange={(e) => setDates({...dates, end: e.target.value})}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full md:w-auto h-[42px] mb-px bg-purple-600 hover:bg-purple-700">
                        {loading ? 'Gerando...' : <> Gerar Relatório</>}
                    </Button>
                </form>
            </div>

            {/* Resultados */}
            {searched && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-gray-700">Resultado por Funcionário</h3>
                        <div className="text-right">
                            <span className="text-xs text-gray-500 uppercase font-bold">Total a Pagar</span>
                            <p className="text-xl font-bold text-green-600">R$ {totalCommissions.toFixed(2)}</p>
                        </div>
                    </div>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionário</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">OS Realizadas</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Comissão</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Nenhuma comissão encontrada neste período.</td></tr>
                        ) : (
                            reportData.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.employeeName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.employeeRole}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{item.completedOrdersCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-right">
                                        R$ {item.totalCommission.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CommissionReport;