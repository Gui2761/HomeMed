import { pacienteService } from '../services/pacienteService.js';

export const pacienteController = {
  async obterPerfil(req, res) {
    try {
      const usuarioId = req.usuarioId;
      const perfil = await pacienteService.obterPerfil(usuarioId);
      if (!perfil) {
        return res.status(404).json({ error: 'Perfil não encontrado.' });
      }
      return res.status(200).json(perfil);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar perfil do paciente.' });
    }
  },

  async atualizarPerfil(req, res) {
    try {
      const usuarioId = req.usuarioId;
      const { nome, telefone, email } = req.body;
      const perfilAtualizado = await pacienteService.atualizarPerfil(usuarioId, { nome, telefone, email });
      return res.status(200).json({
        message: 'Perfil atualizado com sucesso!',
        perfil: perfilAtualizado
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao atualizar perfil do paciente.' });
    }
  },

  async salvarEndereco(req, res) {
    try {
      const usuarioId = req.usuarioId;
      const { logradouro, numero, complemento, bairro, cidade, uf, cep, padrao } = req.body;
      if (!logradouro || !numero || !bairro || !cidade || !uf || !cep) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios do endereço.' });
      }
      const endereco = await pacienteService.salvarEndereco(usuarioId, {
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        cep,
        padrao: padrao !== false
      });
      return res.status(200).json({
        message: 'Endereço salvo com sucesso!',
        endereco
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao salvar endereço.' });
    }
  }
};
