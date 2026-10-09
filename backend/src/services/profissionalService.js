import { pool } from '../config/database.js';
import crypto from 'crypto';

export const profissionalService = {
  async listar({ termo, especialidade, localizacao, apenasDisponiveis }) {
    let sql = `
      SELECT 
        p.id,
        p.usuario_id,
        u.nome,
        u.email,
        u.telefone,
        p.registro_profissional,
        p.especialidade_principal,
        p.bio,
        p.preco_base,
        p.unidade_cobranca,
        p.nota_media,
        p.verificado,
        p.disponivel_hoje
      FROM profissionais p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE 1=1
    `;
    const params = [];

    if (termo) {
      params.push(`%${termo}%`);
      sql += ` AND (u.nome LIKE $${params.length} OR p.especialidade_principal LIKE $${params.length} OR p.bio LIKE $${params.length})`;
    }

    if (especialidade && especialidade !== 'Todas Especialidades') {
      params.push(`%${especialidade}%`);
      sql += ` AND p.especialidade_principal LIKE $${params.length}`;
    }

    if (apenasDisponiveis) {
      sql += ` AND (p.disponivel_hoje = true OR p.disponivel_hoje = 1)`;
    }

    sql += ` ORDER BY p.nota_media DESC, p.verificado DESC`;

    const result = await pool.query(sql, params);
    return result.rows;
  },

  async obterDestaque() {
    const sql = `
      SELECT 
        p.id,
        p.usuario_id,
        u.nome,
        u.email,
        u.telefone,
        p.registro_profissional,
        p.especialidade_principal,
        p.bio,
        p.preco_base,
        p.unidade_cobranca,
        p.nota_media,
        p.verificado,
        p.disponivel_hoje
      FROM profissionais p
      JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.nota_media DESC, p.preco_base DESC
      LIMIT 1
    `;
    const result = await pool.query(sql);
    return result.rows[0];
  },

  async obterPorId(id) {
    const sql = `
      SELECT 
        p.id,
        p.usuario_id,
        u.nome,
        u.email,
        u.telefone,
        p.registro_profissional,
        p.especialidade_principal,
        p.bio,
        p.preco_base,
        p.unidade_cobranca,
        p.nota_media,
        p.verificado,
        p.disponivel_hoje
      FROM profissionais p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.id = $1 OR p.usuario_id = $1
    `;
    const result = await pool.query(sql, [id]);
    return result.rows[0];
  },

  async salvarCredenciamento(usuarioId, { registro_profissional, especialidade_principal, bio, preco_base, unidade_cobranca, disponivel_hoje }) {
    const check = await pool.query('SELECT id FROM profissionais WHERE usuario_id = $1', [usuarioId]);
    if (check.rows.length > 0) {
      const proId = check.rows[0].id;
      const sql = `
        UPDATE profissionais
        SET registro_profissional = COALESCE($1, registro_profissional),
            especialidade_principal = COALESCE($2, especialidade_principal),
            bio = COALESCE($3, bio),
            preco_base = COALESCE($4, preco_base),
            unidade_cobranca = COALESCE($5, unidade_cobranca),
            disponivel_hoje = COALESCE($6, disponivel_hoje)
        WHERE id = $7
      `;
      await pool.query(sql, [
        registro_profissional,
        especialidade_principal,
        bio,
        preco_base ? parseFloat(preco_base) : null,
        unidade_cobranca,
        disponivel_hoje !== undefined ? Boolean(disponivel_hoje) : null,
        proId
      ]);
      return this.obterPorId(proId);
    } else {
      const proId = crypto.randomUUID();
      const sql = `
        INSERT INTO profissionais (id, usuario_id, registro_profissional, especialidade_principal, bio, preco_base, unidade_cobranca, disponivel_hoje, verificado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
      `;
      await pool.query(sql, [
        proId,
        usuarioId,
        registro_profissional || 'REG-PENDENTE',
        especialidade_principal || 'Clínico Geral',
        bio || '',
        preco_base ? parseFloat(preco_base) : 150.00,
        unidade_cobranca || 'hora',
        Boolean(disponivel_hoje)
      ]);
      await pool.query('UPDATE usuarios SET tipo_usuario = $1 WHERE id = $2', ['profissional', usuarioId]);
      return this.obterPorId(proId);
    }
  },

  async alternarVerificacao(proId, verificado) {
    const sql = `UPDATE profissionais SET verificado = $1 WHERE id = $2 RETURNING *`;
    const result = await pool.query(sql, [Boolean(verificado), proId]);
    return result.rows[0];
  }
};
