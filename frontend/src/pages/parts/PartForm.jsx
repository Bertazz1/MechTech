import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { partService } from '../../services/partService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const PartForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: '',
    supplier: '',
  });

  useEffect(() => {
    if (id) {
      loadPart();
    }
  }, [id]);

  const loadPart = async () => {
    try {
      const data = await partService.getById(id);
      setFormData(data);
    } catch (error) {
      toast.error('Erro ao carregar peça');
      navigate('/parts');
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
        await partService.update(id, formData);
        toast.success('Peça atualizada com sucesso');
      } else {
        await partService.create(formData);
        toast.success('Peça criada com sucesso');
      }
      navigate('/parts');
    } catch (error) {
      toast.error(id ? 'Erro ao atualizar peça' : 'Erro ao criar peça');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {id ? 'Editar Peça' : 'Nova Peça'}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Código"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
            />

            <Input
              label="Preço"
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />

            <Input
              label="Fornecedor"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/parts')}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartForm;
