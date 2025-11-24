import { useState } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Play } from 'lucide-react';

const StartServiceModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [mileage, setMileage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!mileage) {
            setError('A quilometragem é obrigatória');
            return;
        }
        // Envia os dados para o pai
        onConfirm({ initialMileage: parseInt(mileage) });
    };

    // Reseta o form ao fechar/abrir
    const handleClose = () => {
        setMileage('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Iniciar Serviço">
            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100 flex items-start gap-3">
                        <Play className="w-5 h-5 text-blue-600 mt-0.5" />
                        <p className="text-sm text-blue-800">
                            Você está prestes a iniciar esta Ordem de Serviço.
                            Por favor, confirme a quilometragem atual do veículo no painel.
                        </p>
                    </div>

                    <Input
                        label="Quilometragem Atual (KM)"
                        type="number"
                        value={mileage}
                        onChange={(e) => {
                            setMileage(e.target.value);
                            setError('');
                        }}
                        error={error}
                        placeholder="Ex: 45000"
                        required
                    />

                    {/* adicionar input de Fotos/Upload aqui */}
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={handleClose} type="button">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} variant="primary">
                        {loading ? 'Iniciando...' : 'Confirmar Início'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default StartServiceModal;