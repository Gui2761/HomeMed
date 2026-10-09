import { pool } from '../config/database.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const usuarioService = {
  async criarUsuario({ email, senha_hash, nome, telefone, tipo_usuario, foto_url, cpf, registro_profissional, especialidade_principal, bio, preco_base, unidade_cobranca, endereco }) {
    const id = crypto.randomUUID();
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const fotoPadrao = foto_url || (tipo_usuario === 'profissional' 
      ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300' 
      : tipo_usuario === 'admin'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300'
      : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300');

    const queryUsuario = `
      INSERT INTO usuarios (id, email, senha_hash, nome, telefone, tipo_usuario, foto_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;
    await pool.query(queryUsuario, [id, cleanEmail, senha_hash, nome, telefone, tipo_usuario, fotoPadrao]);

    // Se for paciente, cria registro correspondente na tabela pacientes
    if (tipo_usuario === 'paciente') {
      const pacId = crypto.randomUUID();
      const defaultCpf = cpf || `${Math.floor(100+Math.random()*900)}.${Math.floor(100+Math.random()*900)}.${Math.floor(100+Math.random()*900)}-${Math.floor(10+Math.random()*90)}`;
      await pool.query(`
        INSERT INTO pacientes (id, usuario_id, cpf, foto_url)
        VALUES ($1, $2, $3, $4);
      `, [pacId, id, defaultCpf, fotoPadrao]);

      // Se endereço foi informado no cadastro, salva na tabela de endereços
      if (endereco && endereco.logradouro && endereco.cep) {
        const endId = crypto.randomUUID();
        await pool.query(`
          INSERT INTO enderecos (id, paciente_id, logradouro, numero, complemento, bairro, cidade, uf, cep, padrao)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true);
        `, [
          endId, 
          pacId, 
          endereco.logradouro, 
          endereco.numero || 'S/N', 
          endereco.complemento || '', 
          endereco.bairro || '', 
          endereco.cidade || '', 
          endereco.uf || 'SP', 
          endereco.cep
        ]);
      }
    }

    // Se for profissional, cria registro na tabela profissionais
    if (tipo_usuario === 'profissional') {
      const proId = crypto.randomUUID();
      await pool.query(`
        INSERT INTO profissionais (id, usuario_id, registro_profissional, especialidade_principal, bio, preco_base, unidade_cobranca, verificado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `, [
        proId,
        id,
        registro_profissional || 'REG-PENDENTE',
        especialidade_principal || 'Clínico Geral',
        bio || 'Profissional de saúde dedicado ao atendimento humanizado.',
        preco_base || 150.00,
        unidade_cobranca || 'consulta',
        false
      ]);
    }

    return {
      id,
      email: cleanEmail,
      nome,
      telefone,
      tipo_usuario,
      foto_url: fotoPadrao
    };
  },

  async buscarPorEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const withoutCom = cleanEmail.replace(/\.com$/, '');
    const withCom = cleanEmail.endsWith('.com') ? cleanEmail : `${cleanEmail}.com`;

    const query = `
      SELECT id, email, senha_hash, nome, telefone, tipo_usuario, foto_url, criado_em 
      FROM usuarios 
      WHERE LOWER(TRIM(email)) = $1 
         OR LOWER(TRIM(email)) = $2 
         OR LOWER(TRIM(email)) = $3
      LIMIT 1;
    `;
    const result = await pool.query(query, [cleanEmail, withoutCom, withCom]);
    return result.rows[0];
  },

  async buscarPorId(id) {
    if (!id) return null;
    const query = `
      SELECT id, email, nome, telefone, tipo_usuario, foto_url, criado_em 
      FROM usuarios 
      WHERE id = $1 
      LIMIT 1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async atualizarUsuario(id, { nome, telefone, email, foto_url }) {
    const usuarioAtual = await this.buscarPorId(id);
    if (!usuarioAtual) return null;

    const novoNome = nome !== undefined ? nome : usuarioAtual.nome;
    const novoTelefone = telefone !== undefined ? telefone : usuarioAtual.telefone;
    const novoEmail = email !== undefined ? email.trim().toLowerCase() : usuarioAtual.email;
    const novaFoto = foto_url !== undefined ? foto_url : usuarioAtual.foto_url;

    const sql = `
      UPDATE usuarios 
      SET nome = $1, 
          telefone = $2, 
          email = $3, 
          foto_url = $4
      WHERE id = $5
    `;
    await pool.query(sql, [novoNome, novoTelefone, novoEmail, novaFoto, id]);

    // Sincroniza foto_url na tabela de pacientes se existir
    if (novaFoto) {
      try {
        await pool.query('UPDATE pacientes SET foto_url = $1 WHERE usuario_id = $2', [novaFoto, id]);
      } catch (e) {
        // Ignora caso não seja paciente
      }
    }

    return this.buscarPorId(id);
  },

  async listarUsuarios() {
    const query = `SELECT id, email, nome, telefone, tipo_usuario, foto_url, criado_em FROM usuarios;`;
    const result = await pool.query(query);
    return result.rows;
  },

  async garantirPerfisPadrao() {
    const perfis = [
      {
        email: 'paciente@homemed.com',
        senha_plana: 'senha123',
        nome: 'Ana Clara Ribeiro',
        telefone: '(11) 98765-1001',
        tipo_usuario: 'paciente',
        foto_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300',
        cpf: '123.456.789-01',
        endereco: {
          logradouro: 'Av. Paulista',
          numero: '1000',
          complemento: 'Apto 102',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          uf: 'SP',
          cep: '01310-100'
        }
      },
      {
        email: 'medico@homemed.com',
        senha_plana: 'senha123',
        nome: 'Dr. Gabriel Silva Mendes',
        telefone: '(11) 98765-2002',
        tipo_usuario: 'profissional',
        foto_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300',
        registro_profissional: 'CRM-SP 189420',
        especialidade_principal: 'Clínico Geral & Geriatria Domiciliar',
        preco_base: 180.00,
        unidade_cobranca: 'consulta',
        bio: 'Médico clínico e geriatra com foco em cuidados domiciliares humanizados e suporte contínuo para idosos.',
        verificado: true,
        disponivel_hoje: true
      },
      {
        email: 'admin@homemed.com',
        senha_plana: 'senha123',
        nome: 'Administrador HomeMed',
        telefone: '(11) 98765-3003',
        tipo_usuario: 'admin',
        foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300'
      }
    ];

    const resultados = [];
    for (const p of perfis) {
      const existe = await this.buscarPorEmail(p.email);
      if (!existe) {
        const senha_hash = bcrypt.hashSync(p.senha_plana, 10);
        const novo = await this.criarUsuario({
          email: p.email,
          senha_hash,
          nome: p.nome,
          telefone: p.telefone,
          tipo_usuario: p.tipo_usuario,
          foto_url: p.foto_url,
          cpf: p.cpf,
          registro_profissional: p.registro_profissional,
          especialidade_principal: p.especialidade_principal,
          preco_base: p.preco_base,
          unidade_cobranca: p.unidade_cobranca,
          bio: p.bio,
          endereco: p.endereco
        });

        if (p.tipo_usuario === 'profissional') {
          await pool.query('UPDATE profissionais SET verificado = true, disponivel_hoje = true WHERE usuario_id = $1', [novo.id]);
        }
        resultados.push({ email: p.email, tipo: p.tipo_usuario, status: 'criado' });
      } else {
        const senha_hash = bcrypt.hashSync(p.senha_plana, 10);
        await pool.query(`
          UPDATE usuarios 
          SET senha_hash = $1, 
              nome = $2, 
              telefone = $3,
              foto_url = COALESCE(foto_url, $4)
          WHERE id = $5
        `, [senha_hash, p.nome, p.telefone, p.foto_url, existe.id]);

        if (p.tipo_usuario === 'profissional') {
          await pool.query(`
            UPDATE profissionais 
            SET verificado = true, disponivel_hoje = true, registro_profissional = $1, especialidade_principal = $2, preco_base = $3
            WHERE usuario_id = $4
          `, [p.registro_profissional, p.especialidade_principal, p.preco_base, existe.id]);
        }
        resultados.push({ email: p.email, tipo: p.tipo_usuario, status: 'sincronizado' });
      }
    }
    return resultados;
  }
};