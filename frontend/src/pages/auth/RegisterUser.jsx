import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { UserPlus, ArrowLeft, KeyRound } from 'lucide-react';

const RegisterUser = () => {
    const navigate = useNavigate();
    const { registerAndLogin, loading } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        inviteToken: '' // Token da empresa
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('As senhas não conferem.');
            return;
        }

        if (!formData.inviteToken) {
            toast.error('O código de convite é obrigatório.');
            return;
        }

        const dataToSend = {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            inviteToken: formData.inviteToken
        };

        const result = await registerAndLogin(dataToSend);

        if (result.success) {
            toast.success('Cadastro realizado! Bem-vindo.');
            navigate('/');
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 bg-gradient-to-br from-primary-600 to-primary-800">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="mb-6">
                    <Link to="/auth" className="flex items-center text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Login
                    </Link>
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                            <UserPlus className="w-6 h-6 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Criar Conta</h2>
                        <p className="text-gray-500 mt-1">Cadastre-se com o código da sua oficina.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Bloco do Token */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                        <div className="flex items-center gap-2 text-blue-800 font-medium mb-2 text-sm">
                            <KeyRound className="w-4 h-4" /> Código de Convite
                        </div>
                        <Input
                            name="inviteToken"
                            value={formData.inviteToken}
                            onChange={handleChange}
                            placeholder="Ex: a1b2-c3d4-e5f6"
                            required
                            className="bg-white font-mono text-center tracking-wider"
                        />
                        <p className="text-xs text-blue-600 mt-2 text-center">
                            Solicite este código ao administrador da oficina.
                        </p>
                    </div>

                    <Input
                        label="Nome Completo"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="E-mail"
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
                        placeholder="(00) 00000-0000"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Senha"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Confirmar"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full mt-4 py-3 font-bold">
                        {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default RegisterUser;