import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/database.js';
import { ensureDbInitialized, isPostgres } from './config/databaseAdapter.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import profissionalRoutes from './routes/profissionalRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';
import conversaRoutes from './routes/conversaRoutes.js';
import agendamentoRoutes from './routes/agendamentoRoutes.js';
import avaliacaoRoutes from './routes/avaliacaoRoutes.js';

dotenv.config();

const app = express();

// Configuração flexível de CORS para suportar Vercel e localhost
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

// Rota de status da API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'API do HomeMed operacional! 🚀',
    database_mode: isPostgres ? 'PostgreSQL (Cloud/Vercel/Neon)' : 'SQLite (Local)'
  });
});

// Rota de teste e verificação de banco de dados
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT CURRENT_TIMESTAMP as now');
    res.json({
      message: 'Banco de dados conectado com sucesso!',
      mode: isPostgres ? 'PostgreSQL' : 'SQLite',
      time: result.rows[0]?.now
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao conectar com o banco de dados', details: err.message });
  }
});

// Rota de inicialização/seed do banco sob demanda
app.post('/api/init-db', async (req, res) => {
  try {
    await ensureDbInitialized();
    res.json({ message: 'Banco de dados sincronizado e inicializado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao sincronizar banco de dados', details: err.message });
  }
});

// Registrando todas as rotas da API
app.use('/api', usuarioRoutes);
app.use('/api', profissionalRoutes);
app.use('/api', pacienteRoutes);
app.use('/api', conversaRoutes);
app.use('/api', agendamentoRoutes);
app.use('/api', avaliacaoRoutes);

// Em ambiente tradicional (local), escuta na porta especificada. No Vercel Serverless, o Vercel gerencia o ciclo HTTP.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[HomeMed] Servidor rodando na porta ${PORT}`);
  });
}

export default app;
export { app };