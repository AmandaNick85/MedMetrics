/**
 * Mock Repository — usado em TDD/BDD para isolar o domínio do MongoDB.
 * Implementa o contrato IAtendimentoRepository em memória.
 */
export default class MockAtendimentoRepository {
  constructor() {
    this.registros = [];
  }

  async salvar(atendimento) {
    this.registros.push(atendimento);
    return atendimento;
  }

  async listarTodos() {
    return [...this.registros];
  }
}
