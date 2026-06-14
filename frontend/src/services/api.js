import axios from 'axios';

const AUTH_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3001/api';
const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:3002/api';

const authHttpClient = axios.create({ baseURL: AUTH_URL });
const analyticsHttpClient = axios.create({ baseURL: ANALYTICS_URL });

// Interceptor para injetar o Token JWT de forma limpa (Clean Code)
const injectToken = (config) => {
  const token = localStorage.getItem('medmetrics_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authHttpClient.interceptors.request.use(injectToken);
analyticsHttpClient.interceptors.request.use(injectToken);

// Design Pattern: Gateway para isolar o Axios do resto da aplicação
export const AuthService = {
  async login(id_institucional, password) {
    const response = await authHttpClient.post('/auth/login', { id_institucional, password });
    return response.data; // Retorna { token, user: { role, name } }
  }
};

export const AnalyticsService = {
  async fetchMetrics() {
    const response = await analyticsHttpClient.get('/metrics');
    return response.data;
  },
  async saveMetric(metricData) {
    const response = await analyticsHttpClient.post('/metrics', metricData);
    return response.data;
  }
};