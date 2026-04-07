import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import {
    Package, BarChart3, UtensilsCrossed, FileText,
    Search, Bike, Lock, Settings, TrendingUp,
    ShoppingBag, CheckCircle, AlertCircle, LogOut, ChevronRight, CreditCard
} from 'lucide-react';

const c = {
    forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a',
    white: '#ffffff', bg: '#f4f7f6', slate: '#64748b', light: '#f1f5f9',
};

const statusColor = (s) => ({
    Placed:     { bg: '#fef3c7', text: '#92400e' },
    Processing: { bg: '#dbeafe', text: '#1e40af' },
    Preparing:  { bg: '#ede9fe', text: '#5b21b6' },
    Delivered:  { bg: '#d1fae5', text: '#065f46' },
    Shipped:    { bg: '#cffafe', text: '#0e7490' },
    Cancelled:  { bg: '#fee2e2', text: '#991b1b' },
}[s] || { bg: '#f1f5f9', text: '#475569' });

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout, user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/orders')
            .then(({ data }) => { setOrders(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders.reduce((a, o) => a + o.totalPrice, 0);
    const pending = orders.filter(o => ['Placed', 'Processing', 'Preparing'].includes(o.status));
    const recentOrders = orders.slice(0, 6);

    const cards = [
        { title: 'Live Orders',       icon: Package,         path: '/admin/orders',          color: '#b4835e', bg: '#fdf6f0', desc: 'Packaging station' },
        { title: 'Revenue Stats',     icon: BarChart3,       path: '/admin/revenue',         color: '#d4a017', bg: '#fefce8', desc: 'Financial analytics' },
        { title: 'Edit Menu',         icon: UtensilsCrossed, path: '/admin/edit-menu',       color: '#6366f1', bg: '#eef2ff', desc: 'Add, remove, toggle items' },
        { title: 'Bill Generator',    icon: FileText,        path: '/admin/bills',           color: '#0ea5e9', bg: '#f0f9ff', desc: 'Print and custom bills' },
        { title: 'Search Customers',  icon: Search,          path: '/admin/customer-search', color: '#7b68ee', bg: '#f5f3ff', desc: 'Customer directory' },
        { title: 'Delivery Info',     icon: Bike,            path: '/admin/delivery',        color: '#ef4444', bg: '#fff1f2', desc: 'Dispatch and tracking' },
        { title: 'Permissions',       icon: Lock,            path: '/admin/permissions',     color: '#f59e0b', bg: '#fffbeb', desc: 'Manage user roles' },
        { title: 'System Settings',   icon: Settings,        path: '/admin/settings',        color: '#8b5cf6', bg: '#faf5ff', desc: 'Fees, discounts, coupons' },
        { title: 'Payments',           icon: CreditCard,      path: '/admin/payments',        color: '#059669', bg: '#ecfdf5', desc: 'Paid, pending, failed orders' },
    ];

    return (
        <div style={{ backgroundColor: c.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

            <nav style={{
                backgroundColor: c.forest, padding: '0 40px', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <UtensilsCrossed color={c.peach} size={26} />
                    <span style={{ color: c.white, fontWeight: '900', fontSize: '20px', letterSpacing: '1px' }}>TRUE EATS</span>
                    <span style={{ color: 'rgba(252,213,206,0.5)', fontSize: '13px', marginLeft: '4px' }}>Admin Panel</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                        Welcome, <b style={{ color: c.peach }}>{user?.firstName}</b>
                    </span>
                    <button onClick={logout} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        backgroundColor: 'rgba(255,255,255,0.1)', color: c.white,
                        border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px',
                        borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                    }}>
                        <LogOut size={15} /> Logout
                    </button>
                </div>
            </nav>

            <div style={{ padding: '36px 40px' }}>

                {/* Stats strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '36px' }}>
                    {[
                        { label: "Today's Revenue", value: loading ? '…' : `₹${todayRevenue.toLocaleString()}`, icon: TrendingUp, color: c.forest,   bg: c.peach   },
                        { label: "Today's Orders",  value: loading ? '…' : todayOrders.length,                   icon: ShoppingBag, color: '#0ea5e9', bg: '#e0f2fe' },
                        { label: 'Needs Attention', value: loading ? '…' : pending.length,                       icon: AlertCircle, color: '#f59e0b', bg: '#fef3c7' },
                        { label: 'Total Orders',    value: loading ? '…' : orders.length,                        icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
                    ].map((s, i) => (
                        <div key={i} style={{
                            backgroundColor: c.white, borderRadius: '20px', padding: '24px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '12px', color: c.slate, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                                <h2 style={{ margin: '8px 0 0', fontSize: '30px', fontWeight: '900', color: c.chocolate }}>{s.value}</h2>
                            </div>
                            <div style={{ backgroundColor: s.bg, padding: '14px', borderRadius: '14px' }}>
                                <s.icon size={24} color={s.color} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cards + recent orders */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px', alignItems: 'start' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '16px' }}>
                        {cards.map((card, i) => (
                            <div key={i} onClick={() => navigate(card.path)}
                                style={{
                                    backgroundColor: c.white, borderRadius: '20px', padding: '26px 20px',
                                    cursor: 'pointer', border: '1px solid #f0f0f0',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                                    transition: 'all 0.18s ease', display: 'flex', flexDirection: 'column', gap: '14px'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03)'; }}
                            >
                                <div style={{ backgroundColor: card.bg, width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <card.icon size={24} color={card.color} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: c.chocolate }}>{card.title}</h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: c.slate }}>{card.desc}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: card.color, fontWeight: '700', marginTop: 'auto' }}>
                                    Open <ChevronRight size={13} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent orders */}
                    <div style={{ backgroundColor: c.white, borderRadius: '24px', padding: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', position: 'sticky', top: '84px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: c.forest, fontWeight: '900', fontSize: '16px' }}>Recent Orders</h3>
                            <button onClick={() => navigate('/admin/orders')} style={{ border: 'none', background: 'none', color: c.forest, fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                View all <ChevronRight size={13} />
                            </button>
                        </div>

                        {loading ? <p style={{ textAlign: 'center', color: c.slate, padding: '30px 0' }}>Loading…</p>
                        : recentOrders.length === 0 ? <p style={{ textAlign: 'center', color: c.slate, padding: '30px 0' }}>No orders yet</p>
                        : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {recentOrders.map(o => {
                                    const sc = statusColor(o.status);
                                    return (
                                        <div key={o._id} onClick={() => navigate(`/admin/order/view/${o._id}`)}
                                            style={{ padding: '13px 15px', borderRadius: '14px', backgroundColor: c.light, cursor: 'pointer', border: '1px solid transparent', transition: '0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = c.forest}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '800', fontSize: '13px', color: c.forest }}>#{o.orderId}</span>
                                                <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '3px 9px', borderRadius: '20px', backgroundColor: sc.bg, color: sc.text }}>{o.status}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '12px', color: c.slate }}>
                                                <span>{o.user?.firstName} {o.user?.lastName}</span>
                                                <span style={{ fontWeight: '700', color: c.chocolate }}>₹{o.totalPrice}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {pending.length > 0 && (
                            <div onClick={() => navigate('/admin/orders')} style={{
                                marginTop: '18px', padding: '13px 15px', backgroundColor: '#fef3c7',
                                borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #fde68a'
                            }}>
                                <AlertCircle size={17} color="#f59e0b" />
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#92400e', flex: 1 }}>
                                    {pending.length} order{pending.length > 1 ? 's' : ''} need attention
                                </span>
                                <ChevronRight size={13} color="#f59e0b" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;