import { usuarioService } from '../services/usuarioService.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const usuarioController = {
  async cadastrar(req, res) {
    try {
      const { email, senha, nome, telefone, tipo_usuario } = req.body;

      if (!email || !senha || !nome || !tipo_usuario) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
      }

      // Criptografando a senha com bcrypt
      const saltRounds = 10;
      const senha_hash = await bcrypt.hash(senha, saltRounds);

      const novoUsuario = await usuarioService.criarUsuario({
        email,
        senha_hash,
        nome,
        telefone,
        tipo_usuario
      });

      return res.status(201).json({
        message: 'Usuário cadastrado com sucesso!',
        usuario: novoUsuario
      });
    } catch (err) {
      console.error(err);
      if (err.code === '23505') {
        return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
      }
      return res.status(500).json({ error: 'Erro interno no servidor ao cadastrar usuário.' });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Informe e-mail e senha.' });
      }

      const usuario = await usuarioService.buscarPorEmail(email);
      if (!usuario) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      }

      // Compara a senha enviada com o hash salvo no banco
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
      if (!senhaCorreta) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      }

      // Gera o Token JWT válido por 7 dias
      const token = jwt.sign(
        { id: usuario.id, tipo_usuario: usuario.tipo_usuario },
        process.env.JWT_SECRET || 'seredo_super_secreto',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Login realizado com sucesso!',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo_usuario: usuario.tipo_usuario
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro interno no servidor ao fazer login.' });
    }
  },

  async listar(req, res) {
    try {
      const usuarios = await usuarioService.listarUsuarios();
      return res.status(200).json(usuarios);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
  }
};