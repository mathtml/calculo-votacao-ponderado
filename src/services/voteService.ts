import { PrismaClient } from "@prisma/client"; 
import fs from "fs";
import xlsx from "xlsx";
import { buscarPopulacao } from "./buscarPopulacao";

const prisma = new PrismaClient(); 

export const processarVotosCSV = async (caminhoArquivo: string) => {
  const votosPorMunicipio: {
    [municipio: string]: { [candidatoId: string]: number };
  } = {};
  const totalPorMunicipio: { [municipio: string]: number } = {};
  const votosPorEstado: {
    [estado: string]: { [candidatoId: string]: number };
  } = {};
  const totalPorEstado: { [estado: string]: number } = {};
  const votosNacionais: { [candidatoId: string]: number } = {};
  let totalVotosBrasil = 0;

  const dados: Array<{ municipio: string; estado: string; voto: string }> = [];

  return new Promise((resolve, reject) => {
    try {
      const arquivo = fs.readFileSync(caminhoArquivo, "utf-8");
      const workbook = xlsx.readFile(caminhoArquivo, { codepage: 65001 });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const linhas = arquivo.split("\n");
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      const idPesquisa = (rows[1] as any)[0]; 

      rows.slice(1).forEach((row: any) => {
        if (row && row[2] && row[3] && row[4]) {
          const municipio = row[2];
          const estado = row[3];
          const voto = row[4];
          dados.push({
            municipio: municipio || "Desconhecido",
            estado: estado || "Desconhecido",
            voto: voto || "Desconhecido",
          });
        }
      });

      (async () => {
        try {
          for (const { municipio, estado, voto } of dados) {
            const peso = await buscarPopulacao(municipio, estado);
            if (peso === null) {
              continue;
            }

            const candidatoId = `${voto}`;

            if (!votosPorMunicipio[municipio])
              votosPorMunicipio[municipio] = {};
            if (!votosPorMunicipio[municipio][candidatoId])
              votosPorMunicipio[municipio][candidatoId] = 0;
            votosPorMunicipio[municipio][candidatoId] += peso;

            if (!totalPorMunicipio[municipio]) totalPorMunicipio[municipio] = 0;
            totalPorMunicipio[municipio] += peso;

            if (!votosPorEstado[estado]) votosPorEstado[estado] = {};
            if (!votosPorEstado[estado][candidatoId])
              votosPorEstado[estado][candidatoId] = 0;
            votosPorEstado[estado][candidatoId] += peso;

            if (!totalPorEstado[estado]) totalPorEstado[estado] = 0;
            totalPorEstado[estado] += peso;

            if (!votosNacionais[candidatoId]) votosNacionais[candidatoId] = 0;
            votosNacionais[candidatoId] += peso;
            totalVotosBrasil += peso;
          }

          for (const municipio in votosPorMunicipio) {
            for (const candidatoId in votosPorMunicipio[municipio]) {
              const totalVotosMunicipio = totalPorMunicipio[municipio];
              const votosCandidato = votosPorMunicipio[municipio][candidatoId];
              const porcentagem = (votosCandidato / totalVotosMunicipio) * 100;
              votosPorMunicipio[municipio][candidatoId] = parseFloat(
                porcentagem.toFixed(2)
              );
            }
          }

          for (const estado in votosPorEstado) {
            for (const candidatoId in votosPorEstado[estado]) {
              const totalVotosEstado = totalPorEstado[estado];
              const votosCandidato = votosPorEstado[estado][candidatoId];
              const porcentagem = (votosCandidato / totalVotosEstado) * 100;
              votosPorEstado[estado][candidatoId] = parseFloat(
                porcentagem.toFixed(2)
              );
            }
          }

          let vencedorNacional = null;
          let maiorVotoNacional = 0;
          let SegundoColocado = null;
          let maiorVotoSegundoNacional = 0;

          for (const candidatoId in votosNacionais) {
            if (votosNacionais[candidatoId] > maiorVotoNacional) {
              SegundoColocado = vencedorNacional;
              maiorVotoSegundoNacional = maiorVotoNacional;
              maiorVotoNacional = votosNacionais[candidatoId];
              vencedorNacional = candidatoId;
            } else if (votosNacionais[candidatoId] > maiorVotoSegundoNacional) {
              SegundoColocado = candidatoId;
              maiorVotoSegundoNacional = votosNacionais[candidatoId];
            }
          }

          const porcentagemVencedorNacional = parseFloat(
            ((maiorVotoNacional / totalVotosBrasil) * 100).toFixed(2)
          );
          const porcentagemSegundoVencedorNacional = parseFloat(
            ((maiorVotoSegundoNacional / totalVotosBrasil) * 100).toFixed(2)
          );
          const dataPesquisa = new Date(linhas[1].split(";")[1].split("/").reverse().join("-"));

          await prisma.pesquisas.create({
            data: {
              idPesquisa: idPesquisa, 
              candidato: vencedorNacional,
              resultado: `${porcentagemVencedorNacional.toFixed(2)}%`,
              dataPesquisa: dataPesquisa,
            },
          });

          await prisma.pesquisas.create({
            data: {
              idPesquisa: idPesquisa, 
              candidato: SegundoColocado,
              resultado: `${porcentagemSegundoVencedorNacional.toFixed(2)}%`,
              dataPesquisa: dataPesquisa,
            },
          });

          resolve({
            votosPorMunicipio,
            votosPorEstado,
            vencedorNacional,
            porcentagemVencedorNacional,
            SegundoColocado,
            porcentagemSegundoVencedorNacional,
          });
        } catch (error) {
          reject(`Erro ao processar os votos: ${error}`);
        }
      })();
    } catch (error) {
      reject(`Erro ao ler o arquivo XLSX: ${error}`);
    }
  });
};
