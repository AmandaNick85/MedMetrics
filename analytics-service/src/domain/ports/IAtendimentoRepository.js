/**
 * Port (contrato de saída) — Arquitetura Limpa.
 * O domínio define O QUE precisa; a infraestrutura define COMO implementar.
 * Princípio SOLID: Dependency Inversion (D).
 */
export default class IAtendimentoRepository {
  async salvar(_atendimento) {
    throw new Error('IAtendimentoRepository.salvar() deve ser implementado pela infraestrutura');
  }

  async listarTodos() {
    throw new Error('IAtendimentoRepository.listarTodos() deve ser implementado pela infraestrutura');
  }
}
