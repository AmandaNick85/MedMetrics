import { Router } from 'express';
import AnalyticsController from '../controllers/AnalyticsController.js';
// import { verificarJWT } from '../middlewares/authMiddleware.js'; // Importe seu middleware se houver

const router = Router();

// Adicione o middleware se as rotas precisarem de autenticação instantânea: router.use(verificarJWT);

// Rotas de Atendimentos
router.post('/atendimentos', AnalyticsController.criarAtendimento);
router.get('/atendimentos', AnalyticsController.listarAtendimentos);
router.put('/atendimentos/:id', AnalyticsController.atualizarAtendimento);
router.delete('/atendimentos/:id', AnalyticsController.deletarAtendimento);

// Rotas de Painel/Analytics
router.post('/analytics', AnalyticsController.criarAnalytics);
router.get('/analytics', AnalyticsController.listarAnalytics);
router.delete('/analytics/:id', AnalyticsController.deletarAnalytics);

// Rotas de Relatórios
router.post('/relatorios', AnalyticsController.criarRelatorio);
router.get('/relatorios', AnalyticsController.listarRelatorios);
router.put('/relatorios/:id', AnalyticsController.atualizarRelatorio);
router.delete('/relatorios/:id', AnalyticsController.deletarRelatorio);

export default router;