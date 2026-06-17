import app from './app.js';
import MongoConnection from './infrastructure/database/mongodb/MongoConnection.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/medmetrics';

async function connectMongo() {
  try {
    const mongoose = MongoConnection.getInstance();
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGO_URI);
    console.log('🍃 Ligação ao MongoDB estabelecida com sucesso para análise de dados!');

    // Inicia o Express para ouvir requisições do Frontend
    app.listen(PORT, () => {
      console.log(`🚀 Analytics-Service ativo e a escutar na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Falha crítica ao ligar ao MongoDB:', error);
    process.exit(1); // Encerra o processo caso a base de dados não suba
  }
}

connectMongo();