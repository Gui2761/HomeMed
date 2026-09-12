import { agendamentoService } from '../services/agendamentoService.js';

export const agendamentoController = {
  async listar(req, res) {
    try {
      const usuarioId = req.usuarioId;
      const { status } = req.query;
      const agendamentos = await agendamentoService.listar(usuarioId, status);
      return res.status(200).json(agendamentos);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao listar agendamentos.' });
    }
  },

  async criar(req, res) {
    try {
      const usuarioId = req.usuarioId;
      const { profissional_id, endereco_id, data_hora_visita, valor_total } = req.body;

      if (!profissional_id) {
        return res.status(400).json({ error: 'profissional_id é obrigatório.' });
      }

      const novoAgendamento = await agendamentoService.criar(usuarioId, {
        profissional_id,
        endereco_id,
        data_hora_visita,
        valor_total
      });

      return res.status(201).json({
        message: 'Agendamento domiciliar confirmado com sucesso!',
        agendamento: novoAgendamento
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: err.message || 'Erro ao criar agendamento.' });
    }
  },

  async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório.' });
      }

      const atualizado = await agendamentoService.atualizarStatus(id, status);
      return res.status(200).json({
        message: `Status atualizado para ${status}`,
        agendamento: atualizado
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: err.message || 'Erro ao atualizar status do agendamento.' });
    }
  }
};
