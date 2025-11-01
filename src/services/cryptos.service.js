//Este servicio trae los valores de los criptos desde una API externa coingecko

// src/services/market.service.js
const axios = require('axios');

const COINGECKO_SIMPLE_PRICE = 'https://api.coingecko.com/api/v3/simple/price';
const EXCHANGERATE_HOST = 'https://api.exchangerate.host/latest';

async function getCryptoPrices() {
  // Pedimos bitcoin y ethereum en USD y COP
  const params = {
    ids: 'bitcoin,ethereum',
    vs_currencies: 'usd,cop',
    include_24hr_change: 'true'
  };

  const resp = await axios.get(COINGECKO_SIMPLE_PRICE, { params, timeout: 10000 });
  // resp.data ejemplo:
  // { bitcoin: { usd: 56000, cop: 280000000 }, ethereum: { usd: 3500, cop: 17500000 } }
  return resp.data;
}

async function getUsdToCop() {
  // exchangerate.host: último valor del USD en COP
  const params = { base: 'USD', symbols: 'COP' };
  const resp = await axios.get(EXCHANGERATE_HOST, { params, timeout: 10000 });
  // resp.data ejemplo: { base: 'USD', rates: { COP: 4800.12 }, ... }
  return resp.data;
}

module.exports = {
  getCryptoPrices,
  getUsdToCop
};




