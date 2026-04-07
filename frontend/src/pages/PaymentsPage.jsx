import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Clock, RefreshCw, IndianRupee, User, Filter } from 'lucide-react';

const c = { forest: '#1a4331', peach: '#fcd5ce', white: '#fff', slate: '#64748b', light: '#f1f5f9', chocolate: '#4a2c2a' };

const PAY_STATUS = {
    Paid:    { bg: '#d1fae5', text: '#065f46', icon: CheckCircle },
    Pending: { bg: '#fef3c7', text: '#92400e', icon: Clock },
    Failed:  { bg: '#fee2e2', text: '#991b1b', icon: XCircle },
    Refunded:{ bg: '#ede9fe', text: '#5b21b6', icon: RefreshCw },
};

const PaymentsPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all | Paid | Pending | Failed
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const { data } = await API.get('/orders');
            setOrders(data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleConfirmPayment = async (id) => {
        if (!window.confirm('Mark this payment as PAID manually?')) return;
        try {
            await API.put(`/orders/${id}/confirm-payment`);
            fetchOrders();
        } catch { alert('Failed'); }
    };

    const filtered = orders.filter(o => {
        const matchStatus = filter === 'all' || o.paymentStatus === filter;
        const matchSearch = !search || 
            o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
            o.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            o.user?.email?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    // Stats
    const totalPaid    = orders.filter(o => o.paymentStatus === 'Paid').reduce((a, o) => a + o.totalPrice, 0);
    const countPaid    = orders.filter(o => o.paymentStatus === 'Paid').length;
    const countPending = orders.filter(o => o.paymentStatus === 'Pending').length;
    const countFailed  = orders.filter(o => o.paymentStatus === 'Failed').length;

    return (
        <div style={{ backgroundColor: c.light, minHeight: '100vh', padding: '40px', fontFamily: "'Inter', sans-serif" }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={() => navigate('/dashboard')} style={{ border: 'none', background: c.white, borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <ArrowLeft size={20} color={c.forest} />
                </button>
                <div>
                    <h1 style={{ margin: 0, color: c.forest, fontWeight: '900', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CreditCard size={26} /> Payment Management
                    </h1>
                    <p style={{ margin: '4px 0 0', color: c.slate, fontSize: '13px' }}>Track all payments, confirm pending ones, view payment history per user</p>
                </div>
                <button onClick={fetchOrders} style={{ marginLeft: 'auto', border: 'none', background: c.white, borderRadius: '10px', padding: '10px', cursor: 'pointer', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <RefreshCw size={18} color={c.forest} />
                </button>
            </div>

            {/* Stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {[
                    { label: 'Total Collected', value: `₹${totalPaid.toLocaleString()}`, icon: IndianRupee, bg: c.peach, color: c.forest },
                    { label: 'Paid Orders',     value: countPaid,    icon: CheckCircle, bg: '#d1fae5', color: '#065f46' },
                    { label: 'Pending',         value: countPending, icon: Clock,       bg: '#fef3c7', color: '#92400e' },
                    { label: 'Failed',          value: countFailed,  icon: XCircle,     bg: '#fee2e2', color: '#991b1b' },
                ].map((s, i) => (
                    <div key={i} style={{ backgroundColor: c.white, borderRadius: '18px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '12px', color: c.slate, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                            <h2 style={{ margin: '6px 0 0', fontSize: '26px', fontWeight: '900', color: c.chocolate }}>{s.value}</h2>
                        </div>
                        <div style={{ backgroundColor: s.bg, padding: '12px', borderRadius: '12px' }}>
                            <s.icon size={22} color={s.color} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters + search */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
                <div style={{ display: 'flex', backgroundColor: c.white, borderRadius: '12px', padding: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', gap: '4px' }}>
                    {['all', 'Paid', 'Pending', 'Failed'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            fontWeight: 'bold', fontSize: '13px',
                            backgroundColor: filter === f ? c.forest : 'transparent',
                            color: filter === f ? '#fff' : c.slate,
                        }}>
                            {f === 'all' ? 'All' : f}
                        </button>
                    ))}
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by order ID, customer name or email..."
                        style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', boxSizing: 'border-box', backgroundColor: c.white }} />
                    <Filter size={16} color={c.slate} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: c.white, borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                            {['Order ID', 'Customer', 'Amount', 'Method', 'Payment Status', 'Order Status', 'Date', 'Action'].map(h => (
                                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: c.slate, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: c.slate }}>Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: c.slate }}>No payments found</td></tr>
                        ) : filtered.map(order => {
                            const ps = PAY_STATUS[order.paymentStatus] || PAY_STATUS['Pending'];
                            const PIcon = ps.icon;
                            return (
                                <tr key={order._id} style={{ borderBottom: '1px solid #f8fafc', transition: '0.1s' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{ fontWeight: '800', color: c.forest, fontSize: '14px' }}>#{order.orderId}</span>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ fontWeight: '600', color: c.chocolate, fontSize: '14px' }}>{order.user?.firstName} {order.user?.lastName}</div>
                                        <div style={{ fontSize: '12px', color: c.slate }}>{order.user?.email}</div>
                                    </td>
                                    <td style={{ padding: '14px 16px', fontWeight: '800', fontSize: '15px', color: c.forest }}>₹{order.totalPrice}</td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', backgroundColor: order.paymentMethod === 'COD' ? '#fef3c7' : '#e0f2fe', color: order.paymentMethod === 'COD' ? '#92400e' : '#0369a1' }}>
                                            {order.paymentMethod === 'COD' ? '💵 COD' : '💳 Online'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', backgroundColor: ps.bg, color: ps.text }}>
                                            <PIcon size={12} /> {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{ fontSize: '12px', color: c.slate, fontWeight: '600' }}>{order.status}</span>
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: '12px', color: c.slate }}>
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {order.paidAt && <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>Paid: {new Date(order.paidAt).toLocaleDateString('en-IN')}</div>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {order.paymentStatus === 'Pending' && order.paymentMethod !== 'COD' && (
                                                <button onClick={() => handleConfirmPayment(order._id)}
                                                    style={{ padding: '7px 12px', backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                                    ✓ Confirm
                                                </button>
                                            )}
                                            <button onClick={() => navigate(`/admin/order/view/${order._id}`)}
                                                style={{ padding: '7px 12px', backgroundColor: c.light, color: c.forest, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentsPage;