const Order = require('../models/Order');
const { sendOrderUpdateEmail } = require('../utils/sendEmail');
const crypto = require('crypto');

// ── Helper: generate a collision-safe orderId ────────────────────────────────
const generateOrderId = async () => {
    // Use timestamp + random suffix to avoid collisions
    const ts = Date.now().toString().slice(-6);
    const rand = Math.floor(Math.random() * 900 + 100);
    const candidate = `TRU-${ts}${rand}`;
    const exists = await Order.findOne({ orderId: candidate });
    if (exists) return generateOrderId(); // retry on collision (extremely rare)
    return candidate;
};

// ── 1. CREATE RAZORPAY ORDER ─────────────────────────────────────────────────
// @route POST /api/orders/create-razorpay-order
exports.createRazorpayOrder = async (req, res) => {
    try {
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
            key_id:     process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const { amount } = req.body; // amount in rupees from frontend
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay needs paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);
        res.json({ razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ message: 'Payment initiation failed', error: error.message });
    }
};

// ── 2. PLACE ORDER (after payment success) ───────────────────────────────────
// @route POST /api/orders
exports.createOrder = async (req, res) => {
    try {
        const {
            orderItems, totalPrice, shippingAddress,
            couponCode, couponDiscount, userDiscount,
            razorpayOrderId, razorpayPaymentId, razorpaySignature,
            paymentMethod
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }
        if (!shippingAddress) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }

        // Verify Razorpay signature if payment was online
        let paymentStatus = 'Pending';
        let paidAt = null;

        if (paymentMethod !== 'COD' && razorpayPaymentId && razorpaySignature) {
            const body = razorpayOrderId + '|' + razorpayPaymentId;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body)
                .digest('hex');

            if (expectedSignature === razorpaySignature) {
                paymentStatus = 'Paid';
                paidAt = new Date();
            } else {
                return res.status(400).json({ message: 'Payment verification failed. Order not placed.' });
            }
        }

        const orderId = await generateOrderId();

        const order = new Order({
            user: req.user._id,
            orderId,
            orderItems,
            shippingAddress,
            totalPrice,
            couponCode: couponCode || '',
            couponDiscount: couponDiscount || 0,
            userDiscount: userDiscount || 0,
            status: paymentStatus === 'Paid' ? 'Placed' : (paymentMethod === 'COD' ? 'Placed' : 'Pending Payment'),
            paymentMethod: paymentMethod || 'Online',
            paymentStatus,
            razorpayOrderId: razorpayOrderId || '',
            razorpayPaymentId: razorpayPaymentId || '',
            razorpaySignature: razorpaySignature || '',
            paidAt,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ── 3. GET SINGLE ORDER ──────────────────────────────────────────────────────
// @route GET /api/orders/:id
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        let order = null;

        // Try TRU-xxx style first
        if (id.startsWith('TRU-')) {
            order = await Order.findOne({ orderId: id })
                .populate('user', 'firstName lastName email phoneNumber address');
        }

        // Fall back to MongoDB _id
        if (!order) {
            order = await Order.findById(id)
                .populate('user', 'firstName lastName email phoneNumber address');
        }

        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Customers can only see their own orders
        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        // Handle invalid ObjectId format gracefully
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

// ── 4. GET ALL ORDERS (Admin) ────────────────────────────────────────────────
// @route GET /api/orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'firstName lastName email phoneNumber')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── 5. GET MY ORDERS (Customer) ──────────────────────────────────────────────
// @route GET /api/orders/myorders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('orderItems.product', 'name image')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── 6. UPDATE ORDER STATUS (Admin) ──────────────────────────────────────────
// @route PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = req.body.status;

        if (req.body.status === 'Delivered') {
            order.completedAt = new Date();
        } else {
            order.completedAt = null;
        }

        if (!order.shippingAddress) {
            order.shippingAddress = 'Address not provided';
        }

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── 7. UPDATE DELIVERY INFO (Admin) ─────────────────────────────────────────
// @route PUT /api/orders/:id/delivery
exports.updateDeliveryInfo = async (req, res) => {
    try {
        const { trackingId, courierName, customNote } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.trackingId  = trackingId || order.trackingId;
        order.courierName = courierName || 'Private Courier';
        order.customNote  = customNote || '';
        order.status      = 'Shipped';
        order.shippedAt   = new Date();

        await order.save();
        res.json({ message: 'Delivery info updated', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── 8. CONFIRM PAYMENT MANUALLY (Admin) ─────────────────────────────────────
// @route PUT /api/orders/:id/confirm-payment
exports.confirmPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.paymentStatus = 'Paid';
        order.paidAt = new Date();
        if (order.status === 'Pending Payment') {
            order.status = 'Placed';
        }

        await order.save();
        res.json({ message: 'Payment confirmed', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── 9. SEND ORDER UPDATE EMAIL (Admin) ──────────────────────────────────────
// @route POST /api/orders/:id/send-update
exports.sendOrderUpdate = async (req, res) => {
    try {
        const { message, trackingId, courierName } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        const order = await Order.findById(req.params.id)
            .populate('user', 'firstName lastName email');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        await sendOrderUpdateEmail(order.user.email, {
            customerName: order.user.firstName,
            orderId: order.orderId,
            message,
            trackingId,
            courierName,
        });

        res.json({ message: 'Email sent to ' + order.user.email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── 10. REVENUE STATS (Admin) ─────────────────────────────────────────────────
// @route GET /api/orders/stats/revenue
exports.getRevenueStats = async (req, res) => {
    try {
        const { range, start, end } = req.query;
        let startDate = new Date();
        let endDate   = new Date();

        if (range === 'today') {
            startDate = new Date(new Date().setHours(0, 0, 0, 0));
            endDate   = new Date(new Date().setHours(23, 59, 59, 999));
        } else if (range === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (range === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (range === 'year') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        } else if (range === 'custom' && start && end) {
            startDate = new Date(start); startDate.setHours(0, 0, 0, 0);
            endDate   = new Date(end);   endDate.setHours(23, 59, 59, 999);
        } else {
            startDate = new Date(0);
        }

        const orders = await Order.find({
            paymentStatus: 'Paid',
            $or: [
                { paidAt:     { $gte: startDate, $lte: endDate } },
                { createdAt:  { $gte: startDate, $lte: endDate } },
            ],
        }).populate('user', 'firstName lastName');

        const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);

        res.json({ totalRevenue, totalOrders: orders.length, orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};