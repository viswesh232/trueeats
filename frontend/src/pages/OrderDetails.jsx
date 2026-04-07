import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, Package, User, MapPin, Truck, Send, Calendar, Mail, CheckCircle } from 'lucide-react';

const c = { forest: '#1a4331', peach: '#fcd5ce', white: '#fff', slate: '#64748b', chocolate: '#4a2c2a' };

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [updateMsg, setUpdateMsg]     = useState('');
    const [trackingId, setTrackingId]   = useState('');
    const [courierName, setCourierName] = useState('');
    const [sending, setSending]         = useState(false);
    const [toast, setToast]             = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (id) API.get(`/orders/${id}`).then(({ data }) => {
            setOrder(data);
            setTrackingId(data.trackingId || '');
            setCourierName(data.courierName || '');
        }).catch(console.error);
    }, [id]);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    // Send email update to customer (no dispatch required)
    const handleSendUpdate = async () => {
        if (!updateMsg.trim()) { alert('Enter a message to send'); return; }
        setSending(true);
        try {
            await API.post(`/orders/${id}/send-update`, {
                message: updateMsg,
                trackingId: trackingId || undefined,
                courierName: courierName || undefined,
            });
            // If tracking ID is provided, also mark as Shipped
            if (trackingId) {
                await API.put(`/orders/${id}/delivery`, { trackingId, courierName, customNote: updateMsg });
            }
            showToast('Email sent to customer ✓');
            setUpdateMsg('');
            API.get(`/orders/${id}`).then(({ data }) => setOrder(data));
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.message || err.message));
        }
        setSending(false);
    };

    if (!order) return <div style={{ padding: '50px', textAlign: 'center', color: c.slate }}>Loading...</div>;

    return (
        <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: c.forest, color: '#fff', padding: '14px 28px', borderRadius: '50px', fontWeight: 'bold', zIndex: 999, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} color={c.peach} /> {toast}
                </div>
            )}

            <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', color: c.forest, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', fontSize: '14px' }}>
                <ArrowLeft size={16} /> Back
            </button>

            <div style={{ maxWidth: '960px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <h1 style={{ color: c.forest, margin: 0, fontWeight: 900, fontSize: '22px' }}>Order #{order.orderId}</h1>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={statusBadge(order.status)}>{order.status}</span>
                        <span style={payBadge(order.paymentStatus)}>{order.paymentStatus} · {order.paymentMethod}</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>

                    {/* LEFT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        <div style={card}>
                            <h3 style={cardTitle}><User size={16} /> Customer</h3>
                            <Info label="Name"  val={`${order.user?.firstName} ${order.user?.lastName}`} />
                            <Info label="Email" val={order.user?.email} />
                            <Info label="Phone" val={order.user?.phoneNumber || '—'} />
                        </div>

                        <div style={card}>
                            <h3 style={cardTitle}><MapPin size={16} /> Shipping Address</h3>
                            <p style={{ margin: 0, color: '#475569', lineHeight: '1.6' }}>{order.shippingAddress || '—'}</p>
                        </div>

                        <div style={card}>
                            <h3 style={cardTitle}><Package size={16} /> Items Ordered</h3>
                            {order.orderItems.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                                    <span>{item.qty}× {item.name}</span>
                                    <span style={{ fontWeight: 'bold' }}>₹{item.price * item.qty}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontWeight: 'bold', color: c.forest, fontSize: '16px' }}>
                                <span>Total</span><span>₹{order.totalPrice}</span>
                            </div>
                            {(order.couponCode || order.couponDiscount > 0) && (
                                <div style={{ marginTop: '8px', fontSize: '13px', color: '#059669' }}>
                                    Coupon {order.couponCode} applied — ₹{order.couponDiscount} off
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT — Send update */}
                    <div style={{ position: 'sticky', top: '40px', height: 'fit-content' }}>
                        <div style={{ ...card, border: `2px solid ${c.forest}` }}>
                            <h3 style={cardTitle}><Mail size={16} /> Send Update to Customer</h3>
                            <p style={{ margin: '0 0 16px', fontSize: '13px', color: c.slate }}>
                                Type any message — shipment update, delay notice, special instructions. Customer receives it via email instantly.
                            </p>

                            <label style={lbl}>Message *</label>
                            <textarea
                                style={{ ...inp, height: '100px', fontFamily: 'inherit', resize: 'none', marginBottom: '16px' }}
                                value={updateMsg}
                                onChange={e => setUpdateMsg(e.target.value)}
                                placeholder="e.g. Your order has been packed and will be shipped tomorrow morning!"
                            />

                            <label style={lbl}>Tracking ID (optional)</label>
                            <input style={{ ...inp, marginBottom: '12px' }} value={trackingId}
                                onChange={e => setTrackingId(e.target.value)}
                                placeholder="Paste courier tracking ID if shipping" />

                            <label style={lbl}>Courier Name (optional)</label>
                            <input style={{ ...inp, marginBottom: '20px' }} value={courierName}
                                onChange={e => setCourierName(e.target.value)}
                                placeholder="e.g. Delhivery, DTDC, BlueDart" />

                            <p style={{ margin: '0 0 12px', fontSize: '12px', color: c.slate, backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                                💡 If you add a Tracking ID, the order will also be marked as <strong>Shipped</strong> automatically.
                            </p>

                            <button onClick={handleSendUpdate} disabled={sending} style={{
                                width: '100%', padding: '14px', backgroundColor: sending ? '#94a3b8' : c.forest,
                                color: '#fff', border: 'none', borderRadius: '12px',
                                fontWeight: 'bold', cursor: sending ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}>
                                <Send size={16} /> {sending ? 'Sending…' : 'Send Email Update'}
                            </button>

                            {order.customNote && (
                                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '10px', fontSize: '13px', color: '#065f46', borderLeft: '3px solid #10b981' }}>
                                    <strong>Last sent:</strong> {order.customNote}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Info = ({ label, val }) => (
    <div style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>{label}</span>
        <p style={{ margin: '2px 0 0', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{val}</p>
    </div>
);

const card  = { backgroundColor: '#fff', padding: '22px', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' };
const cardTitle = { margin: '0 0 16px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a4331', fontWeight: '800' };
const inp   = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '2px solid #f1f5f9', outline: 'none', boxSizing: 'border-box', fontSize: '14px', fontFamily: 'inherit' };
const lbl   = { display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' };
const statusBadge = (s) => ({ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: s === 'Shipped' ? '#d1fae5' : s === 'Cancelled' ? '#fee2e2' : '#fef3c7', color: s === 'Shipped' ? '#065f46' : s === 'Cancelled' ? '#991b1b' : '#92400e' });
const payBadge    = (s) => ({ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: s === 'Paid' ? '#d1fae5' : s === 'Failed' ? '#fee2e2' : '#fef3c7', color: s === 'Paid' ? '#065f46' : s === 'Failed' ? '#991b1b' : '#92400e' });

export default OrderDetail;