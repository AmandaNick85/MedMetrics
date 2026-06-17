import AtendimentoModel from './models/AtendimentoModel.js';

/** Implementação concreta do port IAtendimentoRepository (Repository Pattern). */
export default class AtendimentoRepository {
  async salvar(atendimentoEntidade) {
    // Transforma a entidade limpa de domínio em um documento persistido no MongoDB
    const novoDocumento = new AtendimentoModel({
      adolescente_id: atendimentoEntidade.adolescente_id,
      equipe: atendimentoEntidade.equipe,
      tipo: atendimentoEntidade.tipo,
      descricao: atendimentoEntidade.descricao,
      tecnico_responsavel: atendimentoEntidade.tecnico_responsavel,
      criado_em: atendimentoEntidade.criado_em
    });

    return await novoDocumento.save();
  }

  async listarTodos() {
    return await AtendimentoModel.find().sort({ criado_em: -1 });
  }
}