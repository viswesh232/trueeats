const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    orderItems: [{
        name:    { type: String, required: true },
        qty:     { type: Number, required: true },
        image:   { type: String, required: true },
        price:   { type: Number, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    }],

    shippingAddress: { type: String, required: true },

    totalPrice:   { type: Number, required: true, default: 0.0 },
    couponCode:   { type: String, default: '' },
    couponDiscount: { type: Number, default: 0 },
    userDiscount:   { type: Number, default: 0 },

    orderId: { type: String, unique: true },

    status: {
        type: String,
        required: true,
        default: 'Pending Payment',
        enum: ['Pending Payment', 'Placed', 'Processing', 'Preparing', 'Shipped', 'Delivered', 'Cancelled']
    },

    // Payment
    paymentMethod:      { type: String, default: 'Online' },   // Online | COD
    paymentStatus:      { type: String, default: 'Pending', enum: ['Pending', 'Paid', 'Failed', 'Refunded'] },
    razorpayOrderId:    { type: String, default: '' },
    razorpayPaymentId:  { type: String, default: '' },
    razorpaySignature:  { type: String, default: '' },
    paidAt:             { type: Date },

    // Shipping
    trackingId:   { type: String, default: '' },
    courierName:  { type: String, default: '' },
    customNote:   { type: String, default: '' },
    completedAt:  { type: Date },
    shippedAt:    { type: Date },

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);