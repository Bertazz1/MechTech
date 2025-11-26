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
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUserProfile = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            if (error.response && error.response.status === 401) {
                authService.logout();
                setIsAuthenticated(false);
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadUserProfile();
        } else {
            setLoading(false);
            setUser(null);
        }
    }, [isAuthenticated]);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await authService.login(email, password);
            localStorage.setItem('token', response.token);
            setIsAuthenticated(true);

            await loadUserProfile();

            return { success: true };
        } catch (error) {
            setLoading(false);
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