import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import api from "../api/api";

dotenv.config();

const prisma = new PrismaClient();

interface MunicipioAPI {
  uf: string;
  codUf: number;
  codMunic: number;
  nomeMunicipio: string;
  populacao: number;
}

function calcularPeso(populacao: number): number {
  if (populacao <= 20000) {
    return 1;
  } else if (populacao > 20000 && populacao <= 100000) {
    return 2;
  } else if (populacao > 100000 && populacao <= 1000000) {
    return 3;
  } else {
    return 4;
  }
}

export const salvarDadosMunicipios = async () => {
  async function salvarMunicipio(dados: MunicipioAPI) {
    try {
      const peso = calcularPeso(dados.populacao);
      const municipioExistente = await prisma.municipios.findUnique({
        where: {
          codMunic_nomeMunicipio: {
            codMunic: dados.codMunic,
            nomeMunicipio: dados.nomeMunicipio,
          },
        },
      });

      if (municipioExistente) {
        const municipioAtualizado = await prisma.municipios.update({
          where: {
            codMunic_nomeMunicipio: {
              codMunic: dados.codMunic,
              nomeMunicipio: dados.nomeMunicipio,
              
            },
          },
          data: {
            populacao: dados.populacao,
            peso,
            updatedAt: new Date(),   
          },
        });
      } else {
        const municipioCriado = await prisma.municipios.create({
          data: {
            uf: dados.uf,
            codUf: dados.codUf,
            codMunic: dados.codMunic,
            nomeMunicipio: dados.nomeMunicipio,
            populacao: dados.populacao,
            peso,
          },
        });
      }
    } catch (error) {
    } finally {
      await prisma.$disconnect();
    }
  }

  async function obterDadosMunicipio() {
    try {
      const apiUrl = process.env.API_GET;
      if (!apiUrl) {
        console.error("API_GET não está definida no arquivo .env");
        return;
      }
      const response = await api.get(apiUrl);
      const dados: MunicipioAPI[] = response.data;
      for (const municipio of dados) {
        await salvarMunicipio(municipio);
      }
    } catch (error) {
    }
  }
  obterDadosMunicipio();
};
