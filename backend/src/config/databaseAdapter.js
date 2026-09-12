import Database from 'better-sqlite3';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isPostgres = false;
let pgPool = null;

if (process.env.DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 1500
    });
  } catch (err) {
    console.warn('[DB] PostgreSQL indisponível. Utilizando fallback local SQLite.');
  }
}

const sqlitePath = path.resolve(__dirname, '../../homemed.sqlite');
const sqliteDb = new Database(sqlitePath);
sqliteDb.pragma('journal_mode = WAL');
sqliteDb.pragma('foreign_keys = ON');

function initSchema() {
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      nome TEXT NOT NULL,
      telefone TEXT,
      tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('paciente', 'profissional', 'admin')),
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pacientes (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      cpf TEXT UNIQUE NOT NULL,
      foto_url TEXT
    );

    CREATE TABLE IF NOT EXISTS profissionais (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      registro_profissional TEXT NOT NULL,
      especialidade_principal TEXT NOT NULL,
      bio TEXT,
      preco_base DECIMAL(10,2) NOT NULL,
      unidade_cobranca TEXT DEFAULT 'hora',
      nota_media REAL DEFAULT 0.0,
      verificado INTEGER DEFAULT 0,
      disponivel_hoje INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS enderecos (
      id TEXT PRIMARY KEY,
      paciente_id TEXT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
      logradouro TEXT NOT NULL,
      numero TEXT NOT NULL,
      complemento TEXT,
      bairro TEXT NOT NULL,
      cidade TEXT NOT NULL,
      uf TEXT NOT NULL,
      cep TEXT NOT NULL,
      padrao INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS conversas (
      id TEXT PRIMARY KEY,
      paciente_id TEXT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
      profissional_id TEXT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
      ultima_mensagem_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mensagens (
      id TEXT PRIMARY KEY,
      conversa_id TEXT NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
      remetente_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      conteudo TEXT NOT NULL,
      tipo_mensagem TEXT DEFAULT 'texto',
      metadados_servico TEXT,
      anexo_url TEXT,
      lida INTEGER DEFAULT 0,
      enviado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS agendamentos (
      id TEXT PRIMARY KEY,
      paciente_id TEXT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
      profissional_id TEXT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
      endereco_id TEXT REFERENCES enderecos(id) ON DELETE SET NULL,
      data_hora_visita DATETIME NOT NULL,
      valor_total DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'concluido', 'cancelado'))
    );

    CREATE TABLE IF NOT EXISTS avaliacoes (
      id TEXT PRIMARY KEY,
      agendamento_id TEXT NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
      nota INTEGER CHECK (nota >= 1 AND nota <= 5),
      comentario TEXT
    );
  `);

  seedInitialData();
}

async function seedInitialData() {
  const count = sqliteDb.prepare('SELECT COUNT(*) as total FROM usuarios').get();
  if (count && count.total > 0) return;

  console.log('[DB] Povoando banco com dados de demonstração do HomeMed...');
  const senhaHash = await bcrypt.hash('123456', 10);

  // 1. Paciente Padrão (Ricardo Santos)
  const uPacId = crypto.randomUUID();
  const pacId = crypto.randomUUID();
  sqliteDb.prepare(`
    INSERT INTO usuarios (id, email, senha_hash, nome, telefone, tipo_usuario)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(uPacId, 'ricardo.santos@email.com', senhaHash, 'Ricardo Santos', '(11) 98765-4321', 'paciente');

  sqliteDb.prepare(`
    INSERT INTO pacientes (id, usuario_id, cpf, foto_url)
    VALUES (?, ?, ?, ?)
  `).run(pacId, uPacId, '123.456.789-00', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200');

  const endId = crypto.randomUUID();
  sqliteDb.prepare(`
    INSERT INTO enderecos (id, paciente_id, logradouro, numero, complemento, bairro, cidade, uf, cep, padrao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(endId, pacId, 'Rua das Flores', '123', 'Apto 45', 'Bela Vista', 'São Paulo', 'SP', '01310-100', 1);

  // 2. Profissionais Especialistas
  const proList = [
    {
      nome: 'Dra. Juliana Silva',
      email: 'juliana.silva@homemed.com',
      telefone: '(11) 99876-1122',
      registro: 'CREFITO-3/12345-F',
      especialidade: 'Fisioterapia Neurológica e Motora',
      bio: 'Especialista em reabilitação motora com mais de 10 anos de experiência em atendimento domiciliar. Foco no conforto e na evolução constante do paciente.',
      preco: 180.00,
      unidade: 'sessão',
      nota: 4.9,
      verificado: 1,
      disponivel: 1,
      foto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=500'
    },
    {
      nome: 'Carlos Mendes',
      email: 'carlos.mendes@homemed.com',
      telefone: '(11) 99123-3344',
      registro: 'COREN-SP 45678',
      especialidade: 'Enfermeiro Padrão',
      bio: 'Cuidados pós-operatórios, administração de medicamentos, curativos especiais e acompanhamento contínuo.',
      preco: 150.00,
      unidade: 'turno',
      nota: 4.8,
      verificado: 1,
      disponivel: 0,
      foto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=200'
    },
    {
      nome: 'Marta Oliveira',
      email: 'marta.oliveira@homemed.com',
      telefone: '(11) 99555-6677',
      registro: 'CBO 5162-10',
      especialidade: 'Cuidadora de Idosos',
      bio: 'Acompanhamento hospitalar e domiciliar, auxílio na mobilidade e preparo de refeições restritas com carinho e responsabilidade.',
      preco: 90.00,
      unidade: 'hora',
      nota: 5.0,
      verificado: 1,
      disponivel: 1,
      foto: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=300&h=200'
    },
    {
      nome: 'Dr. Ricardo Almeida',
      email: 'ricardo.almeida@homemed.com',
      telefone: '(11) 98888-9900',
      registro: 'CRM-SP 98765',
      especialidade: 'Médico Clínico Geral',
      bio: 'Consultas domiciliares para avaliação geral, prescrição de receitas, check-up preventivo e orientação de saúde familiar.',
      preco: 250.00,
      unidade: 'consulta',
      nota: 4.7,
      verificado: 1,
      disponivel: 0,
      foto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=200'
    }
  ];

  const createdPros = [];
  for (const pro of proList) {
    const uProId = crypto.randomUUID();
    const pId = crypto.randomUUID();

    sqliteDb.prepare(`
      INSERT INTO usuarios (id, email, senha_hash, nome, telefone, tipo_usuario)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uProId, pro.email, senhaHash, pro.nome, pro.telefone, 'profissional');

    sqliteDb.prepare(`
      INSERT INTO profissionais (id, usuario_id, registro_profissional, especialidade_principal, bio, preco_base, unidade_cobranca, nota_media, verificado, disponivel_hoje)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(pId, uProId, pro.registro, pro.especialidade, pro.bio, pro.preco, pro.unidade, pro.nota, pro.verificado, pro.disponivel);

    createdPros.push({ uProId, pId, ...pro });
  }

  // 3. Conversa entre Paciente e Dra. Juliana Silva
  const draJuliana = createdPros[0];
  const convId = crypto.randomUUID();
  sqliteDb.prepare(`
    INSERT INTO conversas (id, paciente_id, profissional_id, ultima_mensagem_em)
    VALUES (?, ?, ?, ?)
  `).run(convId, pacId, draJuliana.pId, new Date().toISOString());

  // Mensagens
  sqliteDb.prepare(`
    INSERT INTO mensagens (id, conversa_id, remetente_id, conteudo, tipo_mensagem, metadados_servico, lida, enviado_em)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    convId,
    uPacId,
    'Olá, Dra. Juliana! Gostaria de agendar uma sessão de fisioterapia motora domiciliar para amanhã à tarde.',
    'texto',
    null,
    1,
    new Date(Date.now() - 3600000).toISOString()
  );

  const propostaJson = JSON.stringify({
    servico: 'Sessão de Fisioterapia Motora',
    duracao: '60 minutos',
    valor: 180.00,
    endereco: 'Rua das Flores, 123 - Apto 45'
  });

  sqliteDb.prepare(`
    INSERT INTO mensagens (id, conversa_id, remetente_id, conteudo, tipo_mensagem, metadados_servico, lida, enviado_em)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    convId,
    draJuliana.uProId,
    'Olá! Recebi seu pedido. Segue a proposta de visita domiciliar com valor tabelado:',
    'proposta',
    propostaJson,
    1,
    new Date().toISOString()
  );

  // 4. Agendamentos
  const agendConfirmadoId = crypto.randomUUID();
  const dataAmanha = new Date();
  dataAmanha.setDate(dataAmanha.getDate() + 1);
  dataAmanha.setHours(14, 30, 0, 0);

  sqliteDb.prepare(`
    INSERT INTO agendamentos (id, paciente_id, profissional_id, endereco_id, data_hora_visita, valor_total, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(agendConfirmadoId, pacId, draJuliana.pId, endId, dataAmanha.toISOString(), 180.00, 'confirmado');

  const marta = createdPros[2];
  const agendConcluido1 = crypto.randomUUID();
  sqliteDb.prepare(`
    INSERT INTO agendamentos (id, paciente_id, profissional_id, endereco_id, data_hora_visita, valor_total, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(agendConcluido1, pacId, marta.pId, endId, '2026-10-15T08:00:00.000Z', 220.00, 'concluido');

  const drRicardo = createdPros[3];
  const agendConcluido2 = crypto.randomUUID();
  sqliteDb.prepare(`
    INSERT INTO agendamentos (id, paciente_id, profissional_id, endereco_id, data_hora_visita, valor_total, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(agendConcluido2, pacId, drRicardo.pId, endId, '2026-10-12T10:00:00.000Z', 250.00, 'concluido');

  sqliteDb.prepare(`
    INSERT INTO avaliacoes (id, agendamento_id, nota, comentario)
    VALUES (?, ?, ?, ?)
  `).run(crypto.randomUUID(), agendConcluido2, 5, 'Excelente atendimento médico domiciliar, pontual e muito atencioso.');

  console.log('[DB] Dados de demonstração inicial inseridos com sucesso!');
}

initSchema();

export async function query(sql, params = []) {
  if (isPostgres && pgPool) {
    try {
      return await pgPool.query(sql, params);
    } catch (err) {
      console.warn('[DB] Falha no PostgreSQL, utilizando fallback SQLite:', err.message);
    }
  }

  // Mapeia parâmetros numerados ($1, $2, etc.) para os valores correspondentes em ordem
  const reorderedParams = [];
  const sqliteSql = sql.replace(/\$([0-9]+)/g, (match, num) => {
    const idx = parseInt(num, 10) - 1;
    reorderedParams.push(params[idx]);
    return '?';
  });

  const trimmed = sqliteSql.trim().toUpperCase();

  if (trimmed.startsWith('SELECT')) {
    const stmt = sqliteDb.prepare(sqliteSql);
    const rows = stmt.all(...reorderedParams);
    return { rows, rowCount: rows.length };
  } else if (sqliteSql.includes('RETURNING')) {
    const cleanSql = sqliteSql.replace(/RETURNING\s+[a-zA-Z0-9_,\s*]+/i, '');
    const stmt = sqliteDb.prepare(cleanSql);
    const info = stmt.run(...reorderedParams);
    return { rows: [{ id: reorderedParams[0] || info.lastInsertRowid }], rowCount: info.changes };
  } else {
    const stmt = sqliteDb.prepare(sqliteSql);
    const info = stmt.run(...reorderedParams);
    return { rows: [], rowCount: info.changes };
  }
}

export { sqliteDb };
