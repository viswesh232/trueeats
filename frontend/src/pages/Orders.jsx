import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { Package, Truck, Clock, CheckCircle, XCircle, ChefHat, ArrowLeft, ShoppingBag, MessageSquareQuote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const c = { forest: '#1a4331', peach: '#fcd5ce', white: '#ffffff', slate: '#64748b', chocolate: '#4a2c2a' };

const STATUS = {
    Placed:     { label: 'Order Placed',  icon: Clock,        bg: '#fef3c7', text: '#92400e' },
    Processing: { label: 'Processing',    icon: Clock,        bg: '#dbeafe', text: '#1e40af' },
    Preparing:  { label: 'Being Prepared',icon: ChefHat,      bg: '#ede9fe', text: '#5b21b6' },
    Delivered:  { label: 'Packed',        icon: Package,      bg: '#d1fae5', text: '#065f46' },
    Shipped:    { label: 'On the Way',    icon: Truck,        bg: '#cffafe', text: '#0e7490' },
    Cancelled:  { label: 'Cancelled',     icon: XCircle,      bg: '#fee2e2', text: '#991b1b' },
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        API.get('/orders/myorders')
            .then(({ data }) => setOrders(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.slate, fontFamily: 'sans-serif' }}>
            Loading your orders...
        </div>
    );
    if (!loading && orders.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <Package size={80} color="#cbd5e1" style={{ marginBottom: '20px' }} />
        <h2 style={{ color: '#1a4331', margin: '0 0 10px 0' }}>No orders yet</h2>
        <p style={{ color: '#64748b', marginBottom: '25px' }}>Time to treat yourself to something tasty!</p>
        <button onClick={() => navigate('/')} style={{ backgroundColor: '#1a4331', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
          Order Now
        </button>
      </div>
    );
    }

    return (
        <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

            {/* Header */}
            <div style={{ backgroundColor: c.forest, padding: '20px 40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => navigate('/')} style={{ border: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
                    <ArrowLeft size={18} />
                </button>
                <h1 style={{ margin: 0, color: '#fff', fontWeight: '900', fontSize: '22px' }}>My Orders</h1>
                <span style={{ marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                    {orders.length} total
                </span>
            </div>

            <div style={{ maxWidth: '780px', margin: '0 auto', padding: '32px 20px' }}>
                {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <ShoppingBag size={64} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: c.slate, fontWeight: '700', margin: '0 0 8px' }}>No orders yet</h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 24px' }}>You haven't placed any orders. Start browsing the menu!</p>
                        <button onClick={() => navigate('/')} style={{ padding: '12px 28px', backgroundColor: c.forest, color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Browse Menu
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {orders.map(order => {
                            const st = STATUS[order.status] || STATUS['Placed'];
                            const StatusIcon = st.icon;
                            return (
                                <div key={order._id} style={{ backgroundColor: c.white, borderRadius: '24px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>

                                    {/* Order header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                                        <div>
                                            <span style={{ fontSize: '11px', color: c.slate, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</span>
                                            <h3 style={{ margin: '3px 0 0', color: c.forest, fontWeight: '900', fontSize: '18px' }}>#{order.orderId}</h3>
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '50px', backgroundColor: st.bg, color: st.text, fontSize: '12px', fontWeight: '800' }}>
                                            <StatusIcon size={14} />
                                            {st.label}
                                        </div>
                                    </div>

                                    {/* Tracking box for shipped */}
                                    {order.status === 'Shipped' && (
                                        <div style={{ backgroundColor: '#f0fdf4', padding: '18px 20px', borderRadius: '16px', border: '1px solid #bbf7d0', marginBottom: '18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <Truck size={18} color="#16a34a" />
                                                <span style={{ fontWeight: '800', color: '#15803d', fontSize: '14px' }}>Your order is on the way!</span>
                                            </div>
                                            <p style={{ margin: '4px 0', fontSize: '13px', color: '#166534' }}>
                                                <b>Tracking ID:</b> {order.trackingId || 'Not provided'}
                                            </p>
                                            {order.customNote && (
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', backgroundColor: '#fff', padding: '10px 14px', borderRadius: '12px' }}>
                                                    <MessageSquareQuote size={15} color={c.forest} />
                                                    <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic', color: c.chocolate }}>{order.customNote}</p>
                                                </div>
                                            )}
                                            <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#4ade80', fontWeight: '600' }}>Estimated arrival: 3–7 business days</p>
                                        </div>
                                    )}

                                    {/* Items */}
                                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                        {order.orderItems.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', color: c.chocolate }}>
                                                <span>{item.qty}× {item.name}</span>
                                                <span style={{ fontWeight: '700' }}>₹{item.price * item.qty}</span>
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '14px', borderTop: '2px dashed #f1f5f9', fontWeight: '900', fontSize: '17px' }}>
                                            <span style={{ color: c.forest }}>Total Paid</span>
                                            <span>₹{order.totalPrice}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;