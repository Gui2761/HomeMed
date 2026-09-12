import { pool } from '../config/database.js';
import crypto from 'crypto';

export const conversaService = {
  async listarConversas(usuarioId) {
    // Identifica se o usuário é paciente ou profissional
    const resUser = await pool.query('SELECT tipo_usuario FROM usuarios WHERE id = $1', [usuarioId]);
    const tipo = resUser.rows[0]?.tipo_usuario;

    let sql = '';
    let params = [];

    if (tipo === 'profissional') {
      sql = `
        SELECT 
          c.id,
          c.paciente_id,
          c.profissional_id,
          c.ultima_mensagem_em,
          uPac.id as interlocutor_usuario_id,
          uPac.nome as interlocutor_nome,
          pPac.foto_url as interlocutor_foto,
          'Paciente' as interlocutor_especialidade,
          (SELECT conteudo FROM mensagens WHERE conversa_id = c.id ORDER BY enviado_em DESC LIMIT 1) as ultima_mensagem,
          (SELECT enviado_em FROM mensagens WHERE conversa_id = c.id ORDER BY enviado_em DESC LIMIT 1) as ultima_mensagem_data,
          (SELECT COUNT(*) FROM mensagens WHERE conversa_id = c.id AND remetente_id != $1 AND lida = 0) as nao_lidas
        FROM conversas c
        JOIN profissionais pro ON pro.id = c.profissional_id
        JOIN pacientes pPac ON pPac.id = c.paciente_id
        JOIN usuarios uPac ON uPac.id = pPac.usuario_id
        WHERE pro.usuario_id = $1
        ORDER BY c.ultima_mensagem_em DESC
      `;
      params = [usuarioId];
    } else {
      // Padrão: Paciente
      sql = `
        SELECT 
          c.id,
          c.paciente_id,
          c.profissional_id,
          c.ultima_mensagem_em,
          uPro.id as interlocutor_usuario_id,
          uPro.nome as interlocutor_nome,
          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150' as interlocutor_foto,
          pro.especialidade_principal as interlocutor_especialidade,
          pro.preco_base,
          pro.unidade_cobranca,
          pro.nota_media,
          (SELECT conteudo FROM mensagens WHERE conversa_id = c.id ORDER BY enviado_em DESC LIMIT 1) as ultima_mensagem,
          (SELECT enviado_em FROM mensagens WHERE conversa_id = c.id ORDER BY enviado_em DESC LIMIT 1) as ultima_mensagem_data,
          (SELECT COUNT(*) FROM mensagens WHERE conversa_id = c.id AND remetente_id != $1 AND lida = 0) as nao_lidas
        FROM conversas c
        JOIN pacientes pac ON pac.id = c.paciente_id
        JOIN profissionais pro ON pro.id = c.profissional_id
        JOIN usuarios uPro ON uPro.id = pro.usuario_id
        WHERE pac.usuario_id = $1
        ORDER BY c.ultima_mensagem_em DESC
      `;
      params = [usuarioId];
    }

    const result = await pool.query(sql, params);
    return result.rows;
  },

  async obterMensagens(conversaId) {
    const sql = `
      SELECT 
        m.id,
        m.conversa_id,
        m.remetente_id,
        u.nome as remetente_nome,
        m.conteudo,
        m.tipo_mensagem,
        m.metadados_servico,
        m.anexo_url,
        m.lida,
        m.enviado_em
      FROM mensagens m
      JOIN usuarios u ON u.id = m.remetente_id
      WHERE m.conversa_id = $1
      ORDER BY m.enviado_em ASC
    `;
    const result = await pool.query(sql, [conversaId]);
    return result.rows.map(msg => ({
      ...msg,
      metadados_servico: typeof msg.metadados_servico === 'string' && msg.metadados_servico 
        ? JSON.parse(msg.metadados_servico) 
        : msg.metadados_servico
    }));
  },

  async enviarMensagem({ conversaId, remetenteId, conteudo, tipo_mensagem = 'texto', metadados_servico = null }) {
    const id = crypto.randomUUID();
    const metadadosStr = metadados_servico ? (typeof metadados_servico === 'object' ? JSON.stringify(metadados_servico) : metadados_servico) : null;
    const agora = new Date().toISOString();

    const sql = `
      INSERT INTO mensagens (id, conversa_id, remetente_id, conteudo, tipo_mensagem, metadados_servico, lida, enviado_em)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    await pool.query(sql, [id, conversaId, remetenteId, conteudo, tipo_mensagem, metadadosStr, 0, agora]);

    // Atualiza conversa
    await pool.query('UPDATE conversas SET ultima_mensagem_em = $1 WHERE id = $2', [agora, conversaId]);

    return {
      id,
      conversa_id: conversaId,
      remetente_id: remetenteId,
      conteudo,
      tipo_mensagem,
      metadados_servico: metadados_servico,
      lida: 0,
      enviado_em: agora
    };
  },

  async iniciarOuBuscarConversa(usuarioId, profissionalId) {
    // Encontra o paciente_id a partir do usuarioId
    let resPac = await pool.query('SELECT id FROM pacientes WHERE usuario_id = $1', [usuarioId]);
    let pacienteId = resPac.rows[0]?.id;

    if (!pacienteId) {
      pacienteId = crypto.randomUUID();
      await pool.query('INSERT INTO pacientes (id, usuario_id, cpf) VALUES ($1, $2, $3)', [pacienteId, usuarioId, '000.000.000-00']);
    }

    // Verifica se profissionalId é o ID da tabela profissionais ou usuarios
    let pId = profissionalId;
    const checkPro = await pool.query('SELECT id FROM profissionais WHERE id = $1', [profissionalId]);
    if (!checkPro.rows.length) {
      const checkUserPro = await pool.query('SELECT id FROM profissionais WHERE usuario_id = $1', [profissionalId]);
      if (checkUserPro.rows.length) {
        pId = checkUserPro.rows[0].id;
      }
    }

    // Busca se já existe conversa
    const sqlExiste = `
      SELECT id FROM conversas 
      WHERE paciente_id = $1 AND profissional_id = $2
    `;
    const resExiste = await pool.query(sqlExiste, [pacienteId, pId]);
    if (resExiste.rows.length) {
      return resExiste.rows[0];
    }

    // Cria nova conversa
    const novoId = crypto.randomUUID();
    const agora = new Date().toISOString();
    await pool.query(`
      INSERT INTO conversas (id, paciente_id, profissional_id, ultima_mensagem_em)
      VALUES ($1, $2, $3, $4)
    `, [novoId, pacienteId, pId, agora]);

    // Cria mensagem de boas-vindas inicial automática
    await this.enviarMensagem({
      conversaId: novoId,
      remetenteId: usuarioId,
      conteudo: 'Olá! Gostaria de informações sobre atendimento domiciliar.',
      tipo_mensagem: 'texto'
    });

    return { id: novoId, paciente_id: pacienteId, profissional_id: pId };
  }
};
