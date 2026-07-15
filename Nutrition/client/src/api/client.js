import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nutrition_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nutrition_token');
      localStorage.removeItem('nutrition_user');
      if (!window.location.pathname.includes('/login')) window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export function apiError(error) {
  return error.response?.data?.message || error.message || 'Something went wrong';
}

export default api;
