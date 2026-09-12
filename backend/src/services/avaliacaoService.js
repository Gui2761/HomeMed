import { pool } from '../config/database.js';
import crypto from 'crypto';

export const avaliacaoService = {
  async criar({ agendamento_id, nota, comentario }) {
    if (!agendamento_id || !nota) {
      throw new Error('agendamento_id e nota (1 a 5) são obrigatórios.');
    }

    const notaInt = parseInt(nota, 10);
    if (notaInt < 1 || notaInt > 5) {
      throw new Error('A nota deve ser entre 1 e 5 estrelas.');
    }

    const id = crypto.randomUUID();
    const sql = `
      INSERT INTO avaliacoes (id, agendamento_id, nota, comentario)
      VALUES ($1, $2, $3, $4)
    `;
    await pool.query(sql, [id, agendamento_id, notaInt, comentario || '']);

    // Recalcula nota média do profissional
    const resPro = await pool.query('SELECT profissional_id FROM agendamentos WHERE id = $1', [agendamento_id]);
    const proId = resPro.rows[0]?.profissional_id;

    if (proId) {
      const sqlMedia = `
        SELECT AVG(av.nota) as media 
        FROM avaliacoes av
        JOIN agendamentos ag ON ag.id = av.agendamento_id
        WHERE ag.profissional_id = $1
      `;
      const resMedia = await pool.query(sqlMedia, [proId]);
      const novaMedia = parseFloat(resMedia.rows[0]?.media || notaInt).toFixed(2);

      await pool.query('UPDATE profissionais SET nota_media = $1 WHERE id = $2', [novaMedia, proId]);
    }

    return { id, agendamento_id, nota: notaInt, comentario };
  },

  async listarPorProfissional(profissionalId) {
    const sql = `
      SELECT 
        av.id,
        av.nota,
        av.comentario,
        uPac.nome as paciente_nome,
        ag.data_hora_visita
      FROM avaliacoes av
      JOIN agendamentos ag ON ag.id = av.agendamento_id
      JOIN pacientes pac ON pac.id = ag.paciente_id
      JOIN usuarios uPac ON uPac.id = pac.usuario_id
      WHERE ag.profissional_id = $1
      ORDER BY ag.data_hora_visita DESC
    `;
    const result = await pool.query(sql, [profissionalId]);
    return result.rows;
  }
};
