import { Router } from 'express';
import { conversaController } from '../controllers/conversaController.js';
import { verificarAutenticacao } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/conversas', verificarAutenticacao, conversaController.listar);
router.post('/conversas', verificarAutenticacao, conversaController.iniciarOuBuscar);
router.get('/conversas/:id/mensagens', verificarAutenticacao, conversaController.obterMensagens);
router.post('/conversas/:id/mensagens', verificarAutenticacao, conversaController.enviarMensagem);

export default router;
