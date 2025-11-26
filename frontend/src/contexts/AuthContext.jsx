import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // Inicializa isAuthenticated verificando o token
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [user, setUser] = useState(null); // Estado para guardar os dados do usuário (tenantId, nome, etc)
    const [loading, setLoading] = useState(true); // Começa carregando para verificar o token

    // Função para carregar dados do usuário
    const loadUserProfile = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            // Se der erro (token inválido, etc), desloga
            if (error.response && error.response.status === 401) {
                authService.logout();
                setIsAuthenticated(false);
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    // Efeito inicial: Se tem token, carrega o usuário
    useEffect(() => {
        if (isAuthenticated) {
            loadUserProfile();
        } else {
            setLoading(false);
            setUser(null);
        }
    }, [isAuthenticated]);

    const login = async (username, password) => {
        setLoading(true);
        try {
            const response = await authService.login(username, password);
            localStorage.setItem('token', response.token);
            setIsAuthenticated(true);

            // Após login com sucesso, carrega os dados do usuário imediatamente
            await loadUserProfile();

            return { success: true };
        } catch (error) {
            setLoading(false); // Garante que o loading pare em caso de erro
            return {
                success: false,
                error: error.response?.data?.message || 'Erro ao fazer login'
            };
        }
    };

    const logout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};