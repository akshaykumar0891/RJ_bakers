const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAdminOrders,
  updateOrderStatus,
  verifyPayment,
  getSettings,
  updateSettings,
  clearAllOrders,
  deleteOrder
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const { handleImageUpload } = require('../middleware/upload');

// Admin panel dashboard & orders
router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/orders', protect, admin, getAdminOrders);
router.delete('/orders/clear', protect, admin, clearAllOrders);
router.delete('/orders/:id', protect, admin, deleteOrder);

// Order status & payment verification
router.put('/orders/:id/status', protect, admin, updateOrderStatus);
router.put('/orders/:id/verify-payment', protect, admin, verifyPayment);

// Shop settings (Retrieval is public for checkouts, Updates are protected/admin)
router.get('/settings', getSettings);
router.put('/settings', protect, admin, handleImageUpload('qrImage'), updateSettings);

module.exports = router;
