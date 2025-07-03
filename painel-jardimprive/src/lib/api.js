import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'https://jardimprive-backend.onrender.com/', // 🔥 Troca para o endereço do backend online depois
});

// 👉 Adiciona o token automaticamente nas requisições
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
