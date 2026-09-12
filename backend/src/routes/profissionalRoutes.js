import { Router } from 'express';
import { profissionalController } from '../controllers/profissionalController.js';

const router = Router();

router.get('/profissionais/destaque', profissionalController.destaque);
router.get('/profissionais', profissionalController.listar);
router.get('/profissionais/:id', profissionalController.obter);

export default router;
