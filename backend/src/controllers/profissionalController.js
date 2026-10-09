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
      return res.status(500).json({ error: 'Erro ao buscar profissionais.', details: err.message });
    }
  },

  async destaque(req, res) {
    try {
      const destaque = await profissionalService.obterDestaque();
      return res.status(200).json(destaque || null);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar profissional em destaque.', details: err.message });
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
      return res.status(500).json({ error: 'Erro ao obter dados do profissional.', details: err.message });
    }
  },

  async obterMeuPerfil(req, res) {
    try {
      const usuarioId = req.usuarioId;
      const profissional = await profissionalService.obterPorId(usuarioId);
      return res.status(200).json(profissional || {});
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao obter perfil do profissional.', details: err.message });
    }
  },

  async salvarCredenciamento(req, res) {
    try {
      const usuarioId = req.usuarioId;
      const dados = req.body;
      const profissional = await profissionalService.salvarCredenciamento(usuarioId, dados);
      return res.status(200).json({ message: 'Credenciamento atualizado com sucesso!', profissional });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao salvar credenciamento.', details: err.message });
    }
  },

  async alternarVerificacao(req, res) {
    try {
      const { id } = req.params;
      const { verificado } = req.body;
      const atualizado = await profissionalService.alternarVerificacao(id, verificado);
      return res.status(200).json({ message: 'Status de verificação atualizado com sucesso!', profissional: atualizado });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao atualizar verificação do profissional.', details: err.message });
    }
  }
};
