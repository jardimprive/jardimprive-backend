import axios from 'axios';
import Router from 'next/router';

const api = axios.create({
  baseURL: 'https://jardimprive-backend.onrender.com/api',
});

// Adiciona token automaticamente nas requisições
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercepta 401 (token inválido ou expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      Router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
