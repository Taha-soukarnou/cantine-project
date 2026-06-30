import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8092/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API request:', config.method, config.url, config.data ? config.data : '');
    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log('API response:', response.status, response.config.url, response.data);
        return response;
    },
    (error) => {
        const response = error.response;
        console.error(
            'API response error:',
            error.config?.url,
            response?.status,
            response?.data || error.message
        );
        if (response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default api;