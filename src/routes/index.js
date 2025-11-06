// src/routes/index.js
const express = require('express');
const router = express.Router();
const marketService = require('../services/market.service');

router.get('/', async (req, res) => {
  try {
    const market = await marketService.getMarketWithCharts();

    res.render('pages/index', {
      market,
      charts: market.charts,
      updatedAt: market.fetchedAt,
      error: null,
      user: req.session.user || null // ✅ se pasa el usuario a la vista
    });
  } catch (err) {
    console.error('Error fetching market data:', err?.message || err);
    res.render('pages/index', {
      market: null,
      charts: null,
      updatedAt: null,
      error: 'No se pudo obtener datos de mercado',
      user: req.session.user || null // ✅ también aquí, por si falla
    });
  }
});

// Endpoint API (sin renderizar)
router.get('/api/market', async (req, res) => {
  try {
    const market = await marketService.getMarketWithCharts();
    res.json({
      ok: true,
      market,
      charts: market.charts,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'No se pudo obtener datos' });
  }
});

module.exports = router;
