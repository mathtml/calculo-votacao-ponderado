import NodeCache from 'node-cache';

// Cria um cache central compartilhado
export const cache = new NodeCache({ stdTTL: 2592000, checkperiod: 600 });
