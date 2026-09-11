import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Configuração da conexão usando variáveis de ambiente
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Teste rápido da conexão
pool.on('connect', () => {
  console.log('Conectado ao banco de dados PostgreSQL com sucesso! 📦');
});