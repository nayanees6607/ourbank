import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser({
                        full_name: response.data.full_name,
                        is_admin: response.data.is_admin,
                        email: response.data.email
                    });
                } catch (error) {
                    console.error("Session verification failed", error);
                    // Only logout on 401 (expired token), not on network errors
                    if (error.response?.status === 401) {
                        logout();
                    } else {
                        // Fallback to localStorage if /auth/me fails temporarily
                        const userFullName = localStorage.getItem('userFullName');
                        const isAdmin = localStorage.getItem('isAdmin');
                        if (userFullName) {
                            setUser({
                                full_name: userFullName,
                                is_admin: String(isAdmin).toLowerCase() === 'true'
                            });
                        }
                    }
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('userFullName', response.data.user_name);
            localStorage.setItem('isAdmin', response.data.is_admin);
            setUser({ full_name: response.data.user_name, is_admin: response.data.is_admin });
            return true;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('userFullName', response.data.user_name);
            localStorage.setItem('isAdmin', response.data.is_admin);
            setUser({ full_name: response.data.user_name, is_admin: response.data.is_admin });
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userFullName');
        localStorage.removeItem('isAdmin');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
