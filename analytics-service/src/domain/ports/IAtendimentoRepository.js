/**
 * Port (contrato de saída) — Arquitetura Limpa.
 * O domínio define O QUE precisa; a infraestrutura define COMO implementar.
 * Princípio SOLID: Dependency Inversion (D).
 */
export default class IAtendimentoRepository {
  // --- Interface do CRUD Atendimentos ---
  async salvar(_atendimento) {
    throw new Error('IAtendimentoRepository.salvar() deve ser implementado pela infraestrutura');
  }

  async listarTodos() {
    throw new Error('IAtendimentoRepository.listarTodos() deve ser implementado pela infraestrutura');
  }

  async buscarAtendimentoPorId(_id) {
    throw new Error('IAtendimentoRepository.buscarAtendimentoPorId() deve ser implementado pela infraestrutura');
  }

  async atualizarAtendimento(_id, _dados) {
    throw new Error('IAtendimentoRepository.atualizarAtendimento() deve ser implementado pela infraestrutura');
  }

  async deletarAtendimento(_id) {
    throw new Error('IAtendimentoRepository.deletarAtendimento() deve ser implementado pela infraestrutura');
  }

  // --- Interface do CRUD Analytics ---
  async salvarAnalytics(_dadosAnalytics) {
    throw new Error('IAtendimentoRepository.salvarAnalytics() deve ser implementado pela infraestrutura');
  }

  async listarAnalytics() {
    throw new Error('IAtendimentoRepository.listarAnalytics() deve ser implementado pela infraestrutura');
  }

  async atualizarAnalytics(_id, _dados) {
    throw new Error('IAtendimentoRepository.atualizarAnalytics() deve ser implementado pela infraestrutura');
  }

  async deletarAnalytics(_id) {
    throw new Error('IAtendimentoRepository.deletarAnalytics() deve ser implementado pela infraestrutura');
  }

  // --- Interface do CRUD Relatórios ---
  async salvarRelatorio(_dadosRelatorio) {
    throw new Error('IAtendimentoRepository.salvarRelatorio() deve ser implementado pela infraestrutura');
  }

  async listarRelatorios() {
    throw new Error('IAtendimentoRepository.listarRelatorios() deve ser implementado pela infraestrutura');
  }

  async buscarRelatorioPorId(_id) {
    throw new Error('IAtendimentoRepository.buscarRelatorioPorId() deve ser implementado pela infraestrutura');
  }

  async atualizarRelatorio(_id, _dados) {
    throw new Error('IAtendimentoRepository.atualizarRelatorio() deve ser implementado pela infraestrutura');
  }

  async deletarRelatorio(_id) {
    throw new Error('IAtendimentoRepository.deletarRelatorio() deve ser implementado pela infraestrutura');
  }
}