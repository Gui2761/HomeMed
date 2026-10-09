import { pool } from '../config/database.js';

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
  }
};
