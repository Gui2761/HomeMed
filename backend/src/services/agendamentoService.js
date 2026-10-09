import { pool } from '../config/database.js';
import crypto from 'crypto';

export const agendamentoService = {
  async listar(usuarioId, statusFiltro) {
    // Identifica se é paciente ou profissional
    const resUser = await pool.query('SELECT tipo_usuario FROM usuarios WHERE id = $1', [usuarioId]);
    const tipo = resUser.rows[0]?.tipo_usuario;

    let sql = `
      SELECT 
        a.id,
        a.paciente_id,
        a.profissional_id,
        a.endereco_id,
        a.data_hora_visita,
        a.valor_total,
        a.status,
        uPro.nome as profissional_nome,
        uPro.email as profissional_email,
        uPro.telefone as profissional_telefone,
        pro.especialidade_principal,
        pro.preco_base,
        pro.unidade_cobranca,
        pro.nota_media,
        uPac.nome as paciente_nome,
        uPac.telefone as paciente_telefone,
        e.logradouro,
        e.numero,
        e.complemento,
        e.bairro,
        e.cidade,
        e.uf,
        e.cep,
        av.id as avaliacao_id,
        av.nota as avaliacao_nota,
        av.comentario as avaliacao_comentario
      FROM agendamentos a
      JOIN profissionais pro ON pro.id = a.profissional_id
      JOIN usuarios uPro ON uPro.id = pro.usuario_id
      JOIN pacientes pac ON pac.id = a.paciente_id
      JOIN usuarios uPac ON uPac.id = pac.usuario_id
      LEFT JOIN enderecos e ON e.id = a.endereco_id
      LEFT JOIN avaliacoes av ON av.agendamento_id = a.id
      WHERE (pac.usuario_id = $1 OR pro.usuario_id = $1)
    `;
    const params = [usuarioId];

    if (statusFiltro && statusFiltro !== 'todas') {
      if (statusFiltro === 'proximas') {
        const ontem = new Date(Date.now() - 86400000).toISOString();
        params.push(ontem);
        sql += ` AND a.status IN ('pendente', 'confirmado') AND a.data_hora_visita >= $${params.length}`;
      } else if (statusFiltro === 'em_andamento') {
        sql += ` AND a.status = 'confirmado'`;
      } else if (statusFiltro === 'concluidas') {
        sql += ` AND a.status = 'concluido'`;
      } else if (statusFiltro === 'canceladas') {
        sql += ` AND a.status = 'cancelado'`;
      } else {
        params.push(statusFiltro);
        sql += ` AND a.status = $${params.length}`;
      }
    }

    sql += ` ORDER BY a.data_hora_visita DESC`;

    const result = await pool.query(sql, params);
    return result.rows;
  },

  async criar(usuarioId, { profissional_id, endereco_id, data_hora_visita, valor_total }) {
    // 1. Encontra paciente_id
    let resPac = await pool.query('SELECT id FROM pacientes WHERE usuario_id = $1', [usuarioId]);
    let pacId = resPac.rows[0]?.id;

    if (!pacId) {
      pacId = crypto.randomUUID();
      await pool.query('INSERT INTO pacientes (id, usuario_id, cpf) VALUES ($1, $2, $3)', [pacId, usuarioId, '000.000.000-00']);
    }

    // 2. Valida RN01: Endereço é obrigatório para atendimento domiciliar
    let endId = endereco_id;
    if (!endId) {
      const resEnd = await pool.query('SELECT id FROM enderecos WHERE paciente_id = $1 ORDER BY padrao DESC LIMIT 1', [pacId]);
      endId = resEnd.rows[0]?.id;
    }

    if (!endId) {
      throw new Error('RN01: É obrigatório cadastrar um endereço residencial no perfil antes de agendar uma visita domiciliar.');
    }

    // 3. Normaliza profissional_id
    let proId = profissional_id;
    const checkPro = await pool.query('SELECT id, preco_base FROM profissionais WHERE id = $1', [profissional_id]);
    let preco = checkPro.rows[0]?.preco_base || 180.00;

    if (!checkPro.rows.length) {
      const checkUserPro = await pool.query('SELECT id, preco_base FROM profissionais WHERE usuario_id = $1', [profissional_id]);
      if (checkUserPro.rows.length) {
        proId = checkUserPro.rows[0].id;
        preco = checkUserPro.rows[0].preco_base;
      }
    }

    const id = crypto.randomUUID();
    const dataVisita = data_hora_visita || new Date(Date.now() + 86400000).toISOString();
    const total = valor_total || preco;

    const sql = `
      INSERT INTO agendamentos (id, paciente_id, profissional_id, endereco_id, data_hora_visita, valor_total, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await pool.query(sql, [id, pacId, proId, endId, dataVisita, total, 'confirmado']);

    return {
      id,
      paciente_id: pacId,
      profissional_id: proId,
      endereco_id: endId,
      data_hora_visita: dataVisita,
      valor_total: total,
      status: 'confirmado'
    };
  },

  async atualizarStatus(id, status) {
    const validos = ['pendente', 'confirmado', 'concluido', 'cancelado'];
    if (!validos.includes(status)) {
      throw new Error('Status inválido.');
    }

    await pool.query('UPDATE agendamentos SET status = $1 WHERE id = $2', [status, id]);
    return { id, status };
  }
};
