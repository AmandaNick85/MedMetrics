import AtendimentoModel from './models/AtendimentoModel.js';
import AnalyticsModel from './models/Analytics.js';
import RelatorioModel from './models/RelatorioModel.js';

/** Implementação concreta do port IAtendimentoRepository (Repository Pattern). */
export default class AtendimentoRepository {
  
  // ==========================================
  // 1. CRUD: ATENDIMENTOS
  // ==========================================
  async salvar(atendimentoEntidade) {
    const novoDocumento = new AtendimentoModel({
      adolescente_id: atendimentoEntidade.adolescente_id,
      equipe: atendimentoEntidade.equipe,
      tipo: atendimentoEntidade.tipo,
      descricao: atendimentoEntidade.descricao,
      tecnico_responsavel: atendimentoEntidade.tecnico_responsavel,
      criado_em: atendimentoEntidade.criado_em || new Date()
    });
    return await novoDocumento.save();
  }

  async listarTodos() {
    return await AtendimentoModel.find().sort({ criado_em: -1 });
  }

  async buscarAtendimentoPorId(id) {
    return await AtendimentoModel.findById(id);
  }

  async atualizarAtendimento(id, dados) {
    return await AtendimentoModel.findByIdAndUpdate(id, dados, { new: true });
  }

  async deletarAtendimento(id) {
    return await AtendimentoModel.findByIdAndDelete(id);
  }

  // ==========================================
  // 2. CRUD: ANALYTICS (Métricas/Painel)
  // ==========================================
  async salvarAnalytics(dadosAnalytics) {
    return await AnalyticsModel.create(dadosAnalytics);
  }

  async listarAnalytics() {
    return await AnalyticsModel.find().sort({ createdAt: -1 });
  }

  async atualizarAnalytics(id, dados) {
    return await AnalyticsModel.findByIdAndUpdate(id, dados, { new: true });
  }

  async deletarAnalytics(id) {
    return await AnalyticsModel.findByIdAndDelete(id);
  }

  // ==========================================
  // 3. CRUD: RELATÓRIOS
  // ==========================================
  async salvarRelatorio(dadosRelatorio) {
    return await RelatorioModel.create(dadosRelatorio);
  }

  async listarRelatorios() {
    return await RelatorioModel.find().sort({ criado_em: -1 });
  }

  async buscarRelatorioPorId(id) {
    return await RelatorioModel.findById(id);
  }

  async atualizarRelatorio(id, dados) {
    return await RelatorioModel.findByIdAndUpdate(id, dados, { new: true });
  }

  async deletarRelatorio(id) {
    return await RelatorioModel.findByIdAndDelete(id);
  }
}