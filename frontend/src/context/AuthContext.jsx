import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        const token = localStorage.getItem('medicare_token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        try {
            const res = await api.get('/auth/me');
            setUser(res.data.data);
        } catch (err) {
            setUser(null);
            localStorage.removeItem('medicare_token');
            localStorage.removeItem('user_data');
            delete api.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password, role) => {
        const res = await api.post('/auth/login', { email, password, role });
        const { token, user: userData } = res.data;

        localStorage.setItem('medicare_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setUser(userData);
        return res.data;
    };

    const register = async (userData) => {
        const res = await api.post('/auth/signup', userData);
        const { token, user: newUser } = res.data;

        localStorage.setItem('medicare_token', token);
        localStorage.setItem('user_data', JSON.stringify(newUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setUser(newUser);
        return res.data;
    };

    const logout = async () => {
        try {
            await api.get('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('medicare_token');
            localStorage.removeItem('user_data');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
