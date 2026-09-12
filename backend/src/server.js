import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/database.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import profissionalRoutes from './routes/profissionalRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';
import conversaRoutes from './routes/conversaRoutes.js';
import agendamentoRoutes from './routes/agendamentoRoutes.js';
import avaliacaoRoutes from './routes/avaliacaoRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Rota de status da API
app.get('/api/status', (req, res) => {
  res.json({ message: 'API do HomeMed rodando com sucesso via ES Modules! 🚀' });
});

// Rota de teste para checar o banco de dados
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query("SELECT datetime('now') as now");
    res.json({ message: 'Banco de dados conectado!', time: result.rows[0]?.now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao conectar com o banco de dados' });
  }
});

// Registrando todas as rotas da API
app.use('/api', usuarioRoutes);
app.use('/api', profissionalRoutes);
app.use('/api', pacienteRoutes);
app.use('/api', conversaRoutes);
app.use('/api', agendamentoRoutes);
app.use('/api', avaliacaoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});