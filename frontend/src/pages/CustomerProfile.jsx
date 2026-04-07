import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, ExternalLink, Printer, Send, Tag, CheckCircle } from 'lucide-react';

const c = { forest: '#1a4331', peach: '#fcd5ce', light: '#f8fafc', white: '#fff', slate: '#64748b', chocolate: '#4a2c2a' };

const CustomerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [userOrders, setUserOrders] = useState([]);
    const [customer, setCustomer]     = useState(null);
    const [coupons, setCoupons]       = useState([]);
    const [toast, setToast]           = useState('');

    // Email compose state
    const [emailMsg, setEmailMsg]     = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);

    // Coupon send state
    const [selectedCoupon, setSelectedCoupon] = useState('');
    const [couponMsg, setCouponMsg]   = useState('');
    const [sendingCoupon, setSendingCoupon]   = useState(false);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    useEffect(() => {
        const load = async () => {
            try {
                const [ordersRes, settingsRes] = await Promise.all([
                    API.get('/orders'),
                    API.get('/settings'),
                ]);
                const filtered = ordersRes.data.filter(o => o.user?._id === id);
                setUserOrders(filtered);
                if (filtered.length > 0) setCustomer(filtered[0].user);
                // All coupons (public + hidden) for admin to send
                const all = [...(settingsRes.data.coupons || []), ...(settingsRes.data.hiddenCoupons || [])];
                setCoupons(all);
            } catch (err) { console.error(err); }
        };
        load();
    }, [id]);

    const handleSendEmail = async () => {
        if (!emailMsg.trim()) return alert('Enter a message');
        setSendingEmail(true);
        try {
            // Use the first order's ID to piggyback the send-update endpoint
            // If no orders exist, send a generic email
            if (userOrders.length > 0) {
                await API.post(`/orders/${userOrders[0]._id}/send-update`, { message: emailMsg });
            }
            showToast(`Email sent to ${customer.email}`);
            setEmailMsg('');
        } catch (err) { alert('Failed: ' + (err.response?.data?.message || err.message)); }
        setSendingEmail(false);
    };

    const handleSendCoupon = async () => {
        if (!selectedCoupon) return alert('Select a coupon to send');
        setSendingCoupon(true);
        try {
            await API.post('/settings/send-coupon', {
                userId: id,
                couponCode: selectedCoupon,
                message: couponMsg,
            });
            showToast(`Coupon ${selectedCoupon} sent to ${customer.email}`);
            setSelectedCoupon('');
            setCouponMsg('');
        } catch (err) { alert('Failed: ' + (err.response?.data?.message || err.message)); }
        setSendingCoupon(false);
    };

    const handlePrint = (order) => {
        const w = window.open('', '_blank');
        w.document.write(`<html><head><title>Invoice</title>
        <style>body{font-family:'Courier',monospace;padding:20px;}h1{text-align:center;}table{width:100%;border-collapse:collapse;}th{border-bottom:1px solid #000;text-align:left;padding:6px;}td{padding:6px;}.total{text-align:right;font-weight:bold;margin-top:20px;border-top:2px solid #000;padding-top:10px;}</style>
        </head><body>
        <h1>TRUE EATS — Invoice</h1>
        <p><b>Order:</b> #${order.orderId} &nbsp; <b>Date:</b> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><b>Customer:</b> ${customer?.firstName} ${customer?.lastName} · ${customer?.phoneNumber || ''}</p>
        <p><b>Address:</b> ${order.shippingAddress}</p>
        <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>${order.orderItems.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.price * i.qty}</td></tr>`).join('')}</tbody>
        </table>
        <div class="total">Total Paid: ₹${order.totalPrice}</div>
        <script>window.print();window.close();</script></body></html>`);
        w.document.close();
    };

    if (!customer) return <div style={{ padding: '100px', textAlign: 'center', color: c.slate }}>Loading Profile...</div>;

    const inp = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', backgroundColor: c.light };

    return (
        <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

            {toast && (
                <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: c.forest, color: '#fff', padding: '14px 28px', borderRadius: '50px', fontWeight: 'bold', zIndex: 999, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    <CheckCircle size={16} color={c.peach} /> {toast}
                </div>
            )}

            <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', color: c.forest, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '14px' }}>
                <ArrowLeft size={16} /> Back to Directory
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>

                {/* LEFT — Customer info + actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Bio card */}
                    <div style={profileCard}>
                        <div style={avatarCircle}>{customer.firstName?.[0] || '?'}</div>
                        <h2 style={{ textAlign: 'center', color: c.forest, margin: '12px 0 4px', fontSize: '18px', fontWeight: '900' }}>{customer.firstName} {customer.lastName}</h2>
                        <p style={{ textAlign: 'center', color: c.slate, fontSize: '13px', margin: '0 0 16px' }}>
                            {userOrders.length} order{userOrders.length !== 1 ? 's' : ''} · ₹{userOrders.reduce((a, o) => a + o.totalPrice, 0)} total
                        </p>
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                            <DR icon={<Mail size={14}/>}  label="Email"   val={customer.email} />
                            <DR icon={<Phone size={14}/>} label="Phone"   val={customer.phoneNumber || '—'} />
                            <DR icon={<MapPin size={14}/>}label="Address" val={userOrders[0]?.shippingAddress || '—'} />
                        </div>
                    </div>

                    {/* Send message */}
                    <div style={profileCard}>
                        <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '800', color: c.forest, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={15} /> Send Message
                        </h3>
                        <textarea value={emailMsg} onChange={e => setEmailMsg(e.target.value)}
                            placeholder="Type a message to send to this customer via email..."
                            rows={3} style={{ ...inp, resize: 'none', marginBottom: '10px' }} />
                        <button onClick={handleSendEmail} disabled={sendingEmail} style={{ width: '100%', padding: '10px', backgroundColor: c.forest, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Send size={14} /> {sendingEmail ? 'Sending…' : 'Send Email'}
                        </button>
                    </div>

                    {/* Send coupon */}
                    <div style={profileCard}>
                        <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '800', color: c.forest, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Tag size={15} /> Send Coupon via Email
                        </h3>
                        <select value={selectedCoupon} onChange={e => setSelectedCoupon(e.target.value)}
                            style={{ ...inp, marginBottom: '8px', cursor: 'pointer' }}>
                            <option value="">Select coupon to send…</option>
                            {coupons.map(cp => (
                                <option key={cp._id || cp.code} value={cp.code}>
                                    {cp.code} — {cp.type === 'percent' ? `${cp.value}%` : `₹${cp.value}`} off{cp.minOrder ? ` (min ₹${cp.minOrder})` : ''}
                                </option>
                            ))}
                        </select>
                        <textarea value={couponMsg} onChange={e => setCouponMsg(e.target.value)}
                            placeholder="Optional personal message..." rows={2}
                            style={{ ...inp, resize: 'none', marginBottom: '10px' }} />
                        <button onClick={handleSendCoupon} disabled={sendingCoupon} style={{ width: '100%', padding: '10px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Tag size={14} /> {sendingCoupon ? 'Sending…' : 'Send Coupon'}
                        </button>
                    </div>
                </div>

                {/* RIGHT — Order history */}
                <div style={profileCard}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: c.forest, fontWeight: '800' }}>
                        <ShoppingBag size={20} /> Order History
                    </h3>
                    {userOrders.length === 0 ? (
                        <p style={{ color: c.slate, textAlign: 'center', padding: '30px' }}>No orders yet</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {['Order ID', 'Date', 'Status', 'Payment', 'Total', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {userOrders.map(order => (
                                    <tr key={order._id} style={{ borderBottom: '1px solid #f8fafc', fontSize: '13px' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: c.forest }}>#{order.orderId}</td>
                                        <td style={{ padding: '12px', color: c.slate }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={stTag(order.status)}>{order.status}</span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={payTag(order.paymentStatus)}>{order.paymentStatus}</span>
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>₹{order.totalPrice}</td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => handlePrint(order)} style={tinyBtn} title="Print Invoice"><Printer size={13} /></button>
                                                <button onClick={() => navigate(`/admin/order/view/${order._id}`)} style={tinyBtn} title="View & Update"><ExternalLink size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

const DR = ({ icon, label, val }) => (
    <div style={{ marginBottom: '14px' }}>
        <small style={{ color: '#94a3b8', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase', fontSize: '10px' }}>{icon} {label}</small>
        <p style={{ margin: '3px 0 0', fontWeight: '600', color: '#1e293b', fontSize: '13px', wordBreak: 'break-word' }}>{val}</p>
    </div>
);

const profileCard  = { backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' };
const avatarCircle = { width: '64px', height: '64px', backgroundColor: '#1a4331', color: '#fcd5ce', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '900', margin: '0 auto' };
const tinyBtn      = { background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#1a4331', display: 'flex', alignItems: 'center' };
const stTag  = (s) => ({ padding: '3px 8px', borderRadius: '14px', fontSize: '11px', fontWeight: 'bold', backgroundColor: s === 'Shipped' ? '#d1fae5' : s === 'Cancelled' ? '#fee2e2' : '#fef3c7', color: s === 'Shipped' ? '#065f46' : s === 'Cancelled' ? '#991b1b' : '#92400e' });
const payTag = (s) => ({ padding: '3px 8px', borderRadius: '14px', fontSize: '11px', fontWeight: 'bold', backgroundColor: s === 'Paid' ? '#d1fae5' : s === 'Failed' ? '#fee2e2' : '#fef3c7', color: s === 'Paid' ? '#065f46' : s === 'Failed' ? '#991b1b' : '#92400e' });

export default CustomerProfile;