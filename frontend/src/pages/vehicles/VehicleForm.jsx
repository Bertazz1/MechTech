import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { clientService } from '../../services/clientService';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    licensePlate: '',
    color: '',
    clientId: '',
  });

  useEffect(() => {
    loadClients();
    if (id) {
      loadVehicle();
    }
  }, [id]);

  const loadClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    }
  };

  const loadVehicle = async () => {
    try {
      const data = await vehicleService.getById(id);
      setFormData(data);
    } catch (error) {
      toast.error('Erro ao carregar veículo');
      navigate('/vehicles');
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
        await vehicleService.update(id, formData);
        toast.success('Veículo atualizado com sucesso');
      } else {
        await vehicleService.create(formData);
        toast.success('Veículo criado com sucesso');
      }
      navigate('/vehicles');
    } catch (error) {
      toast.error(id ? 'Erro ao atualizar veículo' : 'Erro ao criar veículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {id ? 'Editar Veículo' : 'Novo Veículo'}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Cliente"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              options={clients.map((client) => ({
                value: client.id,
                label: client.name,
              }))}
              required
            />

            <Input
              label="Marca"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
            />

            <Input
              label="Modelo"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
            />

            <Input
              label="Ano"
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            />

            <Input
              label="Placa"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              required
            />

            <Input
              label="Cor"
              name="color"
              value={formData.color}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/vehicles')}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;
