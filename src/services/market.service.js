// src/services/market.service.js
const axios = require('axios');

// ====== CoinGecko (opcional con demo key) ======
const CG_SIMPLE_PRICE = 'https://api.coingecko.com/api/v3/simple/price';
const CG_MARKET_CHART = (id) => `https://api.coingecko.com/api/v3/coins/${id}/market_chart`;

// Si pones tu clave (gratis) en env, la usaremos.
// export CG_DEMO_API_KEY="CG-xxxx..."
const CG_KEY = process.env.CG_DEMO_API_KEY;

// ====== Binance (sin clave) ======
const BINANCE_24HR = (symbol) => `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
const BINANCE_KLINES = (symbol, interval = '1h', limit = 24) =>
  `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

// ====== USD->COP (sin clave) ======
const ERAPI_LATEST_USD = 'https://open.er-api.com/v6/latest/USD';

// ====== Cache ======
let cachePrices = null;
let cachePricesAt = 0;
const PRICES_TTL = 60 * 1000;

let cacheCharts = null;
let cacheChartsAt = 0;
const CHARTS_TTL = 5 * 60 * 1000;

// ---------------------------
// CoinGecko (preferido)
// ---------------------------
async function cg_getCryptoPrices() {
  const params = {
    ids: 'bitcoin,ethereum',
    vs_currencies: 'usd,cop',
    include_24hr_change: 'true'
  };
  const config = { params, timeout: 10000 };
  // se puede enviar como header o query param
  if (CG_KEY) {
    config.headers = { 'x-cg-demo-api-key': CG_KEY };
    // o: config.params.x_cg_demo_api_key = CG_KEY;
  }
  const { data } = await axios.get(CG_SIMPLE_PRICE, config);
  // Estructura: { bitcoin: { usd, cop, usd_24h_change }, ethereum: { ... } }
  return data;
}

async function cg_getMarketChart(id, vsCurrency = 'usd', days = 1) {
  const params = { vs_currency: vsCurrency, days: String(days), interval: 'hourly' };
  const config = { params, timeout: 12000 };
  if (CG_KEY) config.headers = { 'x-cg-demo-api-key': CG_KEY };
  const { data } = await axios.get(CG_MARKET_CHART(id), config);
  // data.prices => [ [ts_ms, price], ... ]
  return data.prices;
}

// ---------------------------
// Binance + ER-API (fallback)
// ---------------------------
async function bn_usdToCop() {
  const { data } = await axios.get(ERAPI_LATEST_USD, { timeout: 10000 });
  const cop = data?.rates?.COP;
  if (typeof cop !== 'number' || !isFinite(cop)) throw new Error('USD->COP no disponible');
  return cop;
}

async function bn_getTicker(symbol /* e.g., BTCUSDT */) {
  const { data } = await axios.get(BINANCE_24HR(symbol), { timeout: 10000 });
  // data.lastPrice, data.priceChangePercent
  return {
    lastPrice: Number(data?.lastPrice),
    changePct: Number(data?.priceChangePercent)
  };
}

async function bn_getKlines(symbol) {
  const { data } = await axios.get(BINANCE_KLINES(symbol, '1h', 24), { timeout: 12000 });
  // cada item: [openTime, open, high, low, close, volume, closeTime, ...]
  // devolvemos [ [closeTime, close], ... ] en ms y Number
  return data.map(k => [k[6], Number(k[4])]);
}

// Devuelve objeto compatible con tu UI a partir de Binance
async function bn_buildMarket() {
  const [usdCop, btc, eth, btcK, ethK] = await Promise.all([
    bn_usdToCop(),
    bn_getTicker('BTCUSDT'),
    bn_getTicker('ETHUSDT'),
    bn_getKlines('BTCUSDT'),
    bn_getKlines('ETHUSDT')
  ]);

  const cryptos = {
    bitcoin: {
      usd: btc.lastPrice,
      cop: Math.round(btc.lastPrice * usdCop),
      usd_24h_change: btc.changePct // ya es porcentaje
    },
    ethereum: {
      usd: eth.lastPrice,
      cop: Math.round(eth.lastPrice * usdCop),
      usd_24h_change: eth.changePct
    }
  };

  const charts = {
    bitcoin: { usd: btcK },
    ethereum: { usd: ethK }
  };

  return { cryptos, charts, fetchedAt: new Date().toISOString() };
}

// ---------------------------
// API principal con fallback
// ---------------------------
async function getMarketWithCharts() {
  const now = Date.now();

  // usar cache si válido
  const usePriceCache = cachePrices && now - cachePricesAt < PRICES_TTL;
  const useChartCache = cacheCharts && now - cacheChartsAt < CHARTS_TTL;

  if (usePriceCache && useChartCache) {
    return { ...cachePrices, charts: cacheCharts };
  }

  // 1) Intentar CoinGecko
  try {
    const [prices, btc24h, eth24h] = await Promise.all([
      usePriceCache ? cachePrices.cryptos : cg_getCryptoPrices(),
      useChartCache ? cacheCharts.bitcoin.usd : cg_getMarketChart('bitcoin', 'usd', 1),
      useChartCache ? cacheCharts.ethereum.usd : cg_getMarketChart('ethereum', 'usd', 1)
    ]);

    const result = {
      cryptos: prices,
      charts: {
        bitcoin: { usd: Array.isArray(btc24h) ? btc24h : cacheCharts?.bitcoin?.usd || [] },
        ethereum: { usd: Array.isArray(eth24h) ? eth24h : cacheCharts?.ethereum?.usd || [] }
      },
      fetchedAt: new Date().toISOString()
    };

    // Actualiza caches
    if (!usePriceCache) { cachePrices = { cryptos: prices, fetchedAt: result.fetchedAt }; cachePricesAt = now; }
    if (!useChartCache) { cacheCharts  = result.charts; cacheChartsAt  = now; }

    return result;
  } catch (e) {
    // si hay 401/403/… caemos a Binance
    // console.warn('CoinGecko falló, usando Binance:', e?.response?.status || e?.message);
  }

  // 2) Fallback Binance (sin clave)
  const result = await bn_buildMarket();
  // actualiza caches
  cachePrices = { cryptos: result.cryptos, fetchedAt: result.fetchedAt };
  cacheCharts = result.charts;
  cachePricesAt = now;
  cacheChartsAt = now;
  return result;
}

module.exports = {
  getMarketWithCharts
};
