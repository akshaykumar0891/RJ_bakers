const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Setting = require('./Setting');
const Review = require('./Review');

// Associations

// 1. Category <-> Product
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// 2. User <-> Order
User.hasMany(Order, { foreignKey: 'userId', as: 'orders', onDelete: 'SET NULL' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 3. Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// 4. Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// 5. Product <-> Review
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Setting,
  Review
};
