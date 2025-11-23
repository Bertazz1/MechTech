import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientService } from '../../services/clientService';
import { addressService } from '../../services/addressService'; // <--- Importe o novo serviço
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { parseApiError, getValidationErrors } from '../../utils/errorUtils';

const ClientForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false); // <--- Estado de carregamento do CEP
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        number: '',      // Adicionei campo Número se não existir
        neighborhood: '' // Adicionei campo Bairro se quiser usar
    });

    useEffect(() => {
        if (id) {
            loadClient();
        }
    }, [id]);

    const loadClient = async () => {
        try {
            const data = await clientService.getById(id);

            // Prepara o objeto para o formulário (Flattening)
            const formDataObj = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                cpf: data.cpf ? formatCPF(data.cpf) : '',

                // Extrai dados do objeto address aninhado, se existir
                street: data.address?.street || '',
                city: data.address?.city || '',
                state: data.address?.state || '',
                neighborhood: data.address?.neighborhood || '',
                number: data.address?.number || '',
                zipCode: data.address?.zipCode ? formatCEP(data.address.zipCode) : '',
                complement: data.address?.complement || ''
            };

            setFormData(formDataObj);
        } catch (error) {
            toast.error(parseApiError(error));
            navigate('/clients');
        }
    };

    const formatCPF = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    // Função para formatar o CEP visualmente (00000-000)
    const formatCEP = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{5})(\d)/, '$1-$2')
            .substr(0, 9);
    };

    //  Busca o CEP na API ---
    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');

        if (cep.length !== 8) return; // Só busca se tiver 8 dígitos

        try {
            setLoadingCep(true);
            const addressData = await addressService.getByCep(cep);

            if (addressData) {
                setFormData(prev => ({
                    ...prev,
                    // Mapeie aqui os campos conforme o retorno do seu DTO Java (CepResponseDto)
                    street: addressData.street || addressData.logradouro || prev.street,
                    city: addressData.city || addressData.localidade || prev.city,
                    state: addressData.state || addressData.uf || prev.state,
                    neighborhood: addressData.neighborhood || addressData.bairro || prev.neighborhood,

                }));
                toast.success('Endereço encontrado!');

                // Focar no campo de número após encontrar (opcional, requer ref)
                document.getElementById('number')?.focus();
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            toast.error('CEP não encontrado ou erro na busca.');
        } finally {
            setLoadingCep(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }

        if (name === 'cpf') {
            setFormData({ ...formData, [name]: formatCPF(value) });
        } else if (name === 'zipCode') {
            setFormData({ ...formData, [name]: formatCEP(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({});

        // 1. Cria o objeto AddressDto separado
        const addressData = {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode.replace(/\D/g, ''), // Remove formatação
            neighborhood: formData.neighborhood,
            number: formData.number,
            complement: formData.complement || '' // Se tiver campo complemento
        };

        // 2. Monta o ClientCreateDto com o objeto address aninhado
        const dataToSend = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone.replace(/\D/g, ''), // Limpa telefone se necessário
            cpf: formData.cpf.replace(/\D/g, ''),
            address: addressData // <--- AQUI ESTÁ A CORREÇÃO
        };

        try {
            if (id) {
                // Nota: Verifique se o DTO de Update também exige aninhamento
                await clientService.update(id, dataToSend);
                toast.success('Cliente atualizado com sucesso');
            } else {
                await clientService.create(dataToSend);
                toast.success('Cliente cadastrado com sucesso');
            }
            navigate('/clients');
        } catch (error) {
            toast.error(parseApiError(error));
            const validationErrors = getValidationErrors(error);
            const formattedErrors = {};
            Object.keys(validationErrors).forEach(key => {
                if (key.startsWith('address.')) {
                    const fieldName = key.split('.')[1]; // Pega o nome após o ponto
                    formattedErrors[fieldName] = validationErrors[key];
                } else {
                    formattedErrors[key] = validationErrors[key];
                }
            });

            if (Object.keys(formattedErrors).length > 0) {
                setFieldErrors(formattedErrors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {id ? 'Editar Cliente' : 'Novo Cliente'}
            </h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Dados Pessoais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Input
                            label="Nome"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={fieldErrors.name}
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={fieldErrors.email}
                            required
                        />

                        <Input
                            label="Telefone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            error={fieldErrors.phone}
                            required
                        />

                        <Input
                            label="CPF"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            placeholder="000.000.000-00"
                            error={fieldErrors.cpf}
                            required
                        />
                    </div>

                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Endereço</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="relative">
                            <Input
                                label="CEP"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                onBlur={handleCepBlur} // GATILHO DA BUSCA
                                placeholder="00000-000"
                                error={fieldErrors.zipCode}
                            />
                            {loadingCep && (
                                <div className="absolute right-3 top-9">
                                    <div className="animate-spin h-5 w-5 border-2 border-primary-500 rounded-full border-t-transparent"></div>
                                </div>
                            )}
                        </div>

                        <Input
                            label="Rua"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            error={fieldErrors.street}
                            className="md:col-span-2"
                        />

                        <Input
                            label="Número"
                            name="number"
                            id="number"
                            value={formData.number}
                            onChange={handleChange}
                            error={fieldErrors.number}
                        />

                        <Input
                            label="Bairro"
                            name="neighborhood"
                            value={formData.neighborhood}
                            onChange={handleChange}
                            error={fieldErrors.neighborhood}
                        />

                        <Input
                            label="Cidade"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            error={fieldErrors.city}
                        />

                        <Input
                            label="Estado"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            error={fieldErrors.state}
                            placeholder="UF"
                            maxLength={2}
                        />
                    </div>

                    <div className="flex gap-4 mt-8">
                        <Button type="submit" disabled={loading || loadingCep}>
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => navigate('/clients')}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientForm;