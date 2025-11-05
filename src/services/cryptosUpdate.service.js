const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database'); // 🔗 usa tu conexión existente

const updateCryptos = async () => {
  try {
    console.log('🔄 Iniciando actualización de criptomonedas...');

    // 1️⃣ Obtener datos desde CoinGecko
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 10,
        page: 1,
        sparkline: false,
      },
    });

    const cryptos = response.data;
    const api_id = '12eeebd3-a912-4e2d-bc52-ae6c77bc1f92'; // 🟢 tu API registrada

    // 2️⃣ Insertar o actualizar cada criptomoneda
    for (const crypto of cryptos) {
      const { name, symbol, current_price, last_updated } = crypto;

      const query = `
        INSERT INTO cryptocurrency (crypto_id, name, symbol, current_price, last_updated, api_id)
        VALUES (:crypto_id, :name, :symbol, :current_price, :last_updated, :api_id)
        ON CONFLICT (symbol)
        DO UPDATE SET 
          current_price = EXCLUDED.current_price,
          last_updated = EXCLUDED.last_updated;
      `;

      await sequelize.query(query, {
        replacements: {
          crypto_id: uuidv4(),
          name,
          symbol,
          current_price,
          last_updated,
          api_id, // ✅ usa el id existente, no uno nuevo
        },
      });
    }

    console.log('✅ Criptomonedas actualizadas correctamente');
  } catch (error) {
    console.error('❌ Error actualizando criptomonedas:', error.message);
  }
};

module.exports = { updateCryptos };
