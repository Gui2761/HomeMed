import { conversaService } from '../services/conversaService.js';

export const conversaController = {
  async listar(req, res) {
    try {
      const usuarioId = req.usuarioId;
      const conversas = await conversaService.listarConversas(usuarioId);
      return res.status(200).json(conversas);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao listar conversas.' });
    }
  },

  async obterMensagens(req, res) {
    try {
      const { id } = req.params;
      const mensagens = await conversaService.obterMensagens(id);
      return res.status(200).json(mensagens);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao carregar mensagens da conversa.' });
    }
  },

  async enviarMensagem(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.usuarioId;
      const { conteudo, tipo_mensagem, metadados_servico } = req.body;

      if (!conteudo) {
        return res.status(400).json({ error: 'O conteúdo da mensagem é obrigatório.' });
      }

      const mensagem = await conversaService.enviarMensagem({
        conversaId: id,
        remetenteId: usuarioId,
        conteudo,
        tipo_mensagem,
        metadados_servico
      });

      return res.status(201).json(mensagem);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao enviar mensagem.' });
    }
  },

  async iniciarOuBuscar(req, res) {
    try {
      const usuarioId = req.usuarioId;
      const { profissional_id } = req.body;

      if (!profissional_id) {
        return res.status(400).json({ error: 'profissional_id é obrigatório.' });
      }

      const conversa = await conversaService.iniciarOuBuscarConversa(usuarioId, profissional_id);
      return res.status(200).json(conversa);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao iniciar conversa.' });
    }
  }
};
