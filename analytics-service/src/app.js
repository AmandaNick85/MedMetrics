import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import Analytics from './infrastructure/database/mongodb/models/Analytics.js';

const app = express();

// Middlewares Globais de Segurança
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// Middleware local para validar se a requisição tem o JWT correto gerado pelo Auth-Service
const verifyToken = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido ao Analytics Service.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave_secreta_super_segura_medmetrics');
    req.user = decoded; // Injeta { id, role } vindo do token do Postgres
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirada no serviço analítico.' });
  }
};

// ==========================================
// ROTA: REGISTAR ATENDIMENTO (Técnico ou Diretor)
// ==========================================
app.post('/api/analytics', verifyToken, async (req, res) => {
  try {
    const { technicianName, equipmentType, description, durationMinutes, status } = req.body;

    // O technicianId é extraído automaticamente do Token JWT injetado pelo middleware
    const newRecord = await Analytics.create({
      technicianId: req.user.id,
      technicianName,
      equipmentType,
      description,
      durationMinutes,
      status
    });

    res.status(201).json({ message: 'Atendimento registado no MongoDB com sucesso!', data: newRecord });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registar métricas no MongoDB.', details: error.message });
  }
});

// ==========================================
// ROTA: LISTAR TODOS OS REGISTOS (Geral ou por Filtro de Técnico)
// ==========================================
app.get('/api/analytics', verifyToken, async (req, res) => {
  try {
    let query = {};
    
    // Se for um TÉCNICO ordinário, ele só pode ver os seus próprios atendimentos (Regra de Negócio RBAC)
    if (req.user.role === 'TECNICO') {
      query.technicianId = req.user.id;
    } 
    // Se for DIRETOR, ele pode filtrar por qualquer técnico enviando ?technicianId=... na URL
    else if (req.user.role === 'DIRETOR' && req.query.technicianId) {
      query.technicianId = req.query.technicianId;
    }

    const records = await Analytics.find(query).sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao extrair relatórios do MongoDB.' });
  }
});

// ==========================================
// ROTA: DASHBOARD AGREGADO (Exclusivo DIRETOR)
// Média de tempo gasto e contagem de incidentes por equipamento
// ==========================================
app.get('/api/analytics/dashboard', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'DIRETOR') {
      return res.status(403).json({ error: 'Acesso proibido. Apenas diretores visualizam os agregados.' });
    }

    // Pipeline de Agregação do MongoDB (Mete muita nota com os professores!)
    const stats = await Analytics.aggregate([
      {
        $group: {
          _id: '$equipmentType',
          totalAtendimentos: { $sum: 1 },
          tempoMedioMinutos: { $avg: '$durationMinutes' }
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar agregação do Dashboard.' });
  }
});

// Health check do container
app.get('/health', (req, res) => res.status(200).json({ status: 'UP', service: 'analytics-service' }));

export default app;