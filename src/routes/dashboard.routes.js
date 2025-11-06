const express = require('express');
const router = express.Router();
const { User, Portfolio, Cryptocurrency, Transaction } = require('../models');

// Asegurar asociación para incluir la cripto en las transacciones
Transaction.belongsTo(Cryptocurrency, { foreignKey: 'crypto_id', as: 'cryptocurrency' });

// Dashboard (GET)
router.get('/', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.redirect('/login');

    // Asegurar existencia de portfolio
    let portfolio = await Portfolio.findOne({ where: { user_id: user.user_id } });
    if (!portfolio) {
      portfolio = await Portfolio.create({ user_id: user.user_id, balance: 0 });
    }

    // Obtener transacciones con info de cripto
    const transactions = await Transaction.findAll({
      where: { user_id: user.user_id },
      include: [{ model: Cryptocurrency, as: 'cryptocurrency' }]
    });

    // Obtener lista de criptomonedas disponibles para el formulario
    const cryptos = await Cryptocurrency.findAll({ order: [['name', 'ASC']] });

    // Calcular holdings por cripto (buy suma, sell resta)
    const holdingsMap = new Map();
    for (const t of transactions) {
      const cid = t.crypto_id;
      const amt = parseFloat(t.amount) || 0;
      const sign = t.type === 'buy' ? 1 : -1;
      const prev = holdingsMap.get(cid) || { crypto: t.cryptocurrency, amount: 0 };
      prev.amount += sign * amt;
      holdingsMap.set(cid, prev);
    }

    // Construir array de holdings con valor actual
    const holdings = [];
    let cryptosValue = 0;
    for (const [cid, item] of holdingsMap.entries()) {
      const qty = Math.max(0, item.amount); // evitar negativos
      const price = item.crypto ? parseFloat(item.crypto.current_price || 0) : 0;
      const value = qty * price;
        if (qty > 0) {
        holdings.push({
          crypto_id: cid,
          name: item.crypto ? item.crypto.name : 'N/A',
          symbol: item.crypto ? item.crypto.symbol : 'N/A',
          quantity: qty,
          price,
          value
        });
        cryptosValue += value;
      }
    }

    const balance = parseFloat(portfolio.balance) || 0;
    const totalPortfolioValue = balance + cryptosValue;

    res.render('pages/dashboard', {
      user,
      portfolio, // pasar el objeto portfolio para compatibilidad
      balance,
      holdings,
      cryptosValue,
      totalPortfolioValue,
      transactions,
      cryptos,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('Error fetching user for dashboard:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Handle transaction (POST)
router.post('/transaction', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  try {
    const { crypto_symbol, amount, type } = req.body;
    const amt = parseFloat(amount);
    if (!(amt > 0)) return res.redirect('/dashboard?error=invalid_amount');

    const user = await User.findByPk(req.session.userId);
    const crypto = await Cryptocurrency.findOne({ where: { symbol: crypto_symbol } });
    if (!crypto) return res.redirect('/dashboard?error=crypto_not_found');

    // Asegurar portfolio
    const portfolio =
      (await Portfolio.findOne({ where: { user_id: user.user_id } })) ||
      (await Portfolio.create({ user_id: user.user_id, balance: 0 }));

    const price = parseFloat(crypto.current_price) || 0;
    const cost = amt * price;

    // Calcular holdings actuales para esta cripto
    const txs = await Transaction.findAll({
      where: { user_id: user.user_id, crypto_id: crypto.crypto_id },
    });
    let currentHolding = 0;
    for (const t of txs) currentHolding += (t.type === 'buy' ? 1 : -1) * parseFloat(t.amount);

    if (type === 'buy') {
      if (portfolio.balance < cost) {
        return res.redirect('/dashboard?error=insufficient_funds');
      }
      portfolio.balance = parseFloat(portfolio.balance) - cost;
    } else if (type === 'sell') {
      if (currentHolding < amt) {
        return res.redirect('/dashboard?error=insufficient_holdings');
      }
      portfolio.balance = parseFloat(portfolio.balance) + cost;
    } else {
      return res.redirect('/dashboard?error=invalid_type');
    }

    await Transaction.create({
      user_id: user.user_id,
      crypto_id: crypto.crypto_id,
      type,
      amount: amt,
      price,
    });

    await portfolio.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
