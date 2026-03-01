import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

interface User {
    id: string;
    fullName: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount, verify the stored token and restore session
    useEffect(() => {
        const token = localStorage.getItem('swasthai_token');
        if (!token) {
            setIsLoading(false);
            return;
        }
        api.get<{ user: User }>('/auth/me')
            .then(data => setUser(data.user))
            .catch(() => {
                localStorage.removeItem('swasthai_token');
                localStorage.removeItem('swasthai_user');
            })
            .finally(() => setIsLoading(false));
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
        localStorage.setItem('swasthai_token', data.token);
        localStorage.setItem('swasthai_user', JSON.stringify(data.user));
        setUser(data.user);
    }, []);

    const register = useCallback(async (fullName: string, email: string, password: string) => {
        const data = await api.post<{ token: string; user: User }>('/auth/register', { fullName, email, password });
        localStorage.setItem('swasthai_token', data.token);
        localStorage.setItem('swasthai_user', JSON.stringify(data.user));
        setUser(data.user);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('swasthai_token');
        localStorage.removeItem('swasthai_user');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthContext;
