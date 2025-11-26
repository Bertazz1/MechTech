import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Wrench } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(credentials.email, credentials.password);

        if (result.success) {
            toast.success('Login realizado com sucesso!');
            navigate('/');
        } else {
            toast.error(result.error);
        }
    };

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary-600 p-3 rounded-full mb-4 shadow-lg shadow-primary-600/30">
                        <Wrench className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">MyMechanic</h1>
                    <p className="text-gray-500 mt-2">Gestão Inteligente para Oficinas</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="E-mail"
                        type="email"
                        name="email"
                        value={credentials.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        required
                        autoFocus
                    />

                    <Input
                        label="Senha"
                        type="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="Digite sua senha"
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="w-full py-3 text-base font-semibold"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Ainda não tem conta?{' '}
                        <span
                            onClick={() => navigate('/register')}
                            className="text-primary-600 font-bold cursor-pointer hover:underline hover:text-primary-700 transition-colors"
                        >
                Cadastre sua Oficina
                </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;