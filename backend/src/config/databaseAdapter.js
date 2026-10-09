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
let sqliteDb = null;
let dbInitialized = false;

// 1. Detecta configuração de PostgreSQL (Vercel Postgres / Neon / Supabase / Local)
const connStr = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (connStr) {
  const isLocal = connStr.includes('localhost') || connStr.includes('127.0.0.1');
  try {
    pgPool = new Pool({
      connectionString: connStr,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    isPostgres = true;
    console.log('[DB] PostgreSQL detectado. Modo de produção ativado.');
  } catch (err) {
    console.warn('[DB] Erro ao criar pool do PostgreSQL:', err.message);
  }
}

// 2. Se não estiver em ambiente Vercel serverless restrito, inicializa SQLite para desenvolvimento local offline
if (!process.env.VERCEL) {
  try {
    const Database = (await import('better-sqlite3')).default;
    const sqlitePath = path.resolve(__dirname, '../../homemed.sqlite');
    sqliteDb = new Database(sqlitePath);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');
    initSqliteSchema();
    console.log('[DB] SQLite local ativo em:', sqlitePath);
  } catch (err) {
    console.warn('[DB] Fallback SQLite não disponível:', err.message);
  }
}

// 3. Schema & Seed para PostgreSQL
async function initPostgresSchema() {
  if (!pgPool) return;
  try {
    // Tenta habilitar extensão uuid-ossp se disponível (opcional)
    try {
      await pgPool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    } catch (e) {
      // Ignora se não tiver permissão de superusuário na cloud
    }

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        telefone VARCHAR(50),
        tipo_usuario VARCHAR(50) NOT NULL CHECK (tipo_usuario IN ('paciente', 'profissional', 'admin')),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pacientes (
        id UUID PRIMARY KEY,
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        cpf VARCHAR(20) UNIQUE NOT NULL,
        foto_url TEXT
      );

      CREATE TABLE IF NOT EXISTS profissionais (
        id UUID PRIMARY KEY,
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        registro_profissional VARCHAR(50) NOT NULL,
        especialidade_principal VARCHAR(100) NOT NULL,
        bio TEXT,
        preco_base DECIMAL(10,2) NOT NULL,
        unidade_cobranca VARCHAR(50) DEFAULT 'hora',
        nota_media NUMERIC(3,2) DEFAULT 0.0,
        verificado BOOLEAN DEFAULT FALSE,
        disponivel_hoje BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS enderecos (
        id UUID PRIMARY KEY,
        paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
        logradouro VARCHAR(255) NOT NULL,
        numero VARCHAR(50) NOT NULL,
        complemento VARCHAR(100),
        bairro VARCHAR(100) NOT NULL,
        cidade VARCHAR(100) NOT NULL,
        uf VARCHAR(2) NOT NULL,
        cep VARCHAR(20) NOT NULL,
        padrao BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS conversas (
        id UUID PRIMARY KEY,
        paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
        profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
        ultima_mensagem_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS mensagens (
        id UUID PRIMARY KEY,
        conversa_id UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
        remetente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        conteudo TEXT NOT NULL,
        tipo_mensagem VARCHAR(50) DEFAULT 'texto',
        metadados_servico JSONB,
        anexo_url TEXT,
        lida BOOLEAN DEFAULT FALSE,
        enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agendamentos (
        id UUID PRIMARY KEY,
        paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
        profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
        endereco_id UUID REFERENCES enderecos(id) ON DELETE SET NULL,
        data_hora_visita TIMESTAMP NOT NULL,
        valor_total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'concluido', 'cancelado'))
      );

      CREATE TABLE IF NOT EXISTS avaliacoes (
        id UUID PRIMARY KEY,
        agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
        nota INTEGER CHECK (nota >= 1 AND nota <= 5),
        comentario TEXT
      );
    `);

    // Verifica se precisa de dados de demonstração
    const checkUsers = await pgPool.query('SELECT COUNT(*) as total FROM usuarios');
    const totalUsers = parseInt(checkUsers.rows[0]?.total || 0, 10);

    if (totalUsers === 0) {
      console.log('[DB-PG] Inserindo dados iniciais de demonstração no PostgreSQL...');
      const senhaHash = await bcrypt.hash('123456', 10);

      // 1. Paciente Ricardo Santos
      const uPacId = crypto.randomUUID();
      const pacId = crypto.randomUUID();
      await pgPool.query(
        'INSERT INTO usuarios (id, email, senha_hash, nome, telefone, tipo_usuario) VALUES ($1, $2, $3, $4, $5, $6)',
        [uPacId, 'ricardo.santos@email.com', senhaHash, 'Ricardo Santos', '(11) 98765-4321', 'paciente']
      );

      await pgPool.query(
        'INSERT INTO pacientes (id, usuario_id, cpf, foto_url) VALUES ($1, $2, $3, $4)',
        [pacId, uPacId, '123.456.789-00', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200']
      );

      const endId = crypto.randomUUID();
      await pgPool.query(
        'INSERT INTO enderecos (id, paciente_id, logradouro, numero, complemento, bairro, cidade, uf, cep, padrao) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [endId, pacId, 'Rua das Flores', '123', 'Apto 45', 'Bela Vista', 'São Paulo', 'SP', '01310-100', true]
      );

      // 2. Profissionais
      const proList = [
        {
          nome: 'Dra. Juliana Silva',
          email: 'juliana.silva@homemed.com',
          telefone: '(11) 99876-1122',
          registro: 'CREFITO-3/12345-F',
          especialidade: 'Fisioterapia Neurológica e Motora',
          bio: 'Especialista em reabilitação motora com mais de 10 anos de experiência em atendimento domiciliar.',
          preco: 180.00,
          unidade: 'sessão',
          nota: 4.9,
          verificado: true,
          disponivel: true,
          foto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=500'
        },
        {
          nome: 'Carlos Mendes',
          email: 'carlos.mendes@homemed.com',
          telefone: '(11) 99123-3344',
          registro: 'COREN-SP 45678',
          especialidade: 'Enfermeiro Padrão',
          bio: 'Cuidados pós-operatórios, administração de medicamentos e curativos especiais.',
          preco: 150.00,
          unidade: 'turno',
          nota: 4.8,
          verificado: true,
          disponivel: false,
          foto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=200'
        },
        {
          nome: 'Marta Oliveira',
          email: 'marta.oliveira@homemed.com',
          telefone: '(11) 99555-6677',
          registro: 'CBO 5162-10',
          especialidade: 'Cuidadora de Idosos',
          bio: 'Acompanhamento domiciliar, auxílio na mobilidade e refeições restritas.',
          preco: 90.00,
          unidade: 'hora',
          nota: 5.0,
          verificado: true,
          disponivel: true,
          foto: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=300&h=200'
        },
        {
          nome: 'Dr. Ricardo Almeida',
          email: 'ricardo.almeida@homemed.com',
          telefone: '(11) 98888-9900',
          registro: 'CRM-SP 98765',
          especialidade: 'Médico Clínico Geral',
          bio: 'Consultas domiciliares para avaliação geral, check-up e orientação médica familiar.',
          preco: 250.00,
          unidade: 'consulta',
          nota: 4.7,
          verificado: true,
          disponivel: false,
          foto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=200'
        }
      ];

      const createdPros = [];
      for (const pro of proList) {
        const uProId = crypto.randomUUID();
        const pId = crypto.randomUUID();

        await pgPool.query(
          'INSERT INTO usuarios (id, email, senha_hash, nome, telefone, tipo_usuario) VALUES ($1, $2, $3, $4, $5, $6)',
          [uProId, pro.email, senhaHash, pro.nome, pro.telefone, 'profissional']
        );

        await pgPool.query(
          'INSERT INTO profissionais (id, usuario_id, registro_profissional, especialidade_principal, bio, preco_base, unidade_cobranca, nota_media, verificado, disponivel_hoje) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
          [pId, uProId, pro.registro, pro.especialidade, pro.bio, pro.preco, pro.unidade, pro.nota, pro.verificado, pro.disponivel]
        );

        createdPros.push({ uProId, pId, ...pro });
      }

      // 3. Conversa de Exemplo
      const draJuliana = createdPros[0];
      const convId = crypto.randomUUID();
      await pgPool.query(
        'INSERT INTO conversas (id, paciente_id, profissional_id, ultima_mensagem_em) VALUES ($1, $2, $3, $4)',
        [convId, pacId, draJuliana.pId, new Date().toISOString()]
      );

      await pgPool.query(
        'INSERT INTO mensagens (id, conversa_id, remetente_id, conteudo, tipo_mensagem, lida, enviado_em) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [crypto.randomUUID(), convId, uPacId, 'Olá, Dra. Juliana! Gostaria de agendar uma sessão domiciliar.', 'texto', true, new Date(Date.now() - 3600000).toISOString()]
      );

      // 4. Agendamento
      const agendId = crypto.randomUUID();
      const dataAmanha = new Date();
      dataAmanha.setDate(dataAmanha.getDate() + 1);
      dataAmanha.setHours(14, 30, 0, 0);

      await pgPool.query(
        'INSERT INTO agendamentos (id, paciente_id, profissional_id, endereco_id, data_hora_visita, valor_total, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [agendId, pacId, draJuliana.pId, endId, dataAmanha.toISOString(), 180.00, 'confirmado']
      );

      console.log('[DB-PG] Dados iniciais do PostgreSQL inseridos com sucesso!');
    }
  } catch (err) {
    console.error('[DB-PG] Erro ao inicializar schema do PostgreSQL:', err.message);
  }
}

// 4. Schema & Seed para SQLite Local
function initSqliteSchema() {
  if (!sqliteDb) return;
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

  seedSqliteInitialData();
}

async function seedSqliteInitialData() {
  if (!sqliteDb) return;
  const count = sqliteDb.prepare('SELECT COUNT(*) as total FROM usuarios').get();
  if (count && count.total > 0) return;

  console.log('[DB-SQLite] Povoando banco local com dados de demonstração...');
  const senhaHash = await bcrypt.hash('123456', 10);

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

  const proList = [
    {
      nome: 'Dra. Juliana Silva',
      email: 'juliana.silva@homemed.com',
      telefone: '(11) 99876-1122',
      registro: 'CREFITO-3/12345-F',
      especialidade: 'Fisioterapia Neurológica e Motora',
      bio: 'Especialista em reabilitação motora com mais de 10 anos de experiência em atendimento domiciliar.',
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
      bio: 'Cuidados pós-operatórios, administração de medicamentos e curativos.',
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
      bio: 'Acompanhamento domiciliar, auxílio na mobilidade e refeições restritas.',
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
      bio: 'Consultas domiciliares para avaliação geral e check-up preventivo.',
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

  const draJuliana = createdPros[0];
  const convId = crypto.randomUUID();
  sqliteDb.prepare(`
    INSERT INTO conversas (id, paciente_id, profissional_id, ultima_mensagem_em)
    VALUES (?, ?, ?, ?)
  `).run(convId, pacId, draJuliana.pId, new Date().toISOString());

  sqliteDb.prepare(`
    INSERT INTO mensagens (id, conversa_id, remetente_id, conteudo, tipo_mensagem, lida, enviado_em)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    convId,
    uPacId,
    'Olá, Dra. Juliana! Gostaria de agendar uma sessão de fisioterapia motora domiciliar para amanhã à tarde.',
    'texto',
    1,
    new Date(Date.now() - 3600000).toISOString()
  );

  const agendConfirmadoId = crypto.randomUUID();
  const dataAmanha = new Date();
  dataAmanha.setDate(dataAmanha.getDate() + 1);
  dataAmanha.setHours(14, 30, 0, 0);

  sqliteDb.prepare(`
    INSERT INTO agendamentos (id, paciente_id, profissional_id, endereco_id, data_hora_visita, valor_total, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(agendConfirmadoId, pacId, draJuliana.pId, endId, dataAmanha.toISOString(), 180.00, 'confirmado');

  console.log('[DB-SQLite] Dados de demonstração inicial inseridos com sucesso!');
}

// Inicialização sob demanda ou na carga
export async function ensureDbInitialized() {
  if (dbInitialized) return;
  if (isPostgres && pgPool) {
    await initPostgresSchema();
  }
  dbInitialized = true;
}

// Dispara inicialização em background
ensureDbInitialized().catch(err => console.warn('[DB] Init background aviso:', err.message));

export async function query(sql, params = []) {
  if (isPostgres && pgPool) {
    try {
      await ensureDbInitialized();
      return await pgPool.query(sql, params);
    } catch (err) {
      console.warn('[DB] Falha na consulta PostgreSQL:', err.message);
      if (!sqliteDb) {
        throw err;
      }
    }
  }

  if (!sqliteDb) {
    throw new Error('Nenhum banco de dados disponível (PostgreSQL desconectado e SQLite não disponível no ambiente).');
  }

  // Mapeia parâmetros numerados ($1, $2, etc.) para '?' no SQLite
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

export { sqliteDb, isPostgres, pgPool };
