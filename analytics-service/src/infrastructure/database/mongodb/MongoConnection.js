import mongoose from 'mongoose';

/**
 * Singleton Pattern — garante uma única instância de conexão MongoDB
 * por processo do microsserviço, evitando esgotamento de sockets.
 */
class MongoConnection {
  static #instance = null;

  static getInstance() {
    if (!MongoConnection.#instance) {
      MongoConnection.#instance = mongoose;
    }
    return MongoConnection.#instance;
  }
}

export default MongoConnection;
