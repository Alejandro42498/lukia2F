const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExternalAPI = sequelize.define(
  'ExternalAPI',
  {
    api_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'externalapi',
    timestamps: false,
  }
);

module.exports = ExternalAPI;
