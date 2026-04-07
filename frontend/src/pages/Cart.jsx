import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag, Tag, X, CheckCircle } from 'lucide-react';

const c = { peach: '#fcd5ce', forestGreen: '#1a4331', chocolate: '#4a2c2a', white: '#ffffff', light: '#f1f5f9' };

const Cart = () => {
    const { cartItems, addToCart, removeFromCart, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [settings, setSettings]       = useState(null);
    const [couponCode, setCouponCode]   = useState('');
    const [couponResult, setCouponResult] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [userDiscount, setUserDiscount] = useState(null);
    const [publicCoupons, setPublicCoupons] = useState([]);

    useEffect(() => {
        API.get('/settings').then(({ data }) => setSettings(data)).catch(() => {});
        API.get('/settings/public-coupons').then(({ data }) => setPublicCoupons(data)).catch(() => {});
        if (user?._id) {
            API.get(`/settings/user-discount/${user._id}`)
                .then(({ data }) => setUserDiscount(data)).catch(() => {});
        }
    }, [user]);

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const rawDelivery = settings?.deliveryFee ?? 40;
    const freeThreshold = settings?.freeDeliveryEnabled ? (settings?.freeDeliveryAbove ?? 499) : Infinity;
    const deliveryFee = subtotal === 0 ? 0 : subtotal >= freeThreshold ? 0 : rawDelivery;
    const platformFee = settings?.platformFee ?? 5;
    const gstRate = (settings?.gstEnabled && settings?.gstPercent) ? settings.gstPercent : 0;
    const gstAmount = Math.round((subtotal * gstRate) / 100);
    const couponDiscount = couponResult?.discount || 0;
    const userDiscountAmt = userDiscount
        ? (userDiscount.type === 'percent' ? Math.round(subtotal * userDiscount.value / 100) : userDiscount.value) : 0;
    const total = Math.max(0, subtotal + deliveryFee + platformFee + gstAmount - couponDiscount - userDiscountAmt);

    const handleApplyCoupon = async () => {
        setCouponError(''); setCouponResult(null);
        try {
            const { data } = await API.post('/settings/validate-coupon', { code: couponCode, subtotal });
            setCouponResult(data);
        } catch (err) { setCouponError(err.response?.data?.message || 'Invalid coupon'); }
    };

    const handleCheckout = () => {
        if (!user) { navigate('/login'); return; }
        if (settings && !settings.orderingEnabled) { alert('Ordering is currently disabled. Please try later.'); return; }
        if (settings && subtotal < settings.minOrderValue) { alert(`Minimum order value is ₹${settings.minOrderValue}.`); return; }
        navigate('/checkout');
    };

    if (cartItems.length === 0) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: c.peach }}>
            <ShoppingBag size={80} color={c.forestGreen} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h2 style={{ color: c.forestGreen }}>Your basket is empty</h2>
            <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '12px 30px', backgroundColor: c.forestGreen, color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>
                Go Back to Menu
            </button>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fdfcfb', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ padding: '40px 60px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <ArrowLeft onClick={() => navigate('/')} style={{ cursor: 'pointer' }} color={c.chocolate} />
                <h1 style={{ margin: 0, color: c.chocolate, fontWeight: '800' }}>Your Basket</h1>
                {settings && !settings.orderingEnabled && (
                    <div style={{ marginLeft: 'auto', backgroundColor: '#fee2e2', color: '#991b1b', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                        ⚠ Ordering is currently disabled
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', padding: '0 60px 60px' }}>

                {/* Items */}
                <div style={{ backgroundColor: c.white, borderRadius: '30px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                    {cartItems.map(item => (
                        <div key={item._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #eee' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '15px', objectFit: 'cover' }} />
                                <div>
                                    <h4 style={{ margin: '0 0 5px', color: c.chocolate }}>{item.name}</h4>
                                    <p style={{ margin: 0, fontWeight: 'bold', color: c.forestGreen }}>₹{item.price}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8f8f8', padding: '5px 12px', borderRadius: '10px' }}>
                                    <Minus size={16} style={{ cursor: 'pointer' }} onClick={() => removeFromCart(item)} />
                                    <span style={{ fontWeight: 'bold' }}>{item.qty}</span>
                                    <Plus size={16} style={{ cursor: 'pointer' }} onClick={() => addToCart(item)} />
                                </div>
                                <p style={{ width: '60px', textAlign: 'right', fontWeight: 'bold', color: c.chocolate }}>₹{item.price * item.qty}</p>
                            </div>
                        </div>
                    ))}
                    <button onClick={clearCart} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Trash2 size={14} /> Clear all items
                    </button>

                    {/* Available public coupons */}
                    {publicCoupons.length > 0 && (
                        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
                            <p style={{ margin: '0 0 10px', fontWeight: '800', fontSize: '13px', color: c.forestGreen, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Tag size={13} /> Available Offers
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {publicCoupons.map(cp => (
                                    <div key={cp._id || cp.code} onClick={() => { setCouponCode(cp.code); setCouponResult(null); setCouponError(''); }}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #d1fae5', cursor: 'pointer' }}>
                                        <div>
                                            <span style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '14px', color: c.forestGreen, letterSpacing: '1px' }}>{cp.code}</span>
                                            {cp.desc && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#64748b' }}>{cp.desc}</span>}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#059669' }}>
                                                {cp.type === 'percent' ? `${cp.value}% off` : `₹${cp.value} off`}
                                            </span>
                                            {cp.minOrder > 0 && <div style={{ fontSize: '11px', color: '#64748b' }}>Min ₹{cp.minOrder}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Coupon */}
                    <div style={{ marginTop: '24px', padding: '18px', backgroundColor: '#f8fafc', borderRadius: '14px' }}>
                        <p style={{ margin: '0 0 10px', fontWeight: '800', fontSize: '13px', color: c.forestGreen, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Tag size={13} /> Have a coupon?
                        </p>
                        {couponResult ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#d1fae5', padding: '10px 14px', borderRadius: '10px', border: '1px solid #6ee7b7' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle size={15} color="#059669" />
                                    <span style={{ fontWeight: '800', color: '#065f46', fontSize: '13px' }}>{couponResult.coupon.code} — ₹{couponResult.discount} off</span>
                                </div>
                                <button onClick={() => { setCouponResult(null); setCouponCode(''); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', padding: 0 }}>
                                    <X size={15} />
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                    placeholder="Enter coupon code"
                                    style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', fontFamily: 'monospace', letterSpacing: '1px', fontWeight: '700' }} />
                                <button onClick={handleApplyCoupon} style={{ padding: '10px 18px', backgroundColor: c.forestGreen, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Apply</button>
                            </div>
                        )}
                        {couponError && <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0', fontWeight: '600' }}>⚠ {couponError}</p>}
                    </div>
                </div>

                {/* Summary */}
                <div style={{ backgroundColor: c.forestGreen, borderRadius: '30px', padding: '30px', color: c.white, height: 'fit-content', boxShadow: '0 15px 35px rgba(26,67,49,0.2)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', color: c.peach }}>Summary</h3>
                    {[
                        { label: 'Subtotal', val: `₹${subtotal}` },
                        { label: deliveryFee === 0 && subtotal > 0 ? 'Delivery (Free!)' : 'Delivery Fee', val: `₹${deliveryFee}`, green: deliveryFee === 0 && subtotal > 0 },
                        platformFee > 0 ? { label: 'Platform Fee', val: `₹${platformFee}` } : null,
                        gstAmount > 0 ? { label: `GST (${gstRate}%)`, val: `₹${gstAmount}` } : null,
                        couponDiscount > 0 ? { label: 'Coupon Discount', val: `-₹${couponDiscount}`, green: true } : null,
                        userDiscountAmt > 0 ? { label: 'Your Discount', val: `-₹${userDiscountAmt}`, green: true } : null,
                    ].filter(Boolean).map((r, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', opacity: 0.85 }}>
                            <span style={{ fontSize: '14px' }}>{r.label}</span>
                            <span style={{ fontWeight: 'bold', color: r.green ? '#6ee7b7' : '#fff' }}>{r.val}</span>
                        </div>
                    ))}

                    {settings?.freeDeliveryEnabled && deliveryFee > 0 && subtotal > 0 && (
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                            🚚 Add ₹{settings.freeDeliveryAbove - subtotal} more for free delivery
                        </div>
                    )}

                    {settings && subtotal > 0 && subtotal < settings.minOrderValue && (
                        <div style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: '#fca5a5', fontWeight: '600' }}>
                            ⚠ Min order ₹{settings.minOrderValue} — add ₹{settings.minOrderValue - subtotal} more
                        </div>
                    )}

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '18px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '900' }}>
                        <span>Total</span>
                        <span style={{ color: c.peach }}>₹{total}</span>
                    </div>

                    <button onClick={handleCheckout}
                        disabled={!!(settings && (!settings.orderingEnabled || subtotal < settings.minOrderValue))}
                        style={{
                            width: '100%', padding: '18px', border: 'none',
                            backgroundColor: (settings && (!settings.orderingEnabled || subtotal < settings.minOrderValue)) ? '#94a3b8' : c.peach,
                            color: c.chocolate, borderRadius: '15px', fontWeight: 'bold',
                            cursor: 'pointer', fontSize: '16px', transition: '0.3s'
                        }}>
                        PROCEED TO CHECKOUT →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;