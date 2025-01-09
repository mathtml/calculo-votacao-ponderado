import { PrismaClient } from '@prisma/client';
import Fuse from 'fuse.js';
import NodeCache from 'node-cache';
import { corrigirCaracteresEspeciais } from '../utils/corrigirCaracterEspeciais';

const prisma = new PrismaClient();
const cache = new NodeCache();  

const municipiosNaoLocalizados: string[] = []; 

export const buscarPopulacao = async (municipio: string, estado: string): Promise<number> => {
  try {
    const municipioCorrigido = corrigirCaracteresEspeciais(municipio);

    const cacheKey = `${municipioCorrigido}-${estado}`;
    const cachedResult = cache.get<number>(cacheKey);

    if (cachedResult !== undefined) {
      console.log(`Cache hit para ${cacheKey}: ${cachedResult}`);
      return cachedResult;
    }

    console.log(`Cache miss para ${cacheKey}. Consultando o banco de dados...`);

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

    console.log(`Salvando no cache: ${municipioCorrigido}-${estado} com valor ${municipioEncontrado.peso}`);
    cache.set(cacheKey, municipioEncontrado.peso, 2592000); 

    return municipioEncontrado.peso;

  } catch (error) {
    throw new Error('Erro ao buscar população do município');
  }
};

export const exibirMunicipiosNaoLocalizados = () => {
  if (municipiosNaoLocalizados.length > 0) {
    municipiosNaoLocalizados.forEach(municipio => console.log(municipio));
  } else {
    console.log("Nenhum município não localizado.");
  }
};
