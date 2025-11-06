const { Transaction, User, Cryptocurrency } = require('../models');

// Nota: en este proyecto no existe un modelo 'Trade'; se usa Transaction
const getTrades = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const trades = await Transaction.findAll({
      where: { user_id: userId },
      include: [{ model: Cryptocurrency, attributes: ['name', 'symbol'] }],
    });

    res.json(trades);
  } catch (error) {
    console.error('Error in getTrades:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createTrade = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { cryptoId, type, amount, price } = req.body;
    if (!cryptoId || !type || !amount || !price) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const tx = await Transaction.create({
      user_id: userId,
      crypto_id: cryptoId,
      type,
      amount,
      price,
    });

    res.status(201).json(tx);
  } catch (error) {
    console.error('Error in createTrade:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getTrades,
  createTrade,
};
