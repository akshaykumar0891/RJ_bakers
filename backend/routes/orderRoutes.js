const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Create order (requires authenticated checkout)
router.post('/', protect, createOrder);

// Retrieve authenticated user's order history
router.get('/', protect, getMyOrders);

// Track order status by ID (available for guest tracking)
router.get('/:id', getOrderById);

module.exports = router;
