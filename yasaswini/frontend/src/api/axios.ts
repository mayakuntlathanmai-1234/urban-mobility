import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('urban_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const userId = localStorage.getItem('urban_user_id');
    if (userId) {
      config.headers['X-User-Id'] = userId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle status codes cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.response?.data?.error || 'An unexpected error occurred';

    if (status === 401) {
      // Token expired or invalid -> logout
      localStorage.removeItem('urban_token');
      localStorage.removeItem('urban_user');
      localStorage.removeItem('urban_user_id');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    } else if (status === 409) {
      // Concurrency lock conflict: Another driver accepted the ride
      console.warn('[CONCURRENCY CONFLICT]', message);
    }

    return Promise.reject(error);
  }
);

export default api;
