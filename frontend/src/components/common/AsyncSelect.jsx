import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

/**
 * Componente de seleção com busca assíncrona.
 * @param {string} label - Rótulo do campo
 * @param {function} fetchOptions - Função que retorna uma Promise com os dados (busca)
 * @param {object} value - O item selecionado atualmente { value, label, ...outros }
 * @param {function} onChange - Função chamada ao selecionar um item
 * @param {string} placeholder - Texto de ajuda
 * @param {boolean} disabled - Se o campo está desabilitado
 */
const AsyncSelect = ({ label, fetchOptions, value, onChange, placeholder = "Digite para buscar...", disabled = false, required = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    // Fecha o dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Busca dados quando o termo de pesquisa muda (Debounce simples)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (isOpen) {
                setLoading(true);
                try {
                    // Chama a função de busca passada por prop
                    const results = await fetchOptions(searchTerm);
                    // Normaliza os dados: espera que results seja array ou { content: [] }
                    const list = Array.isArray(results) ? results : (results.content || []);

                    // Mapeia para formato padrão se necessário, ou usa como vem se já tratado
                    setOptions(list);
                } catch (error) {
                    console.error("Erro na busca:", error);
                    setOptions([]);
                } finally {
                    setLoading(false);
                }
            }
        }, 300); // Espera 300ms após parar de digitar

        return () => clearTimeout(timer);
    }, [searchTerm, isOpen, fetchOptions]);

    const handleSelect = (item) => {
        onChange(item); // Retorna o objeto completo ou o valor conforme necessidade
        setIsOpen(false);
        setSearchTerm('');
    };

    const clearSelection = (e) => {
        e.stopPropagation();
        onChange(null);
    };

    return (
        <div className="mb-4 relative" ref={wrapperRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div
                className={`relative w-full bg-white border rounded-lg shadow-sm cursor-text transition-all ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}`}
                onClick={() => !disabled && setIsOpen(true)}
            >
                <div className="flex items-center px-4 py-2.5 min-h-[42px]">
                    {/* Se tiver valor selecionado, mostra o label dele, senão mostra o input de busca */}
                    {!isOpen && value ? (
                        <span className="flex-1 text-gray-900 truncate">
                {value.label}
            </span>
                    ) : (
                        <input
                            type="text"
                            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                            placeholder={value ? value.label : placeholder}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if(!isOpen) setIsOpen(true);
                            }}
                            disabled={disabled}
                            autoFocus={isOpen}
                        />
                    )}

                    <div className="flex items-center gap-2 ml-2 text-gray-400">
                        {value && !disabled && !isOpen && (
                            <button onClick={clearSelection} className="hover:text-red-500">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        )}
                    </div>
                </div>

                {/* Dropdown de Opções */}
                {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {options.length > 0 ? (
                            options.map((item, index) => (
                                <div
                                    key={item.value || index} // Tenta usar item.value como key
                                    className="px-4 py-2 hover:bg-primary-50 cursor-pointer text-sm text-gray-700 border-b last:border-0 border-gray-50"
                                    onClick={() => handleSelect(item)}
                                >
                                    {item.label}
                                    {item.subLabel && <span className="block text-xs text-gray-400">{item.subLabel}</span>}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                {loading ? 'Buscando...' : 'Nenhum resultado encontrado.'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AsyncSelect;