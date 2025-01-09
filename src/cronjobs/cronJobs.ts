import cron from 'node-cron';
import { salvarDadosMunicipios } from '../services/salvarDadosMunicipios';
import NodeCache from 'node-cache';

cron.schedule('0 2 1 * *', () => {
    console.log('Iniciando requisição mensal...');
    salvarDadosMunicipios()
  }, {
    scheduled: true,
    timezone: 'America/Sao_Paulo',  
  });
  