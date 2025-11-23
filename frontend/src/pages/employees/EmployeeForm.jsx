import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeService } from '../../services/employeeService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    cpf: '',
  });

  useEffect(() => {
    if (id) {
      loadEmployee();
    }
  }, [id]);

  const loadEmployee = async () => {
    try {
      const data = await employeeService.getById(id);
      setFormData(data);
    } catch (error) {
      toast.error('Erro ao carregar funcionário');
      navigate('/employees');
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
        await employeeService.update(id, formData);
        toast.success('Funcionário atualizado com sucesso');
      } else {
        await employeeService.create(formData);
        toast.success('Funcionário criado com sucesso');
      }
      navigate('/employees');
    } catch (error) {
      toast.error(id ? 'Erro ao atualizar funcionário' : 'Erro ao criar funcionário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {id ? 'Editar Funcionário' : 'Novo Funcionário'}
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
              label="Cargo"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <Input
              label="CPF"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/employees')}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
