import { Router } from 'express';
import { agendamentoController } from '../controllers/agendamentoController.js';
import { verificarAutenticacao } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/agendamentos', verificarAutenticacao, agendamentoController.listar);
router.post('/agendamentos', verificarAutenticacao, agendamentoController.criar);
router.patch('/agendamentos/:id/status', verificarAutenticacao, agendamentoController.atualizarStatus);

export default router;
