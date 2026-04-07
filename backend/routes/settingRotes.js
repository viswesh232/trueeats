const express = require('express');
const router  = express.Router();
const {
    getSettings, updateSettings, validateCoupon,
    getPublicCoupons, sendCouponToUser,
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/',                     getSettings);
router.put('/',                     protect, admin, updateSettings);
router.post('/validate-coupon',     validateCoupon);
router.get('/public-coupons',       getPublicCoupons);
router.post('/send-coupon',         protect, admin, sendCouponToUser);

module.exports = router;