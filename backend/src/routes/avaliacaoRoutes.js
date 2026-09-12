import { Router } from 'express';
import { avaliacaoController } from '../controllers/avaliacaoController.js';
import { verificarAutenticacao } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/avaliacoes', verificarAutenticacao, avaliacaoController.criar);
router.get('/profissionais/:profissionalId/avaliacoes', avaliacaoController.listarPorProfissional);

export default router;
