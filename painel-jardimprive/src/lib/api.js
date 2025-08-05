import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jardimprive-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Adiciona token automaticamente nas requisições (apenas client-side)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ✅ Intercepta respostas com erro (ex: token expirado) e redireciona
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
