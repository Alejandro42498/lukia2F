const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Cryptocurrency = require('./Cryptocurrency');

const Transaction = sequelize.define(
  'Transaction',
  {
    transaction_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      references: { model: User, key: 'user_id' },
      allowNull: false,
    },
    crypto_id: {
      type: DataTypes.UUID,
      references: { model: Cryptocurrency, key: 'crypto_id' },
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50), // 'buy' o 'sell'
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 6),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(15, 6), // Precio de la crypto en el momento de la transacción
      allowNull: false,
    },
  },
  {
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'date',
    updatedAt: false,
  }
);

module.exports = Transaction;
