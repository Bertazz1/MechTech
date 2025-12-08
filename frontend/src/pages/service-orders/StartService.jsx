import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { serviceOrderService } from '../../services/serviceOrderService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Play, ArrowLeft, Car, User } from 'lucide-react';
import { parseApiError } from '../../utils/errorUtils';

const StartService = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [osData, setOsData] = useState(null);
    const [initialMileage, setInitialMileage] = useState('');

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const data = await serviceOrderService.getById(id);
            setOsData(data);
            if (data.initialMileage) setInitialMileage(data.initialMileage);
        } catch (error) {
            toast.error('Erro ao carregar dados da OS');
            navigate('/service-orders');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!initialMileage) {
            toast.error('A quilometragem é obrigatória');
            return;
        }

        setLoading(true);
        try {
            // Apenas muda status e KM. A equipe será definida nos itens depois.
            await serviceOrderService.update(id, {
                status: 'EM_PROGRESSO',
                initialMileage: parseInt(initialMileage)
            });
            toast.success('Serviço iniciado! Agora adicione os serviços e técnicos.');
            // Redireciona para EDIÇÃO para que ele possa lançar os serviços e quem fez
            navigate(`/service-orders/edit/${id}`);
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLoading(false);
        }
    };

    if (!osData) return <div className="p-8 text-center">Carregando...</div>;

    return (
        <div className="max-w-xl mx-auto pt-10">
            <div className="mb-6">
                <button onClick={() => navigate('/service-orders')} className="flex items-center text-gray-500 hover:text-primary-600 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </button>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Play className="w-8 h-8 text-primary-600" /> Iniciar Serviço
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Veículo</p>
                        <p className="font-medium">{osData.vehicle?.model?.name || 'N/A'} - {osData.vehicle?.licensePlate}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Cliente</p>
                        <p className="font-medium">{osData.client?.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Quilometragem Atual (KM)"
                        type="number"
                        value={initialMileage}
                        onChange={(e) => setInitialMileage(e.target.value)}
                        required
                        autoFocus
                    />

                    <Button type="submit" disabled={loading} className="w-full justify-center py-3">
                        {loading ? 'Iniciando...' : 'Confirmar Início'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default StartService;