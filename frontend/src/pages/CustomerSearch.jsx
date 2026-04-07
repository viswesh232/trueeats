import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { Search, User, Mail, Phone, Package, ArrowLeft, ChevronRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerSearch = () => {
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const colors = { forest: '#1a4331', peach: '#fcd5ce', slate: '#64748b', light: '#f8fafc' };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await API.get('/orders');
                setOrders(data);
            } catch (err) {
                console.error("Error fetching orders:", err);
            }
        };
        fetchOrders();
    }, []);

    // LOGIC: Group orders by User so we see unique customers and their total stats
    const customers = {};
    orders.forEach(order => {
        if (order.user && !customers[order.user._id]) {
            customers[order.user._id] = {
                ...order.user,
                orderCount: 1,
                totalSpent: order.totalPrice,
                // We take the address from the order if the user profile address is missing
                displayAddress: order.shippingAddress || order.user.address || 'No address provided'
            };
        } else if (order.user) {
            customers[order.user._id].orderCount += 1;
            customers[order.user._id].totalSpent += order.totalPrice;
        }
    });

    const customerList = Object.values(customers).filter(c => 
        c.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                <ArrowLeft onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }} />
                <h1 style={{ margin: 0, color: colors.forest, fontWeight: 900 }}>Customer Directory 👥</h1>
            </div>

            {/* SEARCH BAR */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: colors.light, padding: '12px 20px', borderRadius: '15px' }}>
                    <Search size={20} color={colors.slate} />
                    <input 
                        placeholder="Search by Customer Name or Email..." 
                        style={{ border: 'none', background: 'transparent', marginLeft: '15px', outline: 'none', width: '100%', fontSize: '16px' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* CUSTOMER GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {customerList.map(user => (
                    <div key={user._id} style={customerCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <div style={{ backgroundColor: colors.peach, padding: '12px', borderRadius: '50%' }}>
                                <User color={colors.forest} size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: colors.forest }}>{user.firstName} {user.lastName}</h3>
                                <p style={{ margin: 0, fontSize: '12px', color: colors.slate }}>Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={infoRow}><Mail size={14} color={colors.forest}/> {user.email}</div>
                            <div style={infoRow}><Phone size={14} color={colors.forest}/> {user.phoneNumber || 'No phone'}</div>
                            <div style={{...infoRow, alignItems: 'flex-start'}}>
                                <MapPin size={14} color={colors.forest} style={{marginTop: '3px'}}/> 
                                <span style={{fontSize: '13px', lineHeight: '1.4'}}>{user.displayAddress}</span>
                            </div>
                            <div style={infoRow}><Package size={14} color={colors.forest}/> <strong>{user.orderCount} Orders</strong> (₹{user.totalSpent})</div>
                        </div>

                        <button 
                            onClick={() => navigate(`/admin/customer/${user._id}`)} 
                            style={viewBtn}
                        >
                            Open Full Profile <ChevronRight size={16}/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Styles
const customerCard = { backgroundColor: '#fff', borderRadius: '25px', padding: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
const infoRow = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#475569' };
const viewBtn = { width: '100%', marginTop: '20px', padding: '12px', border: 'none', borderRadius: '12px', backgroundColor: '#1a4331', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' };

export default CustomerSearch;