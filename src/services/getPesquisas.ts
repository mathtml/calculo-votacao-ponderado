import { PrismaClient, Pesquisas } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllPesquisas = async (): Promise<Pesquisas[]> => {
  try {
    const pesquisas = await prisma.pesquisas.findMany();
    return pesquisas;
  } catch (error) {
    throw new Error('Erro ao buscar as pesquisas');
  }
};
