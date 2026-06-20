import AtendimentoRepository from '../database/mongodb/AtendimentoRepository.js';

class AnalyticsController {
  // ==========================================
  // ENDPOINTS: ATENDIMENTOS
  // ==========================================
  async criarAtendimento(req, res) {
    try {
      const novo = await AtendimentoRepository.salvar(req.body);
      return res.status(201).json(novo);
    } catch (error) {
      return res.status(400).json({ erro: 'Erro ao criar atendimento', detalhes: error.message });
    }
  }

  async listarAtendimentos(req, res) {
    try {
      const lista = await AtendimentoRepository.listarTodos();
      return res.json(lista);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao listar atendimentos', detalhes: error.message });
    }
  }

  async atualizarAtendimento(req, res) {
    try {
      const atualizado = await AtendimentoRepository.atualizarAtendimento(req.params.id, req.body);
      if (!atualizado) return res.status(404).json({ erro: 'Atendimento não encontrado' });
      return res.json(atualizado);
    } catch (error) {
      return res.status(400).json({ erro: 'Erro ao atualizar atendimento', detalhes: error.message });
    }
  }

  async deletarAtendimento(req, res) {
    try {
      const deletado = await AtendimentoRepository.deletarAtendimento(req.params.id);
      if (!deletado) return res.status(404).json({ erro: 'Atendimento não encontrado' });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao deletar atendimento', detalhes: error.message });
    }
  }

  // ==========================================
  // ENDPOINTS: ANALYTICS
  // ==========================================
  async criarAnalytics(req, res) {
    try {
      const novo = await AtendimentoRepository.salvarAnalytics(req.body);
      return res.status(201).json(novo);
    } catch (error) {
      return res.status(400).json({ erro: 'Erro ao salvar dados de analytics', detalhes: error.message });
    }
  }

  async listarAnalytics(req, res) {
    try {
      const lista = await AtendimentoRepository.listarAnalytics();
      return res.json(lista);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao listar analytics', detalhes: error.message });
    }
  }

  async deletarAnalytics(req, res) {
    try {
      await AtendimentoRepository.deletarAnalytics(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao deletar registro de analytics' });
    }
  }

  // ==========================================
  // ENDPOINTS: RELATÓRIOS
  // ==========================================
  async criarRelatorio(req, res) {
    try {
      const novo = await AtendimentoRepository.salvarRelatorio(req.body);
      return res.status(201).json(novo);
    } catch (error) {
      return res.status(400).json({ erro: 'Erro ao criar relatório', detalhes: error.message });
    }
  }

  async listarRelatorios(req, res) {
    try {
      const lista = await AtendimentoRepository.listarRelatorios();
      return res.json(lista);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao listar relatórios' });
    }
  }

  async atualizarRelatorio(req, res) {
    try {
      const atualizado = await AtendimentoRepository.atualizarRelatorio(req.params.id, req.body);
      return res.json(atualizado);
    } catch (error) {
      return res.status(400).json({ erro: 'Erro ao atualizar relatório' });
    }
  }

  async deletarRelatorio(req, res) {
    try {
      await AtendimentoRepository.deletarRelatorio(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao deletar relatório' });
    }
  }
}

export default new AnalyticsController();