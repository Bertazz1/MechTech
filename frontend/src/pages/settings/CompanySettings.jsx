import { useState, useEffect } from 'react';
import { tenantService } from '../../services/tenantService';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Building, Upload, Save, Image as ImageIcon, Copy, Key } from 'lucide-react';
import { parseApiError } from '../../utils/errorUtils';

const CompanySettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [logoLoading, setLogoLoading] = useState(false);

    const [formData, setFormData] = useState({
        companyName: '',
        companyDocument: '',
        companyPhone: ''
    });
    const [inviteToken, setInviteToken] = useState('');
    const [logoPreview, setLogoPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const tenantId = user?.tenantId ? Number(user.tenantId) : null;

    useEffect(() => {
        if (tenantId) {
            loadCompanyData();
        }
        return () => {
            if (logoPreview && !logoPreview.startsWith('http')) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [tenantId]);

    const loadCompanyData = async () => {
        try {
            const data = await tenantService.getById(tenantId);

            setFormData({
                companyName: data.name || '',
                companyDocument: data.document || '',
                companyPhone: data.phone || ''
            });

            // Armazena o token de convite
            if (data.inviteToken) {
                setInviteToken(data.inviteToken);
            }

            if (data.hasLogo) {
                loadLogoImage();
            }

        } catch (error) {
            console.error("Erro ao carregar dados", error);
            toast.error("Erro ao carregar dados da empresa.");
        }
    };

    const loadLogoImage = async () => {
        try {
            const blob = await tenantService.getLogo(tenantId);
            if (blob.size > 0) {
                const url = URL.createObjectURL(blob);
                setLogoPreview(url);
            }
        } catch (error) {
            console.error("Erro ao baixar logo", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveData = async (e) => {
        e.preventDefault();
        if (!tenantId) return;

        setLoading(true);
        try {
            const dataToSend = {
                companyName: formData.companyName,
                companyDocument: formData.companyDocument,
                companyPhone: formData.companyPhone
            };

            await tenantService.update(tenantId, dataToSend);
            toast.success('Dados atualizados!');
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleUploadLogo = async () => {
        if (!selectedFile || !tenantId) return;

        setLogoLoading(true);
        try {
            await tenantService.uploadLogo(tenantId, selectedFile);
            toast.success('Logo atualizada!');
            loadLogoImage();
            setSelectedFile(null);
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLogoLoading(false);
        }
    };

    if (!tenantId) return <div className="p-8 text-center">Carregando...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Building className="w-8 h-8 text-primary-600" />
                Configurações da Empresa
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LOGO */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                        <h3 className="font-semibold text-gray-700 mb-4">Logomarca</h3>
                        <div className="w-40 h-40 mx-auto border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden relative mb-4">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center"><ImageIcon className="w-10 h-10 mb-1" /><span className="text-xs">Sem Imagem</span></div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <label className="block w-full">
                                <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" />
                            </label>
                            <Button onClick={handleUploadLogo} disabled={!selectedFile || logoLoading} className="w-full text-xs" variant="secondary">
                                {logoLoading ? 'Enviando...' : <><Upload className="w-3 h-3 mr-1" /> Atualizar Logo</>}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* DADOS */}
                <div className="md:col-span-2 space-y-6">

                    {/* Código de Convite */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mt-1">
                                <Key className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-blue-900 font-bold text-sm">Código de Convite</h4>
                                <p className="text-blue-700 text-xs mt-1 max-w-sm">
                                    Envie este código para novos usuários se cadastrarem na sua oficina.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center bg-white border border-blue-200 rounded-lg px-3 py-2 shadow-sm">
                            <code className="text-lg font-mono font-bold text-blue-600 tracking-wide select-all">
                                {inviteToken || '...'}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(inviteToken);
                                    toast.success('Copiado!');
                                }}
                                className="ml-3 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Copiar"
                            >
                                <Copy className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Dados Cadastrais</h3>
                        <form onSubmit={handleSaveData} className="space-y-4">
                            <Input label="Nome da Oficina" name="companyName" value={formData.companyName} onChange={handleChange} required />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="CNPJ/CPF" name="companyDocument" value={formData.companyDocument} onChange={handleChange} required />
                                <Input label="Telefone" name="companyPhone" value={formData.companyPhone} onChange={handleChange} />
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                                    {loading ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Alterações</>}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanySettings;