const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cryptocurrency = sequelize.define(
  'Cryptocurrency',
  {
    crypto_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    symbol: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    current_price: {
      type: DataTypes.DECIMAL(15, 6),
    },
    last_updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    api_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'externalapi',
        key: 'api_id',
      },
    },
  },
  {
    tableName: 'cryptocurrency',
    timestamps: false,
  }
);

module.exports = Cryptocurrency;
