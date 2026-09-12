import { profissionalService } from '../services/profissionalService.js';

export const profissionalController = {
  async listar(req, res) {
    try {
      const { termo, especialidade, localizacao, apenasDisponiveis } = req.query;
      const profissionais = await profissionalService.listar({
        termo,
        especialidade,
        localizacao,
        apenasDisponiveis: apenasDisponiveis === 'true'
      });
      return res.status(200).json(profissionais);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar profissionais.' });
    }
  },

  async destaque(req, res) {
    try {
      const destaque = await profissionalService.obterDestaque();
      return res.status(200).json(destaque);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar profissional em destaque.' });
    }
  },

  async obter(req, res) {
    try {
      const { id } = req.params;
      const profissional = await profissionalService.obterPorId(id);
      if (!profissional) {
        return res.status(404).json({ error: 'Profissional não encontrado.' });
      }
      return res.status(200).json(profissional);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao obter dados do profissional.' });
    }
  }
};
