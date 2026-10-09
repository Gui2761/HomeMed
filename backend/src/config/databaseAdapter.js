import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isPostgres = false;
let pgPool = null;
let sqliteDb = null;
let dbInitialized = false;

// 1. Obtém Pool do PostgreSQL dinamicamente
export function getPgPool() {
  if (pgPool) return pgPool;

  const connStr = 
    process.env.POSTGRES_URL || 
    process.env.DATABASE_URL || 
    process.env.POSTGRES_URL_NON_POOLING || 
    process.env.POSTGRES_PRISMA_URL;

  if (connStr) {
    const isLocal = connStr.includes('localhost') || connStr.includes('127.0.0.1');
    if (process.env.VERCEL && isLocal) {
      console.warn('[DB] DATABASE_URL aponta para localhost dentro da Vercel. Aguardando conexão do Vercel Postgres/Neon.');
      return null;
    }

    try {
      pgPool = new Pool({
        connectionString: connStr,
        ssl: isLocal ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 6000
      });
      isPostgres = true;
      console.log('[DB] PostgreSQL/Neon conectado com sucesso.');
    } catch (err) {
      console.warn('[DB] Erro ao criar pool do PostgreSQL:', err.message);
    }
  }
  return pgPool;
}

// Inicializa pool se possível
getPgPool();

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

// 3. Schema DDL para PostgreSQL
async function initPostgresSchema() {
  const poolInstance = getPgPool();
  if (!poolInstance) return;

  try {
    try {
      await poolInstance.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    } catch (e) {
      // Ignora caso superuser não esteja disponível na nuvem
    }

    const tables = [
      `CREATE TABLE IF NOT EXISTS usuarios (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        telefone VARCHAR(50),
        tipo_usuario VARCHAR(50) NOT NULL CHECK (tipo_usuario IN ('paciente', 'profissional', 'admin')),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS pacientes (
        id UUID PRIMARY KEY,
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        cpf VARCHAR(20) UNIQUE NOT NULL,
        foto_url TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS profissionais (
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
      )`,
      `CREATE TABLE IF NOT EXISTS enderecos (
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
      )`,
      `CREATE TABLE IF NOT EXISTS conversas (
        id UUID PRIMARY KEY,
        paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
        profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
        ultima_mensagem_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS mensagens (
        id UUID PRIMARY KEY,
        conversa_id UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
        remetente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        conteudo TEXT NOT NULL,
        tipo_mensagem VARCHAR(50) DEFAULT 'texto',
        metadados_servico JSONB,
        anexo_url TEXT,
        lida BOOLEAN DEFAULT FALSE,
        enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS agendamentos (
        id UUID PRIMARY KEY,
        paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
        profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
        endereco_id UUID REFERENCES enderecos(id) ON DELETE SET NULL,
        data_hora_visita TIMESTAMP NOT NULL,
        valor_total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'concluido', 'cancelado'))
      )`,
      `CREATE TABLE IF NOT EXISTS avaliacoes (
        id UUID PRIMARY KEY,
        agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
        nota INTEGER CHECK (nota >= 1 AND nota <= 5),
        comentario TEXT
      )`
    ];

    for (const ddl of tables) {
      await poolInstance.query(ddl);
    }

    console.log('[DB-PG] Schema do PostgreSQL verificado com sucesso.');
    dbInitialized = true;
  } catch (err) {
    console.error('[DB-PG] Erro ao inicializar schema do PostgreSQL:', err.message);
    throw err;
  }
}

// 4. Schema DDL para SQLite Local
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

  console.log('[DB-SQLite] Schema local SQLite verificado com sucesso.');
}

// Inicialização sob demanda ou na carga
export async function ensureDbInitialized() {
  if (dbInitialized) return;
  const poolInstance = getPgPool();
  if (poolInstance) {
    await initPostgresSchema();
  }
}

// Dispara inicialização em background
ensureDbInitialized().catch(err => console.warn('[DB] Init background aviso:', err.message));

export async function query(sql, params = []) {
  const poolInstance = getPgPool();
  if (poolInstance) {
    try {
      await ensureDbInitialized();
      return await poolInstance.query(sql, params);
    } catch (err) {
      console.warn('[DB] Falha na consulta PostgreSQL:', err.message);
      if (!sqliteDb) {
        throw err;
      }
    }
  }

  if (!sqliteDb) {
    throw new Error('Nenhum banco de dados configurado no ambiente de nuvem. Conecte o Vercel Postgres/Neon no dashboard.');
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
