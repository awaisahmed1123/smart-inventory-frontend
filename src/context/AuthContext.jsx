import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [businessSettings, setBusinessSettings] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setUser(decoded);
            fetchBusinessSettings(token);
        }
    }, []);

    const fetchBusinessSettings = async (token) => {
        try {
            const response = await api.get('/api/settings/business', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBusinessSettings(response.data);
        } catch (error) {
            console.error("Could not fetch business settings for context");
        }
    };

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData)); // User data bhi save karen
        setUser(userData);
        fetchBusinessSettings(token); // Login ke foran baad settings fetch karen
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setBusinessSettings(null);
    };

    return (
        <AuthContext.Provider value={{ user, businessSettings, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};