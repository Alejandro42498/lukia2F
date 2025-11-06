const {
  User,
  Portfolio,
  Transaction,
  Cryptocurrency,
} = require('../models');
const sequelize = require('../config/database');

async function executeTransaction(
  userId,
  cryptoSymbol,
  amount,
  transactionType
) {
  const t = await sequelize.transaction();
  try {
    const crypto = await Cryptocurrency.findOne({
      where: { symbol: cryptoSymbol },
      transaction: t,
    });
    if (!crypto) {
      throw new Error('Criptomoneda no encontrada');
    }

    let portfolio = await Portfolio.findOne({
      where: { user_id: userId },
      transaction: t,
    });
    if (!portfolio) {
      // Si no existe portafolio, se crea uno nuevo.
      portfolio = await Portfolio.create({ user_id: userId, balance: 0 }, { transaction: t });
    }

    const transactionCost = amount * crypto.current_price;

    if (transactionType === 'buy') {
      // Aquí necesitarías una lógica para verificar el balance principal del usuario (ej. en COP o USD)
      // Como no la tenemos, vamos a simular que la compra siempre es posible.
      portfolio.balance =
        parseFloat(portfolio.balance) + parseFloat(transactionCost);
    } else if (transactionType === 'sell') {
      // Para vender, sí verificamos el valor del portafolio.
      if (parseFloat(portfolio.balance) < transactionCost) {
        throw new Error('Balance insuficiente en el portafolio para vender el valor estimado.');
      }
      portfolio.balance =
        parseFloat(portfolio.balance) - parseFloat(transactionCost);
    } else {
      await t.rollback();
      throw new Error('Tipo de transacción no válido');
    }

    await portfolio.save({ transaction: t });

    const newTransaction = await Transaction.create(
      {
        user_id: userId,
        crypto_id: crypto.crypto_id,
        type: transactionType,
        amount: amount,
        price: crypto.current_price,
      },
      { transaction: t }
    );

    await t.commit();
    return { portfolio, transaction: newTransaction };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

module.exports = { executeTransaction };
