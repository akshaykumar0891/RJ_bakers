const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  upiId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'upi_id'
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'phone_number'
  },
  qrImageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'qr_image_url'
  },
  bakeryEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'bakery_email'
  },
  deliverySlots: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'delivery_slots'
  },
  bakeryAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'bakery_address'
  },
  deliveryChargeType: {
    type: DataTypes.STRING,
    defaultValue: 'free',
    field: 'delivery_charge_type'
  },
  deliveryChargeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'delivery_charge_amount'
  }
}, {
  tableName: 'settings',
  timestamps: true
});

module.exports = Setting;
