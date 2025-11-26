import { useState, useEffect } from 'react';
import { tenantService } from '../../services/tenantService';
import { useAuth } from '../../contexts/AuthContext'; // Hook para pegar o usuário logado
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { Building, Upload, Save, Image as ImageIcon } from 'lucide-react';
import { parseApiError } from '../../utils/errorUtils';

const CompanySettings = () => {
    const { user } = useAuth(); // Precisa garantir que o user tenha o tenantId
    const [loading, setLoading] = useState(false);
    const [logoLoading, setLogoLoading] = useState(false);

    // Estados para formulário e logo
    const [formData, setFormData] = useState({
        companyName: '',
        companyDocument: '',
        companyPhone: ''
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // O ID do tenant geralmente vem do token/sessão do usuário
    // Caso seu objeto user não tenha tenantId direto, verifique como ele é retornado no login
    const tenantId = user?.tenantId;

    useEffect(() => {
        if (tenantId) {
            loadCompanyData();
        }
    }, [tenantId]);

    const loadCompanyData = async () => {
        try {
            // Nota: Se você não criou o endpoint GET /tenants/{id} no backend, precisará criar.
            // Se já criou no TenantController, isso funcionará.
            // Caso contrário, pode precisar ajustar para pegar dados do /users/me ou similar.

            // Exemplo assumindo que existe GET /api/v1/tenants/{id}
            // Se não existir, vamos simular com dados do usuário ou criar o endpoint.
            // Vou assumir que você vai adicionar o @GetMapping("/{id}") no TenantController.
            /* No Backend:
               @GetMapping("/{id}")
               public ResponseEntity<TenantResponseDto> getById(@PathVariable Long id) { ... }
            */

            // Tentativa de carregar (descomente se tiver o endpoint)
            // const data = await tenantService.getById(tenantId);
            // setFormData({
            //     companyName: data.name,
            //     companyDocument: data.document,
            //     companyPhone: data.phone
            // });

            // Se tiver logo, monta a URL
            // if (data.hasLogo) {
                 setLogoPreview(tenantService.getLogoUrl(tenantId) + `?t=${new Date().getTime()}`);
            // }

        } catch (error) {
            console.error("Erro ao carregar dados da empresa", error);
            // toast.error("Não foi possível carregar os dados da empresa.");
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
            await tenantService.update(tenantId, {
                // Mapeia para o DTO esperado pelo backend (TenantSignupDto ou criar um TenantUpdateDto)
                // Se usar TenantSignupDto, precisa enviar todos os campos obrigatórios
                companyName: formData.companyName,
                companyDocument: formData.companyDocument,
                companyPhone: formData.companyPhone,
                // Campos de admin podem ser ignorados ou enviados vazios se o DTO permitir
            });
            toast.success('Dados da empresa atualizados!');
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
            toast.success('Logo atualizada com sucesso!');
            // Força refresh da imagem no navegador
            setLogoPreview(tenantService.getLogoUrl(tenantId) + `?t=${new Date().getTime()}`);
            setSelectedFile(null);
        } catch (error) {
            toast.error(parseApiError(error));
        } finally {
            setLogoLoading(false);
        }
    };

    if (!tenantId) return <div className="p-8 text-center">Usuário não vinculado a uma empresa.</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Building className="w-8 h-8 text-primary-600" />
                Configurações da Empresa
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* COLUNA DA ESQUERDA: LOGO */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                        <h3 className="font-semibold text-gray-700 mb-4">Logomarca</h3>

                        <div className="w-40 h-40 mx-auto border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden relative mb-4">
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Logo"
                                    className="w-full h-full object-contain p-2"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <ImageIcon className="w-10 h-10 mb-1" />
                                    <span className="text-xs">Sem Imagem</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="block w-full">
                                <span className="sr-only">Escolher imagem</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-xs text-gray-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-xs file:font-semibold
                                      file:bg-primary-50 file:text-primary-700
                                      hover:file:bg-primary-100
                                      cursor-pointer"
                                />
                            </label>

                            <Button
                                onClick={handleUploadLogo}
                                disabled={!selectedFile || logoLoading}
                                className="w-full text-xs"
                                variant="secondary"
                            >
                                {logoLoading ? 'Enviando...' : <><Upload className="w-3 h-3 mr-1" /> Atualizar Logo</>}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">
                            Formato recomendado: PNG com fundo transparente.<br/>
                            Tamanho máx: 2MB.
                        </p>
                    </div>
                </div>

                {/* COLUNA DA DIREITA: DADOS */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Dados Cadastrais</h3>

                        <form onSubmit={handleSaveData} className="space-y-4">
                            <Input
                                label="Nome da Oficina / Empresa"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="Ex: Mecânica Silva"
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Documento (CNPJ/CPF)"
                                    name="companyDocument"
                                    value={formData.companyDocument}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Telefone / WhatsApp"
                                    name="companyPhone"
                                    value={formData.companyPhone}
                                    onChange={handleChange}
                                />
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