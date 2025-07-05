import axios from 'axios';
import Cookies from 'js-cookie';
import Router from 'next/router';

const api = axios.create({
  baseURL: 'https://jardimprive-backend.onrender.com/api', // Corrigido: baseURL só até /api
});

// Adiciona token automaticamente nas requisições
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepta respostas para tratar 401 (token inválido/expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      Cookies.remove('token');
      Router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
