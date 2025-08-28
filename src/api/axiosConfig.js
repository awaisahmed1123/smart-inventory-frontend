import axios from 'axios';

// Ek naya axios instance banayen
const api = axios.create({
    baseURL: 'http://localhost:5000', // Aapke backend ka base URL
});

// Yeh ek "interceptor" hai - yeh har request ke bhejne se pehle usay rokta hai
api.interceptors.request.use(config => {
    // localStorage se token hasil karo
    const token = localStorage.getItem('token');
    if (token) {
        // Agar token mojood hai, to usay 'Authorization' header mein add kar do
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;