import { Router } from 'express';
import { profissionalController } from '../controllers/profissionalController.js';
import { verificarAutenticacao } from '../middlewares/authMiddleware.js';

const router = Router();

// Rotas públicas
router.get('/profissionais/destaque', profissionalController.destaque);
router.get('/profissionais', profissionalController.listar);
router.get('/profissionais/:id', profissionalController.obter);

// Rotas autenticadas do profissional
router.get('/profissionais-me', verificarAutenticacao, profissionalController.obterMeuPerfil);
router.post('/profissionais/credenciamento', verificarAutenticacao, profissionalController.salvarCredenciamento);
router.put('/profissionais/credenciamento', verificarAutenticacao, profissionalController.salvarCredenciamento);
router.patch('/profissionais/:id/verificacao', verificarAutenticacao, profissionalController.alternarVerificacao);

export default router;
