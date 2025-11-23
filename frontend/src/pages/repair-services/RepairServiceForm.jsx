import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { repairService } from '../../services/repairService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const RepairServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseCost: '',
  });

  useEffect(() => {
    if (id) {
      loadService();
    }
  }, [id]);

  const loadService = async () => {
    try {
      const data = await repairService.getById(id);
      setFormData(data);
    } catch (error) {
      toast.error('Erro ao carregar serviço');
      navigate('/repair-services');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await repairService.update(id, formData);
        toast.success('Serviço atualizado com sucesso');
      } else {
        await repairService.create(formData);
        toast.success('Serviço criado com sucesso');
      }
      navigate('/repair-services');
    } catch (error) {
      toast.error(id ? 'Erro ao atualizar serviço' : 'Erro ao criar serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {id ? 'Editar Serviço' : 'Novo Serviço'}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <Input
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <Input
            label="Custo Base"
            type="number"
            step="0.01"
            name="baseCost"
            value={formData.baseCost}
            onChange={handleChange}
            required
          />

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/repair-services')}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairServiceForm;
