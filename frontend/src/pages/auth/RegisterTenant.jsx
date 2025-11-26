import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tenantService } from '../../services/tenantService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Wrench, ArrowRight, Building, User } from 'lucide-react';
import { parseApiError } from '../../utils/errorUtils';

const RegisterTenant = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        companyName: '',
        companyDocument: '',
        companyPhone: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (!formData.companyName || !formData.companyDocument) {
            toast.error("Preencha os dados da empresa");
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.adminPassword !== formData.confirmPassword) {
            toast.error('As senhas não conferem');
            return;
        }

        setLoading(true);
        try {
            await tenantService.register(formData);
            toast.success('Conta criada com sucesso!');
            navigate('/auth');
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-primary-600 p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-3">
                        <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Criar Conta</h2>
                    <p className="text-primary-100 text-sm">Gerencie sua oficina de forma profissional</p>
                </div>

                <div className="p-8">
                    {/* Steps */}
                    <div className="flex items-center justify-center mb-8">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <div className={`w-12 h-1 mx-2 rounded ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                    </div>

                    <form onSubmit={step === 1 ? handleNextStep : handleSubmit}>
                        {step === 1 ? (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex items-center gap-2 text-gray-700 font-semibold pb-2 border-b">
                                    <Building className="w-5 h-5" /> Dados da Oficina
                                </div>
                                <Input label="Nome da Oficina" name="companyName" value={formData.companyName} onChange={handleChange} required autoFocus />
                                <Input label="CNPJ ou CPF" name="companyDocument" value={formData.companyDocument} onChange={handleChange} required />
                                <Input label="Telefone" name="companyPhone" value={formData.companyPhone} onChange={handleChange} />
                                <Button type="submit" className="w-full mt-4">Continuar </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade-in">sss
                                <div className="flex items-center gap-2 text-gray-700 font-semibold pb-2 border-b">
                                    <User className="w-5 h-5" /> Dados do Admin
                                </div>
                                <Input label="Nome Completo" name="adminName" value={formData.adminName} onChange={handleChange} required autoFocus />
                                <Input label="E-mail" type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} required />
                                <Input label="Senha" type="password" name="adminPassword" value={formData.adminPassword} onChange={handleChange} required />
                                <Input label="Confirmar Senha" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

                                <div className="flex gap-3 mt-6">
                                    <Button type="button" variant="secondary" onClick={() => setStep(1)} className="w-1/3">Voltar</Button>
                                    <Button type="submit" disabled={loading} className="w-2/3">
                                        {loading ? 'Criando...' : 'Finalizar Cadastro'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="mt-6 text-center border-t pt-4">
                        <p className="text-sm text-gray-600">
                            Já tem uma conta? <Link to="/auth" className="text-primary-600 font-bold hover:underline">Entrar</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterTenant;