import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Conexão usando a string de conexão que o Docker Compose vai injetar
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Deixa o terminal limpo
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;