import { Request, Response } from 'express';
import { getAllPesquisas } from '../services/getPesquisas';

export const getAllPesquisasController = async (req: Request, res: Response): Promise<void> => {
  try {
    const pesquisas = await getAllPesquisas();
    res.status(200).json(pesquisas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar as pesquisas' });
  }
};
