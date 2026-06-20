import mongoose from 'mongoose';

const relatorioSchema = new mongoose.Schema({
  adolescente_id: { type: String, required: true, index: true },
  tipo_relatorio: { type: String, required: true, enum: ['PIA', 'EVOLUTIVO', 'CONCLUSIVO'] },
  conteudo: { type: String, required: true },
  tecnico_responsavel: { type: String, required: true },
  criado_em: { type: Date, default: Date.now }
}, {
  collection: 'relatorios',
  versionKey: false
});

export default mongoose.model('Relatorio', relatorioSchema);