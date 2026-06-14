const TipoAtendimento = require('../enums/tipoAtendimento');

class Atendimento {
  constructor({ id, tecnicoId, adolescenteId, tipo, data, descricao, criadoEm }) {
    this.validate({ tecnicoId, adolescenteId, tipo, descricao });

    this.id = id;
    this.tecnicoId = tecnicoId;
    this.adolescenteId = adolescenteId;
    this.tipo = tipo;
    this.data = data ? new Date(data) : new Date();
    this.descricao = descricao;
    this.criadoEm = criadoEm ? new Date(criadoEm) : new Date();
  }

  validate({ tecnicoId, adolescenteId, tipo, descricao }) {
    if (!tecnicoId) throw new Error('O ID do técnico é obrigatório.');
    if (!adolescenteId) throw new Error('O ID do adolescente é obrigatório.');
    
    const tiposValidos = Object.values(TipoAtendimento);
    if (!tipo || !tiposValidos.includes(tipo)) {
      throw new Error('Tipo de atendimento inválido.');
    }
    
    if (!descricao || descricao.trim() === '') {
      throw new Error('A descrição do atendimento não pode ser vazia.');
    }
  }
}

module.exports = Atendimento;