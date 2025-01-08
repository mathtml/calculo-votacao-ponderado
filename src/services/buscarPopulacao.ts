import { PrismaClient } from '@prisma/client';
import Fuse from 'fuse.js';

const prisma = new PrismaClient();

const corrigirCaracteresEspeciais = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/�/g, "")
    .toLowerCase();
};

const municipiosNaoLocalizados: string[] = []; 

export const buscarPopulacao = async (municipio: string, estado: string): Promise<number> => {
  try {
    const municipioCorrigido = corrigirCaracteresEspeciais(municipio);

    const municipios = await prisma.municipios.findMany({
      where: {
        uf: estado,
      },
    });

    const options = {
      includeScore: true,
      threshold: 0.5,
      keys: ['nomeMunicipio'],
    };

    const fuse = new Fuse(municipios, options);

    const resultadoBusca = fuse.search(municipioCorrigido);

    if (resultadoBusca.length === 0) {
      municipiosNaoLocalizados.push(`${municipio} (${estado})`); 
      return 0; 
    }

    const municipioEncontrado = resultadoBusca[0].item;

    return municipioEncontrado.peso;

  } catch (error) {
    throw new Error('Erro ao buscar população do município');
  }
};

export const exibirMunicipiosNaoLocalizados = () => {
  if (municipiosNaoLocalizados.length > 0) {
    municipiosNaoLocalizados.forEach(municipio => console.log(municipio));
  } else {
  }
};
