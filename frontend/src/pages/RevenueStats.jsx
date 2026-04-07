import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { 
    TrendingUp, ShoppingBag, PieChart, 
    Printer, MapPin, Calendar, Calculator, ArrowLeft, User, ClipboardList 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RevenueStats = () => {
    const [stats, setStats] = useState({ totalRevenue: 0, totalProfit: 0, totalOrders: 0, orders: [] });
    const [range, setRange] = useState('today'); 
    const [customDates, setCustomDates] = useState({ start: '', end: '' });
    const [calc, setCalc] = useState({ cost: '', sell: '' });
    const [selectedOrder, setSelectedOrder] = useState(null); 
    const navigate = useNavigate();

    const colors = {
        forest: '#1a4331',
        peach: '#fcd5ce',
        white: '#ffffff',
        slate: '#64748b',
        bg: '#f4f7f6'
    };

    const fetchStats = async () => {
        try {
            let url = `/orders/stats/revenue?range=${range}`;
            if (range === 'custom' && customDates.start && customDates.end) {
                url += `&start=${customDates.start}&end=${customDates.end}`;
            }
            const { data } = await API.get(url);
            setStats(data);
            if (data.orders.length > 0 && !selectedOrder) setSelectedOrder(data.orders[0]);
        } catch (err) { console.error("Fetch failed", err); }
    };

    useEffect(() => {
        if (range !== 'custom' || (customDates.start && customDates.end)) {
            fetchStats();
        }
    }, [range, customDates.start, customDates.end]);

    const printBill = (order) => {
        // 1. Create a hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const itemsHtml = order.orderItems.map(item => `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span>${item.qty}x ${item.name}</span>
                <span>₹${item.price * item.qty}</span>
            </div>
        `).join('');

        // 2. Build the high-quality bill layout with Address
        const billHtml = `
            <html>
                <head>
                    <title>Bill - ${order.orderId}</title>
                    <style>
                        body { 
                            font-family: 'Courier New', Courier, monospace; 
                            padding: 20px; 
                            color: #333; 
                            width: 300px; /* Standard Thermal Width */
                        }
                        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                        .footer { text-align: center; border-top: 2px dashed #000; padding-top: 10px; margin-top: 20px; font-size: 12px; }
                        .row { display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px; }
                        .details { font-size: 13px; line-height: 1.4; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2 style="margin:0;">TRUE EATS</h2>
                        <p style="margin:5px 0;">The way food was meant to be</p>
                    </div>
                    
                    <div class="details">
                        <p><strong>ID:</strong> ${order.orderId || order._id.slice(-6).toUpperCase()}</p>
                        <p><strong>Customer:</strong> ${order.user?.firstName || 'Guest'} ${order.user?.lastName || ''}</p>
                        <p><strong>Address:</strong> ${order.shippingAddress || 'No address available'}</p>
                        <p><strong>Date:</strong> ${new Date(order.completedAt || order.createdAt).toLocaleString()}</p>
                    </div>

                    <hr style="border:none; border-top:1px solid #eee;"/>
                    
                    <div style="margin: 15px 0;">${itemsHtml}</div>
                    
                    <div class="row">
                        <span>Total Amount</span>
                        <span>₹${order.totalPrice}</span>
                    </div>
                    
                    <div class="footer">
                        <p>Thank you for choosing True Eats!</p>
                        <p>Visit us again</p>
                    </div>
                </body>
            </html>
        `;

        // 3. Trigger the hidden print
        iframe.contentDocument.write(billHtml);
        iframe.contentDocument.close();

        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                // Remove iframe after print dialog is closed
                document.body.removeChild(iframe);
            }, 500);
        };
    };

    return (
        <div style={{ backgroundColor: colors.bg, minHeight: '100vh', padding: '40px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            
            {/* HEADER */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div onClick={() => navigate('/dashboard')} style={{ cursor:'pointer', padding:'10px', backgroundColor:'#fff', borderRadius:'12px' }}><ArrowLeft/></div>
                    <h1 style={{ margin:0, fontWeight: 800, color: colors.forest }}>Financial Analytics</h1>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e2e8f0', padding: '5px', borderRadius: '15px', gap: '5px' }}>
                    {['today', 'week', 'month', 'year'].map(r => (
                        <button key={r} onClick={() => setRange(r)} style={rangeBtnStyle(range === r, colors)}>{r}</button>
                    ))}
                    <div style={{ width: '1px', height: '25px', backgroundColor: '#cbd5e1', margin: '0 10px' }}></div>
                    <input type="date" value={customDates.start} onChange={(e) => {setCustomDates({...customDates, start: e.target.value}); setRange('custom');}} style={miniDateStyle} />
                    <span style={{ color: colors.slate, fontSize: '12px' }}>to</span>
                    <input type="date" value={customDates.end} onChange={(e) => {setCustomDates({...customDates, end: e.target.value}); setRange('custom');}} style={miniDateStyle} />
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                
                {/* LEFT: STATS & TABLE */}
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                        <StatCard icon={<TrendingUp color={colors.peach}/>} label="Total Revenue" val={`₹${stats.totalRevenue}`} bg={colors.forest} color="#fff" />
                        <StatCard icon={<PieChart color={colors.forest}/>} label="Net Profit" val={`₹${stats.totalProfit}`} bg="#fff" color={colors.forest} />
                        <StatCard icon={<ShoppingBag color={colors.forest}/>} label="Orders" val={stats.totalOrders} bg="#fff" color={colors.forest} />
                    </div>

                    <div style={{ backgroundColor: '#fff', borderRadius: '30px', padding: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ marginBottom: '20px' }}>Transaction History</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: colors.slate, fontSize: '14px', borderBottom: '1px solid #eee' }}>
                                    <th style={{ padding: '15px' }}>Order</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.orders.map(o => (
                                    <tr 
                                        key={o._id} 
                                        onClick={() => setSelectedOrder(o)}
                                        style={{ borderBottom: '1px solid #f8f8f8', cursor: 'pointer', backgroundColor: selectedOrder?._id === o._id ? '#f0fdf4' : 'transparent' }}
                                    >
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>#{o.orderId || o._id.slice(-6)}</td>
                                        <td>{o.user?.firstName}</td>
                                        <td style={{ fontWeight: 800 }}>₹{o.totalPrice}</td>
                                        <td style={{ color: '#16a34a', fontSize: '12px', fontWeight: 'bold' }}>COMPLETED</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT: CALCULATOR & INSPECTOR */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    {/* OLD PROFIT CALCULATOR LOGIC RESTORED */}
                    <div style={{ backgroundColor: colors.white, borderRadius: '30px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', color: colors.forest }}>
                            <Calculator /> <h3 style={{ margin: 0 }}>Profit Calculator</h3>
                        </div>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Total Cost (Ingredients + Labor)</label>
                            <input type="number" value={calc.cost} onChange={(e)=>setCalc({...calc, cost: e.target.value})} style={inputStyle} placeholder="₹ 0" />
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={labelStyle}>Selling Price</label>
                            <input type="number" value={calc.sell} onChange={(e)=>setCalc({...calc, sell: e.target.value})} style={inputStyle} placeholder="₹ 0" />
                        </div>

                        {calc.cost && calc.sell && (
                            <div style={{ backgroundColor: colors.forest, color: '#fff', padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
                                <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>Estimated Profit</p>
                                <h2 style={{ margin: '10px 0', fontSize: '36px', color: colors.peach }}>₹{calc.sell - calc.cost}</h2>
                                <div style={{ fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '10px' }}>
                                    Margin: {(( (calc.sell - calc.cost) / calc.sell ) * 100).toFixed(1)}%
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ORDER DETAILS INSPECTOR */}
                    {selectedOrder && (
                        <div style={{ backgroundColor: colors.white, borderRadius: '30px', padding: '30px', boxShadow: '0 15px 40px rgba(0,0,0,0.06)', border: `1px solid ${colors.peach}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: colors.forest }}>
                                <ClipboardList /> <h3 style={{ margin: 0 }}>Order Details</h3>
                            </div>
                            
                            <div style={detailRow}><User size={16}/> <strong>{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</strong></div>
                            <div style={detailRow}><MapPin size={16}/> <span>{selectedOrder.shippingAddress || 'No address available'}</span></div>
                            <div style={detailRow}><Calendar size={16}/> <span>{new Date(selectedOrder.completedAt || selectedOrder.createdAt).toLocaleString()}</span></div>
                            
                            <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '15px' }}>
                                <p style={{ fontSize: '12px', color: colors.slate, marginBottom: '10px', fontWeight: 'bold' }}>ITEMS ORDERED:</p>
                                {selectedOrder.orderItems.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
                                        <span>{item.qty}x {item.name}</span>
                                        <span style={{ fontWeight: 'bold' }}>₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px solid #ddd', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: colors.forest }}>
                                    <span>Total</span>
                                    <span>₹{selectedOrder.totalPrice}</span>
                                </div>
                            </div>

                            <button onClick={() => printBill(selectedOrder)} style={printBtnStyle}>
                                <Printer size={18} /> PRINT THIS BILL
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Styles
const rangeBtnStyle = (active, colors) => ({
    padding: '10px 15px', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight: 'bold', textTransform: 'capitalize',
    backgroundColor: active ? colors.forest : 'transparent', color: active ? '#fff' : colors.slate
});
const miniDateStyle = { border: 'none', background: 'transparent', fontSize: '12px', fontWeight: 'bold', color: '#1a4331', outline: 'none' };
const detailRow = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '14px', color: '#334155' };
const inputStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #eee', fontSize: '16px', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#64748b' };
const printBtnStyle = { width: '100%', backgroundColor: '#1a4331', color: '#fff', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };

const StatCard = ({ icon, label, val, bg, color }) => (
    <div style={{ backgroundColor: bg, color: color, padding: '25px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        {icon}
        <p style={{ margin: '15px 0 5px 0', opacity: 0.7, fontSize: '14px' }}>{label}</p>
        <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900 }}>{val}</h2>
    </div>
);

export default RevenueStats;