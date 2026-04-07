import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { MapPin, CreditCard, Truck, ArrowLeft, CheckCircle, Tag, X, Shield } from 'lucide-react';

const c = {
    forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a',
    white: '#fff', bg: '#fafafa', slate: '#64748b', light: '#f1f5f9',
};

const Checkout = () => {
    const { cartItems, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [settings, setSettings] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponResult, setCouponResult] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [userDiscount, setUserDiscount] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Online'); // Online | COD
    const [loading, setLoading] = useState(false);

    // Editable address
    const [address, setAddress] = useState({
        doorNo: user?.address?.doorNo || '',
        colony: user?.address?.colony || '',
        city:   user?.address?.city   || '',
        pincode: user?.address?.pincode || '',
    });

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (!cartItems.length) { navigate('/'); return; }

        API.get('/settings').then(({ data }) => setSettings(data)).catch(() => {});
        if (user._id) {
            API.get(`/settings/user-discount/${user._id}`)
                .then(({ data }) => setUserDiscount(data))
                .catch(() => {});
        }
    }, []);

    // ── Fee calculations ─────────────────────────────────────────────────────
    const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0);
    const rawDelivery = settings?.deliveryFee ?? 40;
    const freeThreshold = settings?.freeDeliveryEnabled ? (settings?.freeDeliveryAbove ?? 499) : Infinity;
    const deliveryFee = subtotal >= freeThreshold ? 0 : rawDelivery;
    const platformFee = settings?.platformFee ?? 5;
    const gstRate = (settings?.gstEnabled && settings?.gstPercent) ? settings.gstPercent : 0;
    const gstAmount = Math.round((subtotal * gstRate) / 100);
    const couponDiscount = couponResult?.discount || 0;
    const userDiscountAmt = userDiscount
        ? userDiscount.type === 'percent'
            ? Math.round((subtotal * userDiscount.value) / 100)
            : userDiscount.value
        : 0;
    const total = Math.max(0, subtotal + deliveryFee + platformFee + gstAmount - couponDiscount - userDiscountAmt);

    const handleApplyCoupon = async () => {
        setCouponError('');
        setCouponResult(null);
        try {
            const { data } = await API.post('/settings/validate-coupon', { code: couponCode, subtotal });
            setCouponResult(data);
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Invalid coupon');
        }
    };

    const buildShippingAddress = () =>
        `${address.doorNo}, ${address.colony}, ${address.city} - ${address.pincode}`.replace(/^,\s*|,\s*$/g, '').trim() || 'Address not provided';

    // ── Razorpay payment ─────────────────────────────────────────────────────
    const handleOnlinePayment = async () => {
        setLoading(true);
        try {
            // Step 1: Create Razorpay order on backend
            const { data: rzpOrder } = await API.post('/orders/create-razorpay-order', { amount: total });

            // Step 2: Open Razorpay checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: 'True Eats',
                description: `Order of ${cartItems.length} item${cartItems.length > 1 ? 's' : ''}`,
                order_id: rzpOrder.razorpayOrderId,
                prefill: {
                    name:  `${user.firstName}`,
                    email: user.email,
                },
                theme: { color: c.forest },
                handler: async (response) => {
                    // Step 3: Verify + place order on backend
                    try {
                        const orderData = buildOrderPayload({
                            razorpayOrderId:   rzpOrder.razorpayOrderId,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        const { data: createdOrder } = await API.post('/orders', orderData);
                        clearCart();
                        navigate('/payment-success', { state: { order: createdOrder } });
                    } catch (err) {
                        alert('Payment succeeded but order placement failed. Contact support with your payment ID: ' + response.razorpay_payment_id);
                    }
                },
                modal: { ondismiss: () => setLoading(false) },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                alert('Payment failed: ' + resp.error.description);
                setLoading(false);
            });
            rzp.open();
        } catch (err) {
            alert('Could not initiate payment: ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    // ── COD order ────────────────────────────────────────────────────────────
    const handleCOD = async () => {
        setLoading(true);
        try {
            const orderData = buildOrderPayload({ paymentMethod: 'COD' });
            const { data: createdOrder } = await API.post('/orders', orderData);
            clearCart();
            navigate('/payment-success', { state: { order: createdOrder } });
        } catch (err) {
            alert('Order failed: ' + (err.response?.data?.message || 'Server error'));
        }
        setLoading(false);
    };

    const buildOrderPayload = (extra = {}) => ({
        orderItems: cartItems.map(item => ({
            name: item.name, qty: item.qty, image: item.image,
            price: item.price, product: item._id,
        })),
        totalPrice: total,
        shippingAddress: buildShippingAddress(),
        couponCode: couponResult?.coupon?.code || '',
        couponDiscount,
        userDiscount: userDiscountAmt,
        paymentMethod,
        ...extra,
    });

    const handlePay = () => paymentMethod === 'COD' ? handleCOD() : handleOnlinePayment();

    const inp = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', backgroundColor: c.white };

    return (
        <>
            {/* Load Razorpay SDK */}
            <script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div style={{ minHeight: '100vh', backgroundColor: c.bg, fontFamily: "'Inter', sans-serif" }}>

                {/* Header */}
                <div style={{ backgroundColor: c.forest, padding: '18px 40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/cart')} style={{ border: 'none', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <h1 style={{ margin: 0, color: '#fff', fontWeight: '900', fontSize: '20px' }}>Checkout</h1>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                        <Shield size={14} /> Secure Checkout
                    </div>
                </div>

                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px', alignItems: 'start' }}>

                    {/* LEFT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Delivery Address */}
                        <div style={{ backgroundColor: c.white, borderRadius: '20px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                            <h3 style={{ margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px', color: c.forest, fontSize: '16px', fontWeight: '800' }}>
                                <MapPin size={18} /> Delivery Address
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {[
                                    { key: 'doorNo',  label: 'Door No / Flat' },
                                    { key: 'colony',  label: 'Colony / Area' },
                                    { key: 'city',    label: 'City' },
                                    { key: 'pincode', label: 'Pincode' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label style={{ fontSize: '11px', fontWeight: '700', color: c.slate, display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>{f.label}</label>
                                        <input value={address[f.key]} onChange={e => setAddress({ ...address, [f.key]: e.target.value })} style={inp} placeholder={f.label} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div style={{ backgroundColor: c.white, borderRadius: '20px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                            <h3 style={{ margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px', color: c.forest, fontSize: '16px', fontWeight: '800' }}>
                                <CreditCard size={18} /> Payment Method
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {[
                                    { id: 'Online', label: 'Pay Online', sub: 'UPI, Cards, NetBanking', icon: '💳' },
                                    { id: 'COD',    label: 'Cash on Delivery', sub: 'Pay when order arrives', icon: '💵' },
                                ].map(m => (
                                    <div key={m.id} onClick={() => setPaymentMethod(m.id)} style={{
                                        padding: '16px', borderRadius: '14px', cursor: 'pointer',
                                        border: `2px solid ${paymentMethod === m.id ? c.forest : '#e2e8f0'}`,
                                        backgroundColor: paymentMethod === m.id ? '#f0fdf4' : c.white,
                                        transition: '0.15s'
                                    }}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>{m.icon}</div>
                                        <div style={{ fontWeight: '800', fontSize: '14px', color: c.chocolate }}>{m.label}</div>
                                        <div style={{ fontSize: '12px', color: c.slate, marginTop: '2px' }}>{m.sub}</div>
                                        {paymentMethod === m.id && (
                                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: c.forest, fontSize: '12px', fontWeight: '700' }}>
                                                <CheckCircle size={13} /> Selected
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div style={{ backgroundColor: c.white, borderRadius: '20px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                            <h3 style={{ margin: '0 0 16px', color: c.forest, fontSize: '16px', fontWeight: '800' }}>Order Items ({cartItems.length})</h3>
                            {cartItems.map(item => (
                                <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', color: c.chocolate, fontSize: '14px' }}>{item.name}</div>
                                        <div style={{ fontSize: '12px', color: c.slate }}>Qty: {item.qty} × ₹{item.price}</div>
                                    </div>
                                    <div style={{ fontWeight: '800', color: c.forest }}>₹{item.price * item.qty}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT — Order Summary */}
                    <div style={{ backgroundColor: c.forest, borderRadius: '24px', padding: '28px', color: '#fff', position: 'sticky', top: '20px' }}>
                        <h3 style={{ margin: '0 0 20px', color: c.peach, fontSize: '16px', fontWeight: '900' }}>Order Summary</h3>

                        {/* Coupon */}
                        <div style={{ marginBottom: '20px' }}>
                            {couponResult ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Tag size={14} color={c.peach} />
                                        <span style={{ fontWeight: '800', fontSize: '13px' }}>{couponResult.coupon.code} — ₹{couponResult.discount} off</span>
                                    </div>
                                    <button onClick={() => { setCouponResult(null); setCouponCode(''); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#fca5a5', padding: 0 }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Coupon code" style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: 'none', backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff', outline: 'none', fontSize: '13px', fontFamily: 'monospace', letterSpacing: '1px' }} />
                                        <button onClick={handleApplyCoupon} style={{ padding: '10px 14px', backgroundColor: c.peach, color: c.chocolate, border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Apply</button>
                                    </div>
                                    {couponError && <p style={{ color: '#fca5a5', fontSize: '12px', margin: '6px 0 0', fontWeight: '600' }}>⚠ {couponError}</p>}
                                </>
                            )}
                        </div>

                        {/* Breakdown */}
                        {[
                            { label: 'Subtotal', val: `₹${subtotal}` },
                            { label: deliveryFee === 0 ? 'Delivery (Free 🎉)' : 'Delivery Fee', val: `₹${deliveryFee}`, green: deliveryFee === 0 },
                            platformFee > 0 ? { label: 'Platform Fee', val: `₹${platformFee}` } : null,
                            gstAmount > 0  ? { label: `GST (${gstRate}%)`, val: `₹${gstAmount}` } : null,
                            couponDiscount > 0 ? { label: 'Coupon Discount', val: `-₹${couponDiscount}`, green: true } : null,
                            userDiscountAmt > 0 ? { label: `Your Discount`, val: `-₹${userDiscountAmt}`, green: true } : null,
                        ].filter(Boolean).map((row, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', opacity: 0.85 }}>
                                <span>{row.label}</span>
                                <span style={{ fontWeight: 'bold', color: row.green ? '#6ee7b7' : '#fff' }}>{row.val}</span>
                            </div>
                        ))}

                        {settings?.freeDeliveryEnabled && deliveryFee > 0 && subtotal < settings.freeDeliveryAbove && (
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                                🚚 Add ₹{settings.freeDeliveryAbove - subtotal} more for free delivery
                            </div>
                        )}

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '20px', marginBottom: '24px' }}>
                            <span>Total</span>
                            <span style={{ color: c.peach }}>₹{total}</span>
                        </div>

                        <button onClick={handlePay} disabled={loading} style={{
                            width: '100%', padding: '16px', border: 'none',
                            backgroundColor: loading ? '#94a3b8' : c.peach,
                            color: c.chocolate, borderRadius: '14px',
                            fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}>
                            {loading ? 'Processing…' : paymentMethod === 'COD' ? '📦 Place Order (COD)' : '💳 Pay ₹' + total}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>
                            🔒 Powered by Razorpay · 256-bit SSL secured
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;