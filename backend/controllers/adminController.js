const { Order, OrderItem, Product, User, Setting } = require('../models');
const { Op } = require('sequelize');
const { sendNotification } = require('../utils/nodemailer');

// @desc    Get dashboard metrics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Today's Orders
    const todayOrdersCount = await Order.count({
      where: {
        createdAt: {
          [Op.gte]: today
        }
      }
    });

    // 2. Pending Orders (Pending & Payment Verification Pending)
    const pendingOrdersCount = await Order.count({
      where: {
        orderStatus: {
          [Op.in]: ['Pending', 'Payment Verification Pending']
        }
      }
    });

    // 3. Completed Orders (Delivered)
    const completedOrdersCount = await Order.count({
      where: {
        orderStatus: 'Delivered'
      }
    });

    // 4. Total Products
    const totalProductsCount = await Product.count();

    // 5. Total Revenue (verified payments or delivered cash orders)
    const revenueResult = await Order.sum('total_amount', {
      where: {
        [Op.or]: [
          { paymentStatus: 'verified' },
          { orderStatus: 'Delivered' }
        ]
      }
    });
    const totalRevenue = revenueResult || 0;

    // 6. Recent Orders list
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['id', 'DESC']],
      include: [
        {
          model: OrderItem,
          as: 'items',
          attributes: ['quantity', 'price'],
          include: [{ model: Product, as: 'product', attributes: ['name'] }]
        }
      ]
    });

    res.json({
      todayOrders: todayOrdersCount,
      pendingOrders: pendingOrdersCount,
      completedOrders: completedOrdersCount,
      totalProducts: totalProductsCount,
      totalRevenue: parseFloat(totalRevenue),
      recentOrders
    });
  } catch (error) {
    console.error('❌ Admin dashboard stats error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders (admin view)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAdminOrders = async (req, res) => {
  const { status, paymentMethod } = req.query;
  const whereClause = {};

  if (status) whereClause.orderStatus = status;
  if (paymentMethod) whereClause.paymentMethod = paymentMethod;

  try {
    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name', 'imageUrl'] }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ],
      order: [['id', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('❌ Admin fetch orders error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Please provide a status' });
  }

  const validStatuses = [
    'Pending',
    'Payment Verification Pending',
    'Confirmed',
    'Preparing',
    'Ready',
    'Out For Delivery',
    'Delivered',
    'Cancelled'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status value' });
  }

  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['email'] }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status
    order.orderStatus = status;
    
    // Automatically set payment status for Cash on Delivery orders when delivered
    if (status === 'Delivered' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'verified';
    }

    await order.save();

    // Trigger Notification to customer (if email exists)
    const customerEmail = order.user ? order.user.email : null;
    if (customerEmail) {
      const emailSubject = `🧁 Order Status Update - RJ Bakers #${order.id}`;
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #D97706; text-align: center;">🧁 Order Status Update 🧁</h2>
          <p>Hello <strong>${order.customerName}</strong>,</p>
          <p>Your order <strong>#${order.id}</strong> status has been updated to: <span style="font-size: 16px; font-weight: bold; color: #451A03; background-color: #FFFDF5; padding: 4px 8px; border-radius: 4px; border: 1px solid #F59E0B;">${status}</span></p>
          <div style="background-color: #F9FAFB; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Delivery Date:</strong> ${order.deliveryDate}</p>
            <p><strong>Delivery Time:</strong> ${order.deliveryTime}</p>
            <p><strong>Delivery Address:</strong> ${order.customerAddress}</p>
            <p><strong>Total Amount:</strong> ₹${parseFloat(order.totalAmount).toFixed(2)}</p>
          </div>
          <p>You can track the progress of your order using the order page on our website.</p>
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">
            RJ Bakers - Mobile-First Ordering System.
          </p>
        </div>
      `;

      await sendNotification({
        to: customerEmail,
        subject: emailSubject,
        html: emailBody
      });
    }

    // Fetch refreshed order detail
    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name', 'imageUrl'] }]
        }
      ]
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('❌ Update order status error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify UPI Payment
// @route   PUT /api/admin/orders/:id/verify-payment
// @access  Private/Admin
const verifyPayment = async (req, res) => {
  const { verifyAction } = req.body; // 'approve' or 'reject'

  if (!verifyAction) {
    return res.status(400).json({ message: 'Please specify verification action: approve or reject' });
  }

  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['email'] }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentMethod !== 'UPI') {
      return res.status(400).json({ message: 'Order is not a UPI payment method' });
    }

    if (verifyAction === 'approve') {
      order.paymentStatus = 'verified';
      order.orderStatus = 'Confirmed';
    } else {
      order.paymentStatus = 'failed';
      order.orderStatus = 'Cancelled';
    }

    await order.save();

    // Notify customer
    const customerEmail = order.user ? order.user.email : null;
    if (customerEmail) {
      const isApproved = verifyAction === 'approve';
      const emailSubject = isApproved 
        ? `🧁 Payment Confirmed! - RJ Bakers #${order.id}`
        : `⚠️ Payment Verification Failed - RJ Bakers #${order.id}`;

      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: ${isApproved ? '#10B981' : '#EF4444'}; text-align: center;">
            ${isApproved ? '🧁 Payment Confirmed! 🧁' : '⚠️ Payment Verification Issue ⚠️'}
          </h2>
          <p>Hello <strong>${order.customerName}</strong>,</p>
          ${isApproved 
            ? `<p>Your UPI payment has been successfully verified! Your order <strong>#${order.id}</strong> is now <strong>Confirmed</strong> and the kitchen has started preparing your fresh bakes.</p>`
            : `<p>We were unable to verify your UPI payment transaction ID (<strong>${order.transactionId || 'None'}</strong>). As a result, your order <strong>#${order.id}</strong> has been cancelled. Please contact us if you believe this is a mistake.</p>`
          }
          <div style="background-color: #F9FAFB; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Total Amount:</strong> ₹${parseFloat(order.totalAmount).toFixed(2)}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            <p><strong>Order Status:</strong> ${order.orderStatus}</p>
          </div>
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">
            RJ Bakers - Mobile-First Ordering System.
          </p>
        </div>
      `;

      await sendNotification({
        to: customerEmail,
        subject: emailSubject,
        html: emailBody
      });
    }

    // Refetched
    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name', 'imageUrl'] }]
        }
      ]
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('❌ UPI verify payment error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Public (So customer checkout gets UPI ID/QR)
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      const defaultSlots = [
        { value: '10:00 AM', label: 'Morning (10:00 AM - 12:00 PM)', enabled: true },
        { value: '12:00 PM', label: 'Noon (12:00 PM - 02:00 PM)', enabled: true },
        { value: '02:00 PM', label: 'Afternoon (02:00 PM - 04:00 PM)', enabled: true },
        { value: '04:00 PM', label: 'Evening (04:00 PM - 06:00 PM)', enabled: true },
        { value: '06:00 PM', label: 'Late Evening (06:00 PM - 08:00 PM)', enabled: true },
        { value: '08:00 PM', label: 'Night (08:00 PM - 10:00 PM)', enabled: true }
      ];
      // Create defaults if not exists
      settings = await Setting.create({
        upiId: 'rjbakers@upi',
        phoneNumber: '+919876543210',
        qrImageUrl: '/uploads/default-qr.jpg',
        bakeryEmail: 'rjbakers@gmail.com',
        deliverySlots: JSON.stringify(defaultSlots),
        bakeryAddress: 'RJ Bakers, Shop No. 12, Baker Street, near Metro Station, New Delhi, Delhi 110001',
        deliveryChargeType: 'free',
        deliveryChargeAmount: 0.00
      });
    }
    res.json(settings);
  } catch (error) {
    console.error('❌ Get settings error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  const {
    upiId,
    phoneNumber,
    bakeryEmail,
    deliverySlots,
    bakeryAddress,
    deliveryChargeType,
    deliveryChargeAmount
  } = req.body;

  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    if (upiId !== undefined) settings.upiId = upiId;
    if (phoneNumber !== undefined) settings.phoneNumber = phoneNumber;
    if (bakeryEmail !== undefined) settings.bakeryEmail = bakeryEmail;
    if (deliverySlots !== undefined) settings.deliverySlots = deliverySlots;
    if (bakeryAddress !== undefined) settings.bakeryAddress = bakeryAddress;
    if (deliveryChargeType !== undefined) settings.deliveryChargeType = deliveryChargeType;
    if (deliveryChargeAmount !== undefined) {
      settings.deliveryChargeAmount = parseFloat(deliveryChargeAmount) || 0.00;
    }

    if (req.file) {
      settings.qrImageUrl = req.file.url;
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('❌ Update settings error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear all orders (except the 10 most recent ones)
// @route   DELETE /api/admin/orders/clear
// @access  Private/Admin
const clearAllOrders = async (req, res) => {
  try {
    // Find the 10 most recent orders
    const recentOrders = await Order.findAll({
      attributes: ['id'],
      order: [['id', 'DESC']],
      limit: 10
    });

    const recentIds = recentOrders.map(o => o.id);

    let orderItemsWhere = {};
    let ordersWhere = {};

    if (recentIds.length > 0) {
      const { Op } = require('sequelize');
      orderItemsWhere = { orderId: { [Op.notIn]: recentIds } };
      ordersWhere = { id: { [Op.notIn]: recentIds } };
    }

    // Delete items first to avoid foreign key conflicts
    await OrderItem.destroy({ where: orderItemsWhere });
    await Order.destroy({ where: ordersWhere });

    res.json({
      message: `Cleared older orders successfully. Preserved the ${recentIds.length} most recent orders.`
    });
  } catch (error) {
    console.error('❌ Clear older orders error:', error.message);
    res.status(500).json({ message: 'Server error clearing orders' });
  }
};

// @desc    Delete a single order manually
// @route   DELETE /api/admin/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Delete items first
    await OrderItem.destroy({ where: { orderId: order.id } });
    await order.destroy();

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('❌ Delete order error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getAdminOrders,
  updateOrderStatus,
  verifyPayment,
  getSettings,
  updateSettings,
  clearAllOrders,
  deleteOrder
};
