const Settings = require('../models/Settings');
const { sendCouponEmail } = require('../utils/sendEmail');
const User = require('../models/User');

const getOrCreate = async () => {
    let s = await Settings.findById('global');
    if (!s) s = await Settings.create({ _id: 'global' });
    return s;
};

exports.getSettings = async (req, res) => {
    try {
        res.json(await getOrCreate());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = await getOrCreate();
        const fields = [
            'deliveryFee','minOrderValue','platformFee','gstPercent','gstEnabled',
            'freeDeliveryAbove','freeDeliveryEnabled','orderingEnabled',
            'newUserDiscountEnabled','newUserDiscount',
            'coupons','hiddenCoupons','restrictedUsers',
        ];
        fields.forEach(f => { if (req.body[f] !== undefined) settings[f] = req.body[f]; });
        res.json(await settings.save());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Validate coupon — checks both public and hidden coupons
exports.validateCoupon = async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        if (!code) return res.status(400).json({ message: 'No code provided' });

        const settings = await getOrCreate();
        const allCoupons = [...(settings.coupons || []), ...(settings.hiddenCoupons || [])];
        const coupon = allCoupons.find(c => c.code === code.toUpperCase().trim());

        if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });

        // Check minimum order
        if (coupon.minOrder > 0 && subtotal < coupon.minOrder) {
            return res.status(400).json({
                message: `This coupon requires a minimum order of ₹${coupon.minOrder}`,
                minOrder: coupon.minOrder,
            });
        }

        let discount = coupon.type === 'percent'
            ? Math.round((subtotal * coupon.value) / 100)
            : coupon.value;
        discount = Math.min(discount, subtotal);

        res.json({ valid: true, coupon, discount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get public coupons only (for cart display)
exports.getPublicCoupons = async (req, res) => {
    try {
        const settings = await getOrCreate();
        // Only return public coupons, not hidden ones
        res.json(settings.coupons || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Send coupon to a user via email (admin action)
exports.sendCouponToUser = async (req, res) => {
    try {
        const { userId, couponCode, message } = req.body;
        if (!userId || !couponCode) return res.status(400).json({ message: 'userId and couponCode required' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const settings = await getOrCreate();
        const allCoupons = [...(settings.coupons || []), ...(settings.hiddenCoupons || [])];
        const coupon = allCoupons.find(c => c.code === couponCode.toUpperCase());
        if (!coupon) return res.status(404).json({ message: 'Coupon not found in settings' });

        const discountText = coupon.type === 'percent'
            ? `${coupon.value}% off your order${coupon.minOrder ? ` (min. ₹${coupon.minOrder})` : ''}`
            : `₹${coupon.value} off your order${coupon.minOrder ? ` (min. ₹${coupon.minOrder})` : ''}`;

        await sendCouponEmail(user.email, {
            customerName: user.firstName,
            couponCode: coupon.code,
            discountText,
            message: message || coupon.desc,
        });

        res.json({ message: `Coupon sent to ${user.email}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};