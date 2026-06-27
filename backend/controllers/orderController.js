const { Order, OrderItem, Product, Setting } = require('../models');
const { sendNotification } = require('../utils/nodemailer');

// Helper to format currency
const formatCurrency = (val) => `₹${parseFloat(val).toFixed(2)}`;

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (Can be authenticated or guest)
const createOrder = async (req, res) => {
  const {
    customerName,
    customerPhone,
    customerAddress,
    deliveryDate,
    deliveryTime,
    specialNote,
    paymentMethod,
    transactionId,
    items // JSON string or array
  } = req.body;

  try {
    if (!customerName || !customerPhone || !customerAddress || !deliveryDate || !deliveryTime || !paymentMethod || !items) {
      return res.status(400).json({ message: 'Please provide all required fields and cart items' });
    }

    let cartItems;
    try {
      cartItems = typeof items === 'string' ? JSON.parse(items) : items;
    } catch (e) {
      return res.status(400).json({ message: 'Invalid items format. Must be a valid JSON array' });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart items cannot be empty' });
    }

    // Verify products and calculate total on server side
    let calculatedTotal = 0;
    const verifiedItems = [];

    for (const item of cartItems) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }
      if (!product.available) {
        return res.status(400).json({ message: `Product "${product.name}" is currently unavailable` });
      }

      const itemTotal = parseFloat(product.price) * parseInt(item.quantity);
      calculatedTotal += itemTotal;

      verifiedItems.push({
        productId: product.id,
        name: product.name,
        quantity: parseInt(item.quantity),
        price: parseFloat(product.price)
      });
    }

    // Determine status
    let orderStatus = 'Pending';
    let paymentStatus = 'pending';
    let paymentScreenshot = null;

    if (paymentMethod === 'UPI') {
      orderStatus = 'Payment Verification Pending';
      if (req.file) {
        paymentScreenshot = req.file.url;
      }
    }

    // Retrieve delivery charge settings
    const settings = await Setting.findOne();
    let deliveryCharge = 0.00;
    if (settings && settings.deliveryChargeType === 'fixed') {
      deliveryCharge = parseFloat(settings.deliveryChargeAmount) || 0.00;
    }
    const grandTotal = calculatedTotal + deliveryCharge;

    // Create the order
    const order = await Order.create({
      userId: req.user ? req.user.id : null,
      customerName,
      customerPhone,
      customerAddress,
      deliveryDate,
      deliveryTime,
      specialNote,
      paymentMethod,
      paymentStatus,
      transactionId: paymentMethod === 'UPI' ? transactionId : null,
      paymentScreenshot,
      deliveryCharge,
      totalAmount: grandTotal,
      orderStatus
    });

    // Create order items
    for (const item of verifiedItems) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      });
    }

    // Fetch complete order details to return
    const completedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name', 'imageUrl'] }]
        }
      ]
    });

    // Retrieve bakery email settings for admin notification
    const adminEmail = settings ? settings.bakeryEmail : (process.env.ADMIN_EMAIL || 'admin@rjbakers.com');
    const customerEmail = req.user ? req.user.email : null;

    // Send notifications
    const itemsHtmlList = verifiedItems.map(
      (item) => `<li>${item.name} x ${item.quantity} - ${formatCurrency(item.price * item.quantity)}</li>`
    ).join('');

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #D97706; text-align: center;">🧁 RJ Bakers - Order Update 🧁</h2>
        <p>Hello ${customerName},</p>
        <p>Thank you for your order! We have received it and are reviewing details.</p>
        <div style="background-color: #FFFDF5; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px dashed #F59E0B;">
          <h3 style="margin-top: 0; color: #451A03;">Order Details</h3>
          <p><strong>Order ID:</strong> #${order.id}</p>
          <p><strong>Status:</strong> ${orderStatus}</p>
          <p><strong>Delivery:</strong> ${deliveryDate} at ${deliveryTime}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Delivery Address:</strong> ${customerAddress}</p>
          ${specialNote ? `<p><strong>Special Notes:</strong> "${specialNote}"</p>` : ''}
        </div>
        <h3 style="color: #451A03;">Items Ordered</h3>
        <ul>
          ${itemsHtmlList}
        </ul>
        <p style="font-size: 18px; font-weight: bold; color: #451A03; border-top: 1px solid #e5e7eb; padding-top: 10px;">
          Total: ${formatCurrency(calculatedTotal)}
        </p>
        <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">
          RJ Bakers, Mobile-First Ordering System.
        </p>
      </div>
    `;

    // Customer email (if registered/available)
    if (customerEmail) {
      await sendNotification({
        to: customerEmail,
        subject: `🧁 Order Received - RJ Bakers #${order.id}`,
        html: emailBody
      });
    }

    // Admin email
    const adminEmailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #451A03;">📢 New Order Received! (#${order.id})</h2>
        <p>A new order has been placed by <strong>${customerName}</strong> (${customerPhone}).</p>
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Status:</strong> ${orderStatus}</p>
          <p><strong>Requested Delivery:</strong> ${deliveryDate} at ${deliveryTime}</p>
          ${paymentMethod === 'UPI' ? `<p><strong>UPI Transaction ID:</strong> ${transactionId || 'None'}</p>` : ''}
        </div>
        <h3>Items</h3>
        <ul>${itemsHtmlList}</ul>
        <p style="font-size: 18px; font-weight: bold; border-top: 1px solid #e5e7eb; padding-top: 10px;">
          Total: ${formatCurrency(calculatedTotal)}
        </p>
        <p>Please log in to your Admin Dashboard to manage this order and verify payments.</p>
      </div>
    `;

    await sendNotification({
      to: adminEmail,
      subject: `🔔 New Order Alert #${order.id} - Action Required`,
      html: adminEmailBody
    });

    res.status(201).json(completedOrder);
  } catch (error) {
    console.error('❌ Create order error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name', 'imageUrl'] }]
        }
      ],
      order: [['id', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('❌ Fetch user orders error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public (or protected depending on needs, but public is nice for tracking orders without login)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name', 'imageUrl'] }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Optional: If user is logged in, confirm they own it or are admin
    // (For guest tracking, we let them track via Order ID directly)
    res.json(order);
  } catch (error) {
    console.error('❌ Fetch order detail error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
