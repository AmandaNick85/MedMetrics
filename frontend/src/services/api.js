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
  // ==========================================
  // 1. CRUD: ATENDIMENTOS (Socioeducativo)
  // ==========================================
  async criarAtendimento(dados) {
    // Rota que dispara o UseCase customizado que mapeamos no seu app.js
    const response = await analyticsHttpClient.post('/analytics/atendimentos', dados);
    return response.data;
  },
  async listarAtendimentos() {
    const response = await analyticsHttpClient.get('/atendimentos');
    return response.data;
  },
  async atualizarAtendimento(id, dados) {
    const response = await analyticsHttpClient.put(`/atendimentos/${id}`, dados);
    return response.data;
  },
  async deletarAtendimento(id) {
    const response = await analyticsHttpClient.delete(`/atendimentos/${id}`);
    return response.data;
  },

  // ==========================================
  // 2. CRUD: METRICAS / PAINEL (Analytics)
  // ==========================================
  async listarAnalytics() {
    const response = await analyticsHttpClient.get('/analytics');
    return response.data;
  },
  async salvarAnalytics(dadosMetric) {
    const response = await analyticsHttpClient.post('/analytics', dadosMetric);
    return response.data;
  },
  async deletarAnalytics(id) {
    const response = await analyticsHttpClient.delete(`/analytics/${id}`);
    return response.data;
  },

  // ==========================================
  // 3. CRUD: RELATÓRIOS TÉCNICOS
  // ==========================================
  async criarRelatorio(dados) {
    const response = await analyticsHttpClient.post('/relatorios', dados);
    return response.data;
  },
  async listarRelatorios() {
    const response = await analyticsHttpClient.get('/relatorios');
    return response.data;
  },
  async atualizarRelatorio(id, dados) {
    const response = await analyticsHttpClient.put(`/relatorios/${id}`, dados);
    return response.data;
  },
  async deletarRelatorio(id) {
    const response = await analyticsHttpClient.delete(`/relatorios/${id}`);
    return response.data;
  }
};