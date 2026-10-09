import { usuarioService } from '../services/usuarioService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const usuarioController = {
  async cadastrar(req, res) {
    try {
      const { email, senha, nome, telefone, tipo_usuario, cpf, registro_profissional, especialidade_principal, bio, preco_base } = req.body;

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
        tipo_usuario,
        cpf,
        registro_profissional,
        especialidade_principal,
        bio,
        preco_base
      });

      return res.status(201).json({
        message: 'Usuário cadastrado com sucesso!',
        usuario: novoUsuario
      });
    } catch (err) {
      console.error('[ERRO CADASTRO]', err);
      if (err.code === '23505' || err.message?.includes('UNIQUE constraint')) {
        return res.status(400).json({ error: 'Este e-mail ou CPF já está cadastrado.' });
      }
      return res.status(500).json({ 
        error: 'Erro interno no servidor ao cadastrar usuário.', 
        details: err.message 
      });
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

      const jwtSecret = process.env.JWT_SECRET || 'homemed_default_jwt_secret_dev_key_2026';
      const token = jwt.sign(
        { id: usuario.id, tipo_usuario: usuario.tipo_usuario },
        jwtSecret,
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
      return res.status(500).json({ error: 'Erro interno no servidor ao fazer login.', details: err.message });
    }
  },

  async listar(req, res) {
    try {
      const usuarios = await usuarioService.listarUsuarios();
      return res.status(200).json(usuarios);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar usuários.', details: err.message });
    }
  }
};