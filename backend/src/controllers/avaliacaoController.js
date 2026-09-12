import { avaliacaoService } from '../services/avaliacaoService.js';

export const avaliacaoController = {
  async criar(req, res) {
    try {
      const { agendamento_id, nota, comentario } = req.body;
      const avaliacao = await avaliacaoService.criar({ agendamento_id, nota, comentario });
      return res.status(201).json({
        message: 'Avaliação registrada com sucesso!',
        avaliacao
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: err.message || 'Erro ao registrar avaliação.' });
    }
  },

  async listarPorProfissional(req, res) {
    try {
      const { profissionalId } = req.params;
      const avaliacoes = await avaliacaoService.listarPorProfissional(profissionalId);
      return res.status(200).json(avaliacoes);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao listar avaliações.' });
    }
  }
};
