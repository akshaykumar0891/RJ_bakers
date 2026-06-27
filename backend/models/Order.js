const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'customer_name'
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'customer_phone'
  },
  customerAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'customer_address'
  },
  deliveryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'delivery_date'
  },
  deliveryTime: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'delivery_time'
  },
  specialNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'special_note'
  },
  paymentMethod: {
    type: DataTypes.ENUM('COD', 'UPI'),
    allowNull: false,
    field: 'payment_method'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'failed'),
    defaultValue: 'pending',
    field: 'payment_status'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'transaction_id'
  },
  paymentScreenshot: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'payment_screenshot'
  },
  deliveryCharge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'delivery_charge'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount'
  },
  orderStatus: {
    type: DataTypes.ENUM(
      'Pending',
      'Payment Verification Pending',
      'Confirmed',
      'Preparing',
      'Ready',
      'Out For Delivery',
      'Delivered',
      'Cancelled'
    ),
    defaultValue: 'Pending',
    field: 'order_status'
  }
}, {
  tableName: 'orders',
  timestamps: true
});

module.exports = Order;
