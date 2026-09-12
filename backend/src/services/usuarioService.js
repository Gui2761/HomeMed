import { pool } from '../config/database.js';
import crypto from 'crypto';

export const usuarioService = {
  async criarUsuario({ email, senha_hash, nome, telefone, tipo_usuario, cpf, registro_profissional, especialidade_principal, bio, preco_base }) {
    const id = crypto.randomUUID();
    const queryUsuario = `
      INSERT INTO usuarios (id, email, senha_hash, nome, telefone, tipo_usuario)
      VALUES ($1, $2, $3, $4, $5, $6);
    `;
    await pool.query(queryUsuario, [id, email, senha_hash, nome, telefone, tipo_usuario]);

    // Se for paciente, cria registro correspondente na tabela pacientes
    if (tipo_usuario === 'paciente') {
      const pacId = crypto.randomUUID();
      const defaultCpf = cpf || `${Math.floor(100+Math.random()*900)}.${Math.floor(100+Math.random()*900)}.${Math.floor(100+Math.random()*900)}-${Math.floor(10+Math.random()*90)}`;
      await pool.query(`
        INSERT INTO pacientes (id, usuario_id, cpf, foto_url)
        VALUES ($1, $2, $3, $4);
      `, [pacId, id, defaultCpf, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200']);
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
        'hora',
        0
      ]);
    }

    return {
      id,
      email,
      nome,
      telefone,
      tipo_usuario
    };
  },

  async buscarPorEmail(email) {
    const query = `SELECT * FROM usuarios WHERE email = $1;`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  async listarUsuarios() {
    const query = `SELECT id, email, nome, telefone, tipo_usuario, criado_em FROM usuarios;`;
    const result = await pool.query(query);
    return result.rows;
  }
};