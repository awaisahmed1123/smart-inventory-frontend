import axios from 'axios';

const api = axios.create({
    // VVIP FIX: baseURL ab .env file se aayega taake local aur live server dono par kaam kare
    baseURL: import.meta.env.VITE_API_URL, 
});

// Yeh "interceptor" har request ke sath aapka JWT token bhejta hai
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;