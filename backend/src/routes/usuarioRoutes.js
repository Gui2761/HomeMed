import { Router } from 'express';
import { usuarioController } from '../controllers/usuarioController.js';
import { verificarAutenticacao } from '../middlewares/authMiddleware.js';

const router = Router();

// Rotas públicas
router.post('/usuarios', usuarioController.cadastrar);
router.post('/login', usuarioController.login);
router.post('/redefinir-senha', usuarioController.redefinirSenha);

// Rota protegida pelo middleware
router.get('/usuarios', verificarAutenticacao, usuarioController.listar);

export default router;