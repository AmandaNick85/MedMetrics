import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  tecnicoId: {
    type: String, // ID que vem do Postgres (auth-service) como UUID string
    required: [true, 'O ID do técnico é obrigatório.'],
    index: true 
  },
  tecnicoNome: {
    type: String,
    required: [true, 'O nome do técnico é obrigatório.']
  },
  tipoAtendimentoPredominante: {
    type: String,
    required: [true, 'O tipo de atendimento é obrigatório.'],
    enum: ['ACOLHIMENTO', 'VISITA_VIRTUAL', 'RELATORIO', 'SAUDE_MENTAL', 'OUTRO']
  },
  adolescentesAtendidosNoMes: {
    type: Number,
    required: [true, 'A quantidade de adolescentes atendidos é obrigatória.']
  },
  statusPainel: {
    type: String,
    required: true,
    enum: ['ATUALIZADO', 'PROCESSANDO'],
    default: 'ATUALIZADO'
  }
}, {
  timestamps: true // Cria automaticamente createdAt e updatedAt
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;