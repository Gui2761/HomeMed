-- Extensão para UUIDs (caso queira usar UUID nas chaves primárias)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários (Base para autenticação de Pacientes, Profissionais e Admins)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(50),
    tipo_usuario VARCHAR(50) NOT NULL CHECK (tipo_usuario IN ('paciente', 'profissional', 'admin')),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pacientes (Extensão de usuario)
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cpf VARCHAR(20) UNIQUE NOT NULL,
    foto_url TEXT
);

-- Tabela de Profissionais (Extensão de usuario)
CREATE TABLE IF NOT EXISTS profissionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    registro_profissional VARCHAR(50) NOT NULL, -- CRM, COREN, CREFITO, etc.
    especialidade_principal VARCHAR(100) NOT NULL,
    bio TEXT,
    preco_base DECIMAL(10,2) NOT NULL,
    unidade_cobranca VARCHAR(50) DEFAULT 'hora', -- hora, turno, consulta
    nota_media NUMERIC(3,2) DEFAULT 0.0,
    verificado BOOLEAN DEFAULT FALSE,
    disponivel_hoje BOOLEAN DEFAULT FALSE
);

-- Tabela de Endereços (Para atendimento domiciliar)
CREATE TABLE IF NOT EXISTS enderecos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Tabela de Conversas (Chat)
CREATE TABLE IF NOT EXISTS conversas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    ultima_mensagem_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS mensagens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversa_id UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
    remetente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    tipo_mensagem VARCHAR(50) DEFAULT 'texto', -- texto, proposta, anexo
    metadados_servico JSONB, -- Detalhes da proposta de visita (valor, endereço, etc.)
    anexo_url TEXT,
    lida BOOLEAN DEFAULT FALSE,
    enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Agendamentos / Visitas Domiciliares
CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    endereco_id UUID NOT NULL REFERENCES enderecos(id) ON DELETE CASCADE,
    data_hora_visita TIMESTAMP NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'concluido', 'cancelado'))
);

-- Tabela de Avaliações pós-atendimento
CREATE TABLE IF NOT EXISTS avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    nota INTEGER CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT
);