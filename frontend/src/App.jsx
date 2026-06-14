import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthService } from './services/api';
import './App.css';

// ==========================================
// COMPONENTE: TELA DE LOGIN (Apresentação)
// ==========================================
const LoginView = () => {
  const [idInstitucional, setIdInstitucional] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clean Code: Função isolada para tratar o envio do formulário
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Validação básica na camada de apresentação
    if (!idInstitucional || !password) {
      setError('Por favor, preencha todos os campos institucionais.');
      return;
    }

    try {
      setLoading(true);
      // Inversão de Dependência: Consumindo o serviço isolado
      const data = await AuthService.login(idInstitucional, password);
      
      // Persistência segura dos dados da sessão
      localStorage.setItem('medmetrics_token', data.token);
      localStorage.setItem('medmetrics_role', data.user.role); // Vem como 'DIRETOR' ou 'TECNICO'
      localStorage.setItem('medmetrics_username', data.user.name);

      // RBAC: Redirecionamento baseado no cargo retornado pelo servidor (Ajustado para CAIXA ALTA)
      if (data.user.role === 'DIRETOR') {
        navigate('/diretor');
      } else if (data.user.role === 'TECNICO') {
        navigate('/tecnico');
      } else {
        setError('Perfil de acesso não reconhecido pelo sistema.');
      }
    } catch (err) {
      console.error('Erro na autenticação:', err);
      // Tratamento limpo de erro caso o servidor caia ou as credenciais estejam erradas
      setError(
        err.response?.data?.error || 
        'Falha na conexão com o servidor de autenticação do DEGASE.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-degase-navy p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card border-t-4 border-degase-gold">
        
        {/* Cabeçalho de Identidade Visual */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-degase-light text-degase-blue font-bold text-xl mb-3 border border-slate-200">
            ⚖️
          </div>
          <h1 className="text-2xl font-bold text-degase-navy font-sans tracking-tight">MedMetrics</h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">Novo DEGASE - Sistema de Saúde</p>
        </div>

        {/* Alerta de Erro Limpo */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-danger border border-red-200 font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Formulário de Acesso */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
              ID Institucional (Apenas números)
            </label>
            <input
              type="text" // CORRIGIDO: de email para text
              value={idInstitucional} // CORRIGIDO: lendo o estado correto
              onChange={(e) => setIdInstitucional(e.target.value.replace(/\D/g, ''))} // Bloqueia letras se a pessoa digitar por engano
              placeholder="Ex: 1001"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-degase-navy focus:border-degase-blue focus:bg-white focus:outline-none transition-all"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
              Senha de Acesso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-degase-navy focus:border-degase-blue focus:bg-white focus:outline-none transition-all"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-degase-blue hover:bg-degase-navy text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Validando Credenciais...' : 'Entrar no Portal'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
          Acesso restrito a servidores autorizados nos termos da lei.
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTES: DASHBOARDS (Visões Distintas)
// ==========================================
const DiretorDashboard = () => {
  const username = localStorage.getItem('medmetrics_username') || 'Diretor';
  
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="p-8 bg-degase-light min-h-screen">
      <div className="flex justify-between items-center border-b border-slate-300 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-degase-navy">Painel de Controle do Diretor</h1>
          <p className="text-sm text-slate-500">Bem-vindo, {username} | Módulo de Gestão de Usuários</p>
        </div>
        <button onClick={handleLogout} className="bg-slate-200 hover:bg-slate-300 text-degase-navy text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
          Sair do Sistema
        </button>
      </div>
      <div className="mt-6 p-6 bg-white rounded-xl shadow-card border border-slate-200">
        <p className="text-slate-600 font-medium">Lógica do CRUD do PostgreSQL (Sequelize) será injetada aqui.</p>
      </div>
    </div>
  );
};

const TecnicoDashboard = () => {
  const username = localStorage.getItem('medmetrics_username') || 'Técnico';

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="p-8 bg-degase-light min-h-screen">
      <div className="flex justify-between items-center border-b border-slate-300 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-degase-blue">Painel Operacional de Saúde</h1>
          <p className="text-sm text-slate-500">Bem-vindo, {username} | Lançamentos de Indicadores Clínicos</p>
        </div>
        <button onClick={handleLogout} className="bg-slate-200 hover:bg-slate-300 text-degase-navy text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
          Sair do Sistema
        </button>
      </div>
      <div className="mt-6 p-6 bg-white rounded-xl shadow-card border border-slate-200">
        <p className="text-slate-600 font-medium">Lógica de Métricas do MongoDB (Mongoose) será injetada aqui.</p>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE: GUARDA DE ROTAS (Segurança/SOLID)
// ==========================================
const GuardedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('medmetrics_token');
  const userRole = localStorage.getItem('medmetrics_role');

  if (!token) return <Navigate to="/login" replace />;
  
  // CORRIGIDO: Comparando com CAIXA ALTA de acordo com o User.js
  if (roleRequired && userRole !== roleRequired.toUpperCase()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ==========================================
// ORQUESTRADOR CENTRAL DE ROTAS
// ==========================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        
        {/* CORRIGIDO: Usando 'DIRETOR' e 'TECNICO' correspondentes ao ENUM */}
        <Route path="/diretor/*" element = {
          <GuardedRoute roleRequired="DIRETOR">
            <DiretorDashboard />
          </GuardedRoute>
        } />
        
        <Route path="/tecnico/*" element = {
          <GuardedRoute roleRequired="TECNICO">
            <TecnicoDashboard />
          </GuardedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;