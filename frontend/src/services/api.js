const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;

// Create a helper to fetch the token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('rj_bakers_token');
};

// Helper to resolve backend image URLs
export const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Ensure starting slash
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${cleanPath}`;
};

// Simple fetch-based wrapper or Axios wrapper
import axios from 'axios';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization header automatically
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
