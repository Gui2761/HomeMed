import { pool } from '../config/database.js';
import crypto from 'crypto';

export const usuarioService = {
  async criarUsuario({ email, senha_hash, nome, telefone, tipo_usuario, cpf, registro_profissional, especialidade_principal, bio, preco_base, unidade_cobranca, endereco }) {
    const id = crypto.randomUUID();
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const queryUsuario = `
      INSERT INTO usuarios (id, email, senha_hash, nome, telefone, tipo_usuario)
      VALUES ($1, $2, $3, $4, $5, $6);
    `;
    await pool.query(queryUsuario, [id, cleanEmail, senha_hash, nome, telefone, tipo_usuario]);

    // Se for paciente, cria registro correspondente na tabela pacientes
    if (tipo_usuario === 'paciente') {
      const pacId = crypto.randomUUID();
      const defaultCpf = cpf || `${Math.floor(100+Math.random()*900)}.${Math.floor(100+Math.random()*900)}.${Math.floor(100+Math.random()*900)}-${Math.floor(10+Math.random()*90)}`;
      await pool.query(`
        INSERT INTO pacientes (id, usuario_id, cpf, foto_url)
        VALUES ($1, $2, $3, $4);
      `, [pacId, id, defaultCpf, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200']);

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
      tipo_usuario
    };
  },

  async buscarPorEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const withoutCom = cleanEmail.replace(/\.com$/, '');
    const withCom = cleanEmail.endsWith('.com') ? cleanEmail : `${cleanEmail}.com`;

    const query = `
      SELECT * FROM usuarios 
      WHERE LOWER(TRIM(email)) = $1 
         OR LOWER(TRIM(email)) = $2 
         OR LOWER(TRIM(email)) = $3
      LIMIT 1;
    `;
    const result = await pool.query(query, [cleanEmail, withoutCom, withCom]);
    return result.rows[0];
  },

  async listarUsuarios() {
    const query = `SELECT id, email, nome, telefone, tipo_usuario, criado_em FROM usuarios;`;
    const result = await pool.query(query);
    return result.rows;
  }
};