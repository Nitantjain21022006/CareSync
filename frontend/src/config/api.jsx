import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // Required for cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercept responses to handle 401s centrally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login or clear state if needed
            console.error('Session expired or unauthorized');
        }
        return Promise.reject(error);
    }
    
);

export default api;
