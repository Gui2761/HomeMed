import { Router } from 'express';
import { pacienteController } from '../controllers/pacienteController.js';
import { verificarAutenticacao } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/pacientes/me', verificarAutenticacao, pacienteController.obterPerfil);
router.put('/pacientes/me', verificarAutenticacao, pacienteController.atualizarPerfil);
router.post('/pacientes/me/endereco', verificarAutenticacao, pacienteController.salvarEndereco);

export default router;
