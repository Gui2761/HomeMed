# 🏥 HomeMed

Plataforma de saúde projetada para conectar **pacientes a profissionais de saúde verificados**, permitindo o agendamento de atendimentos domiciliares.

O sistema utiliza uma arquitetura moderna dividida em camadas (**Frontend, Backend e Banco de Dados**), com autenticação segura e comunicação entre as diferentes partes da aplicação.

---

## 🚀 Tecnologias Utilizadas

### 🎨 Frontend

- **React + Vite**
- **React Router DOM** — navegação baseada em papéis (Paciente/Profissional)
- **CSS puro** — estilização dos componentes
- Integração com a API REST do backend

### ⚙️ Backend

- **Node.js + Express**
- **ES Modules**
- Arquitetura baseada em **MVC/Clean**
- **Routes, Controllers e Services**
- **JWT (JSON Web Tokens)** — autenticação
- **Bcrypt** — criptografia/hash de senhas
- **pg (Node-Postgres)** — conexão com PostgreSQL

### 🗄️ Banco de Dados e Infraestrutura

- **PostgreSQL**
- **Docker**
- **Docker Compose**
- **init.sql** — criação e configuração automática das tabelas

---

## 📁 Estrutura do Projeto

O projeto está organizado em formato de **monorepo**, facilitando o desenvolvimento e a organização das diferentes camadas da aplicação.

```text
app-saude/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   └── ...
│
├── database/
│   └── init.sql
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── ...
│
└── docker-compose.yml
```

### 📌 Principais diretórios

| Diretório | Descrição |
|---|---|
| `backend/` | API, serviços, controladores, rotas e middlewares |
| `database/` | Scripts SQL e configurações do banco |
| `frontend/` | Aplicação React, telas, componentes e integração com a API |
| `docker-compose.yml` | Orquestração do container PostgreSQL |

---

## ⚙️ Pré-requisitos

Antes de executar o projeto, certifique-se de possuir as seguintes ferramentas instaladas:

- **Node.js** — v18 ou superior
- **Docker**
- **Docker Compose**
- **Git**
- **npm**

---

## 🛠️ Como Rodar o Projeto

### 1. 📥 Clone o repositório

```bash
git clone URL_DO_SEU_REPOSITORIO
cd app-saude
```

---

### 2. 🗄️ Subir o Banco de Dados

Na raiz do projeto, execute:

```bash
docker-compose up -d
```

O Docker irá iniciar o container do **PostgreSQL** e executar o script `init.sql` para criação automática do banco e das tabelas.

Para verificar os containers em execução:

```bash
docker ps
```

---

### 3. ⚙️ Configurar o Backend

Abra um terminal e acesse a pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo chamado `.env` dentro da pasta `backend`:

```env
PORT=5000
DATABASE_URL=postgres://postgres:root@localhost:5432/homemed_db
JWT_SECRET=sua_chave_secreta_aqui
```

> ⚠️ **Importante:** não envie o arquivo `.env` para o GitHub. Adicione `.env` ao seu `.gitignore`.

Depois, inicie o servidor:

```bash
npm run dev
```

A API estará disponível em:

```text
http://localhost:5000
```

---

### 4. 🎨 Configurar o Frontend

Abra um **novo terminal** e acesse a pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o projeto:

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:5173
```

---

## 🔐 Autenticação

O HomeMed utiliza mecanismos de segurança para proteger os dados dos usuários.

### JWT

Os usuários autenticados recebem um **JSON Web Token (JWT)** utilizado para validar o acesso às funcionalidades protegidas da aplicação.

### Bcrypt

As senhas dos usuários não são armazenadas diretamente no banco de dados. Elas são protegidas utilizando **Bcrypt** antes de serem armazenadas.

---

## 👥 Tipos de Usuários

O sistema possui diferentes tipos de usuários:

### 👤 Paciente

Pode utilizar a plataforma para:

- Criar uma conta;
- Realizar login;
- Acessar funcionalidades destinadas aos pacientes;
- Buscar/agendar atendimentos domiciliares.

### 👨‍⚕️ Profissional

Pode utilizar a plataforma para:

- Criar uma conta profissional;
- Realizar login;
- Acessar funcionalidades destinadas aos profissionais;
- Gerenciar suas atividades dentro da plataforma.

O sistema utiliza **roteamento condicional** para direcionar cada usuário de acordo com seu papel.

---

## ✅ Funcionalidades Atuais

- [x] Modelagem e criação automática do banco de dados
- [x] Banco de dados com 8 tabelas relacionais
- [x] Estrutura Monorepo
- [x] API REST
- [x] Arquitetura Service / Controller / Routes
- [x] Criptografia de senhas com Bcrypt
- [x] Autenticação utilizando JWT
- [x] Tela de cadastro integrada ao backend
- [x] Cadastro de usuários no banco de dados
- [x] Tela de login integrada à API
- [x] Salvamento do token no `localStorage`
- [x] Roteamento condicional entre Pacientes e Profissionais

---

## 🔄 Arquitetura da Aplicação

A comunicação entre as camadas ocorre de forma organizada:

```text
┌─────────────────────┐
│      Frontend       │
│   React + Vite      │
└──────────┬──────────┘
           │
           │ HTTP / REST API
           ▼
┌─────────────────────┐
│       Backend       │
│ Node.js + Express   │
│                     │
│ Routes              │
│ Controllers         │
│ Services            │
│ Middlewares         │
└──────────┬──────────┘
           │
           │ PostgreSQL
           ▼
┌─────────────────────┐
│      Database       │
│     PostgreSQL      │
│       Docker        │
└─────────────────────┘
```

---

## 📌 Variáveis de Ambiente

As principais variáveis utilizadas pelo backend são:

| Variável | Descrição |
|---|---|
| `PORT` | Porta utilizada pela API |
| `DATABASE_URL` | URL de conexão com o PostgreSQL |
| `JWT_SECRET` | Chave utilizada para geração dos tokens JWT |

---

## 🧪 Desenvolvimento

Para executar o projeto durante o desenvolvimento, mantenha os seguintes serviços ativos:

**Terminal 1 — Banco de Dados**

```bash
docker-compose up -d
```

**Terminal 2 — Backend**

```bash
cd backend
npm run dev
```

**Terminal 3 — Frontend**

```bash
cd frontend
npm run dev
```

---

## 🚧 Próximos Passos

Algumas funcionalidades que podem ser adicionadas ao projeto:

- [ ] Sistema de agendamento de consultas
- [ ] Busca de profissionais
- [ ] Perfil do profissional
- [ ] Perfil do paciente
- [ ] Gerenciamento de disponibilidade
- [ ] Histórico de atendimentos
- [ ] Sistema de avaliações
- [ ] Notificações
- [ ] Recuperação de senha
- [ ] Melhorias na segurança da aplicação
- [ ] Deploy da aplicação

---

## 👨‍💻 Desenvolvimento

Projeto desenvolvido como parte de um projeto acadêmico na área de **Ciência da Computação**, com foco no desenvolvimento de uma plataforma de saúde utilizando tecnologias modernas de desenvolvimento web.

---

## 📄 Licença

Este projeto está em desenvolvimento para fins acadêmicos e educacionais.