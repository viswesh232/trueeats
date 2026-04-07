import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Printer, PackageCheck, AlertCircle, ArrowLeft, CreditCard, CheckCircle, RefreshCw } from 'lucide-react';

const c = { forest: '#1a4331', peach: '#fcd5ce', white: '#fff', slate: '#64748b', light: '#f1f5f9' };

const STATUS_COLORS = {
    'Pending Payment': { bg: '#fee2e2', text: '#991b1b' },
    Placed:            { bg: '#fef3c7', text: '#92400e' },
    Processing:        { bg: '#dbeafe', text: '#1e40af' },
    Preparing:         { bg: '#ede9fe', text: '#5b21b6' },
    Delivered:         { bg: '#d1fae5', text: '#065f46' },
    Shipped:           { bg: '#cffafe', text: '#0e7490' },
    Cancelled:         { bg: '#f1f5f9', text: '#475569' },
};

const PAY_COLORS = {
    Pending: { bg: '#fef3c7', text: '#92400e' },
    Paid:    { bg: '#d1fae5', text: '#065f46' },
    Failed:  { bg: '#fee2e2', text: '#991b1b' },
};

const LiveOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('active'); // active | payment_pending | all
    const [showWarning, setShowWarning] = useState(false);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const { data } = await API.get('/orders');
            setOrders(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 6000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await API.put(`/orders/${id}/status`, { status: newStatus });
            if (newStatus === 'Delivered') { setShowWarning(true); setTimeout(() => setShowWarning(false), 5000); }
            fetchOrders();
        } catch { alert('Update failed. Check backend console.'); }
    };

    const handleConfirmPayment = async (id) => {
        if (!window.confirm('Manually confirm this payment as PAID?')) return;
        try {
            await API.put(`/orders/${id}/confirm-payment`);
            fetchOrders();
        } catch { alert('Failed to confirm payment'); }
    };

    const filtered = orders.filter(o => {
        if (filter === 'payment_pending') return o.paymentStatus === 'Pending' || o.status === 'Pending Payment';
        if (filter === 'active') return !['Shipped', 'Delivered', 'Cancelled'].includes(o.status);
        return true;
    });

    const pendingPaymentCount = orders.filter(o => o.paymentStatus === 'Pending' || o.status === 'Pending Payment').length;

    return (
        <div style={{ padding: '40px', backgroundColor: c.light, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {showWarning && (
                <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: c.forest, color: '#fff', padding: '14px 28px', borderRadius: '50px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    <AlertCircle color={c.peach} size={18} /> Order packed — waiting in Dispatch
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ border: 'none', background: c.white, borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <ArrowLeft size={20} color={c.forest} />
                    </button>
                    <h1 style={{ color: c.forest, fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px' }}>
                        <PackageCheck size={28} /> Packaging Station
                    </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={fetchOrders} style={{ border: 'none', background: c.white, borderRadius: '10px', padding: '10px', cursor: 'pointer', display: 'flex', color: c.forest, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <RefreshCw size={18} />
                    </button>
                    {/* Filter tabs */}
                    {[
                        { id: 'active', label: 'Active' },
                        { id: 'payment_pending', label: `Payment Pending${pendingPaymentCount > 0 ? ` (${pendingPaymentCount})` : ''}` },
                        { id: 'all', label: 'All Orders' },
                    ].map(f => (
                        <button key={f.id} onClick={() => setFilter(f.id)} style={{
                            padding: '9px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            fontWeight: 'bold', fontSize: '13px',
                            backgroundColor: filter === f.id ? c.forest : c.white,
                            color: filter === f.id ? '#fff' : c.slate,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }}>{f.label}</button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: c.slate, backgroundColor: c.white, borderRadius: '20px' }}>
                        No orders in this view
                    </div>
                ) : filtered.map(order => {
                    const sc = STATUS_COLORS[order.status] || STATUS_COLORS['Placed'];
                    const pc = PAY_COLORS[order.paymentStatus] || PAY_COLORS['Pending'];
                    return (
                        <div key={order._id} style={{
                            backgroundColor: c.white, borderRadius: '20px', padding: '22px 24px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderLeft: `6px solid ${order.status === 'Pending Payment' ? '#ef4444' : order.status === 'Delivered' ? '#94a3b8' : c.forest}`,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                    <span style={{ fontWeight: '900', fontSize: '17px', color: c.forest }}>#{order.orderId}</span>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '20px', backgroundColor: sc.bg, color: sc.text }}>{order.status}</span>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '20px', backgroundColor: pc.bg, color: pc.text, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CreditCard size={11} /> {order.paymentStatus} {order.paymentMethod === 'COD' ? '(COD)' : ''}
                                    </span>
                                </div>
                                <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#475569' }}>
                                    Customer: <strong>{order.user?.firstName} {order.user?.lastName}</strong> · ₹{order.totalPrice}
                                </p>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {order.orderItems.map((item, i) => (
                                        <span key={i} style={{ backgroundColor: c.light, padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>
                                            {item.qty}× {item.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '20px' }}>
                                {/* Manual payment confirm */}
                                {(order.paymentStatus === 'Pending' && order.paymentMethod !== 'COD') && (
                                    <button onClick={() => handleConfirmPayment(order._id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                                        <CheckCircle size={14} /> Confirm Pay
                                    </button>
                                )}

                                {/* Status dropdown — only for non-pending-payment orders */}
                                {order.status !== 'Pending Payment' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: c.slate, marginBottom: '4px', textTransform: 'uppercase' }}>Stage</label>
                                        <select value={order.status} onChange={e => handleStatusChange(order._id, e.target.value)}
                                            style={{ padding: '9px 12px', borderRadius: '10px', border: '2px solid #e2e8f0', fontWeight: 'bold', cursor: 'pointer', backgroundColor: c.white, color: c.forest, outline: 'none' }}>
                                            <option value="Placed">Placed</option>
                                            <option value="Processing">Packing</option>
                                            <option value="Preparing">Preparing</option>
                                            <option value="Delivered">Packed (Send to Dispatch)</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                )}

                                <button onClick={() => navigate(`/admin/order/view/${order._id}`)} style={{ padding: '9px 14px', backgroundColor: c.light, border: 'none', borderRadius: '10px', cursor: 'pointer', color: c.forest, fontWeight: 'bold', fontSize: '12px' }}>
                                    View →
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LiveOrders;