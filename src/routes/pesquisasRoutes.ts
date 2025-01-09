import { Router } from 'express';
import { getAllPesquisasController } from '../controllers/pesquisaController';

const router = Router();

/**
 * @swagger
 * /pesquisas:
 *   get:
 *     summary: Retorna todas as pesquisas
 *     description: Recupera todos os dados de pesquisas armazenados no banco.
 *     responses:
 *       200:
 *         description: Lista de pesquisas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Erro ao buscar as pesquisas
 */
router.get('/pesquisas', getAllPesquisasController);

export default router;
