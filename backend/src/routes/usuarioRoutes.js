import { Router } from 'express';
import { usuarioController } from '../controllers/usuarioController.js';
import { verificarAutenticacao } from '../middlewares/authMiddleware.js';

const router = Router();

// Rotas públicas
router.post('/usuarios', usuarioController.cadastrar);
router.post('/login', usuarioController.login);
router.post('/redefinir-senha', usuarioController.redefinirSenha);
router.get('/seed-usuarios', usuarioController.seedPadrao);
router.post('/seed-usuarios', usuarioController.seedPadrao);

// Rotas protegidas pelo middleware
router.get('/usuarios/me', verificarAutenticacao, usuarioController.obterPerfil);
router.put('/usuarios/me', verificarAutenticacao, usuarioController.atualizarPerfil);
router.get('/usuarios', verificarAutenticacao, usuarioController.listar);

export default router;