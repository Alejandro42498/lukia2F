const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const tradesController = require('../controllers/trades.controller');

// GET /api/trades - obtener trades del usuario autenticado
router.get('/', isAuthenticated, tradesController.getTrades);

// POST /api/trades - crear una nueva transacción/trade
router.post('/', isAuthenticated, tradesController.createTrade);

module.exports = router;
