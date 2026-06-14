const mongoose = require('mongoose');
const TipoAtendimento = require('../../../domain/enums/tipoAtendimento');

const AtendimentoSchema = new mongoose.Schema({
  tecnicoId: { type: String, required: true, index: true },
  adolescenteId: { type: String, required: true, index: true },
  tipo: { 
    type: String, 
    enum: Object.values(TipoAtendimento), 
    required: true 
  },
  data: { type: Date, required: true, default: Date.now, index: true },
  descricao: { type: String, required: true },
  criadoEm: { type: Date, default: Date.now }
}, {
  versionKey: false
});

module.exports = mongoose.model('Atendimento', AtendimentoSchema);