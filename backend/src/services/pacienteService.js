import { pool } from '../config/database.js';
import crypto from 'crypto';

export const pacienteService = {
  async obterPerfil(usuarioId) {
    const sql = `
      SELECT 
        u.id as usuario_id,
        u.nome,
        u.email,
        u.telefone,
        u.tipo_usuario,
        p.id as paciente_id,
        p.cpf,
        p.foto_url
      FROM usuarios u
      LEFT JOIN pacientes p ON p.usuario_id = u.id
      WHERE u.id = $1
    `;
    const resUser = await pool.query(sql, [usuarioId]);
    if (!resUser.rows.length) return null;
    const paciente = resUser.rows[0];

    // Busca endereço padrão
    let endereco = null;
    if (paciente.paciente_id) {
      const sqlEnd = `
        SELECT * FROM enderecos 
        WHERE paciente_id = $1 
        ORDER BY padrao DESC LIMIT 1
      `;
      const resEnd = await pool.query(sqlEnd, [paciente.paciente_id]);
      endereco = resEnd.rows[0] || null;
    }

    // Busca estatísticas de consultas
    let stats = { realizadas: 0, proximas: 0, favoritos: 3 };
    if (paciente.paciente_id) {
      const sqlRealizadas = `
        SELECT COUNT(*) as total FROM agendamentos 
        WHERE paciente_id = $1 AND status = 'concluido'
      `;
      const resRealizadas = await pool.query(sqlRealizadas, [paciente.paciente_id]);
      stats.realizadas = parseInt(resRealizadas.rows[0]?.total || 0, 10);

      const sqlProximas = `
        SELECT COUNT(*) as total FROM agendamentos 
        WHERE paciente_id = $1 AND status IN ('pendente', 'confirmado')
      `;
      const resProximas = await pool.query(sqlProximas, [paciente.paciente_id]);
      stats.proximas = parseInt(resProximas.rows[0]?.total || 0, 10);
    }

    return {
      ...paciente,
      endereco,
      estatisticas: stats
    };
  },

  async atualizarPerfil(usuarioId, { nome, telefone, email }) {
    const sql = `
      UPDATE usuarios 
      SET nome = COALESCE($1, nome), 
          telefone = COALESCE($2, telefone), 
          email = COALESCE($3, email)
      WHERE id = $4
    `;
    await pool.query(sql, [nome, telefone, email, usuarioId]);
    return this.obterPerfil(usuarioId);
  },

  async salvarEndereco(usuarioId, { logradouro, numero, complemento, bairro, cidade, uf, cep, padrao = 1 }) {
    // Garante paciente_id
    let resPac = await pool.query('SELECT id FROM pacientes WHERE usuario_id = $1', [usuarioId]);
    let pacId = resPac.rows[0]?.id;

    if (!pacId) {
      pacId = crypto.randomUUID();
      await pool.query('INSERT INTO pacientes (id, usuario_id, cpf) VALUES ($1, $2, $3)', [pacId, usuarioId, '000.000.000-00']);
    }

    // Se marcado como padrão, desmarca outros
    if (padrao) {
      await pool.query('UPDATE enderecos SET padrao = 0 WHERE paciente_id = $1', [pacId]);
    }

    // Verifica se já tem endereço
    const resExiste = await pool.query('SELECT id FROM enderecos WHERE paciente_id = $1 LIMIT 1', [pacId]);
    if (resExiste.rows.length) {
      const endId = resExiste.rows[0].id;
      await pool.query(`
        UPDATE enderecos 
        SET logradouro = $1, numero = $2, complemento = $3, bairro = $4, cidade = $5, uf = $6, cep = $7, padrao = $8
        WHERE id = $9
      `, [logradouro, numero, complemento, bairro, cidade, uf, cep, padrao ? 1 : 0, endId]);
      return { id: endId, logradouro, numero, complemento, bairro, cidade, uf, cep, padrao };
    } else {
      const endId = crypto.randomUUID();
      await pool.query(`
        INSERT INTO enderecos (id, paciente_id, logradouro, numero, complemento, bairro, cidade, uf, cep, padrao)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [endId, pacId, logradouro, numero, complemento, bairro, cidade, uf, cep, padrao ? 1 : 0]);
      return { id: endId, logradouro, numero, complemento, bairro, cidade, uf, cep, padrao };
    }
  }
};
