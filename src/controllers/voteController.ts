import { Request, Response } from 'express';
import { processarVotosCSV } from '../services/voteService';

export const processarVotosController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Arquivo CSV não enviado.' });
      return;
    }
    const caminhoArquivo = req.file.path; 
    const resultado = await processarVotosCSV(caminhoArquivo);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar o arquivo CSV ou dados inválidos.' });
  }
};
