import axios from 'axios';

const apiOrigin = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD
    ? 'https://lmsforcollege-production.up.railway.app'
    : 'http://localhost:8080');

const client = axios.create({
  baseURL: `${apiOrigin.replace(/\/+$/, '')}/api`
});

client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
