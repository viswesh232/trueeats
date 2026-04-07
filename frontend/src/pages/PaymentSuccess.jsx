import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';

const c = { forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a', white: '#fff' };

const PaymentSuccess = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const order = state?.order;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: c.peach, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '20px' }}>
            <div style={{ backgroundColor: c.white, borderRadius: '32px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(26,67,49,0.15)' }}>

                {/* Success icon */}
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle size={44} color="#059669" />
                </div>

                <h1 style={{ margin: '0 0 8px', fontWeight: '900', fontSize: '26px', color: c.forest }}>
                    {order?.paymentMethod === 'COD' ? 'Order Placed!' : 'Payment Successful!'}
                </h1>
                <p style={{ margin: '0 0 28px', color: '#64748b', fontSize: '15px' }}>
                    {order?.paymentMethod === 'COD'
                        ? 'Your order has been placed. Pay when it arrives.'
                        : 'Your payment was processed and your order is confirmed.'}
                </p>

                {order && (
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Order ID</span>
                            <span style={{ fontSize: '13px', fontWeight: '900', color: c.forest }}>#{order.orderId}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Amount</span>
                            <span style={{ fontSize: '13px', fontWeight: '900', color: c.chocolate }}>₹{order.totalPrice}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Payment</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: order.paymentMethod === 'COD' ? '#f59e0b' : '#059669' }}>
                                {order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '✅ Paid Online'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Items</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                                {order.orderItems?.length} item{order.orderItems?.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button onClick={() => navigate('/orders')} style={{
                        width: '100%', padding: '15px', backgroundColor: c.forest, color: '#fff',
                        border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px'
                    }}>
                        <Package size={18} /> Track My Order <ArrowRight size={16} />
                    </button>
                    <button onClick={() => navigate('/')} style={{
                        width: '100%', padding: '15px', backgroundColor: c.peach, color: c.chocolate,
                        border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px'
                    }}>
                        <Home size={18} /> Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;