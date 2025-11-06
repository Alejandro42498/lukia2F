// src/marketFactory.js
// PATRÓN: Factory Method
// Líneas: 1 - 200 (archivo pequeño)
// Breve: Devuelve la implementación del servicio de mercado ('live' o 'mock').
// Explicación: Permite seleccionar la implementación sin modificar `market.service`.

function createMarketService(mode = process.env.MARKET_SERVICE || 'live') {
  if (mode === 'mock') {
    // mock con estructura compatible mínima
    return {
      getMarketWithCharts: async () => ({
        fetchedAt: new Date().toISOString(),
        cryptos: {},
        charts: {},
      }),
    };
  }

  // por defecto devolver la implementación real; no se modifica el archivo real
  try {
    return require('./services/market.service');
  } catch (err) {
    // si falla, devolver mock por seguridad
    return {
      getMarketWithCharts: async () => ({
        fetchedAt: new Date().toISOString(),
        cryptos: {},
        charts: {},
      }),
    };
  }
}

module.exports = { createMarketService };
