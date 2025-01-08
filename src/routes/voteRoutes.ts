import express from 'express';
import multer from 'multer'; // Importando o Multer
import { processarVotosController } from '../controllers/voteController';

const router = express.Router();

const upload = multer({ dest: 'uploads/' }); 

/**
 * @swagger
 * /processar-votos:
 *   post:
 *     summary: Processa o arquivo CSV e calcula os votos ponderados.
 *     description: Recebe um arquivo CSV e calcula os votos ponderados com base nas informações do arquivo.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: arquivo
 *         type: file
 *         description: O arquivo CSV contendo os votos a serem processados.
 *         required: true
 *     responses:
 *       200:
 *         description: Arquivo processado com sucesso
 *       400:
 *         description: Erro ao processar o arquivo ou dados inválidos.
 */
router.post('/processar-votos', upload.single('arquivo'), processarVotosController);

export default router;
