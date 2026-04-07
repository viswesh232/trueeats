import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext'; 
import { ShoppingCart, Star, MapPin, Phone, Utensils, Minus, Plus } from 'lucide-react';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [activeCategory, setActiveCategory] = useState('All');
    
    // Local state to track quantities on the UI before adding to cart
    const [localQtys, setLocalQtys] = useState({});

    const { user, logout } = useContext(AuthContext);
    const { cartItems, addToCart } = useContext(CartContext); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const { data } = await API.get('/products');
                setProducts(data);
                setFilteredProducts(data);
                
                // Initialize local quantities to 1 for all products
                const initialQtys = {};
                data.forEach(p => initialQtys[p._id] = 1);
                setLocalQtys(initialQtys);

                const uniqueCats = ['All', ...new Set(data.map(item => item.category))];
                setCategories(uniqueCats);
            } catch (err) { console.error(err); }
        };
        fetchMenu();
    }, []);

    const handleLocalQtyChange = (id, delta) => {
        setLocalQtys(prev => ({
            ...prev,
            [id]: Math.max(1, (prev[id] || 1) + delta)
        }));
    };

    const filterCategory = (cat) => {
        setActiveCategory(cat);
        setFilteredProducts(cat === 'All' ? products : products.filter(p => p.category === cat));
    };

    const myprofile = () => {
        navigate('/profile');
    }

    const handleLogoutClick = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            logout();
            navigate('/');
        }
    };

    const colors = {
        peach: '#fcd5ce',
        forestGreen: '#1a4331',
        chocolate: '#4a2c2a',
        white: '#ffffff',
        darkFooter: '#1e293b' 
    };

    return (
        <div style={{ backgroundColor: colors.peach, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            
            {/* 1. NAVBAR */}
            <nav style={{ 
                display: 'flex', justifyContent: 'space-between', padding: '15px 60px', 
                backgroundColor: 'rgba(252, 213, 206, 0.9)', backdropFilter: 'blur(10px)',
                position: 'sticky', top: 0, zIndex: 1000, borderBottom: `1px solid rgba(26, 67, 49, 0.1)`
            }}>
                <div style={{ fontSize: '24px', fontWeight: '900', color: colors.forestGreen, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Utensils size={28} /> TRUE EATS
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <div style={{ display: 'flex', gap: '20px', fontWeight: '600', color: colors.forestGreen, fontSize: '14px' }}>
                        <span style={{cursor:'pointer'}} onClick={() => navigate('/')}>Home</span>
                        <span style={{cursor:'pointer'}}>About Us</span>
                        {user && <span style={{cursor:'pointer'}} onClick={() => navigate('/orders')}>My Orders</span>}
                        <span style={{cursor:'pointer'}} onClick={()=>navigate('/profile')}>My Profile</span>
                    </div>

                    {user ? (
                        <button onClick={handleLogoutClick} style={{ color: colors.chocolate, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
                    ) : (
                        <button onClick={() => navigate('/login')} style={{ backgroundColor: colors.forestGreen, color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
                    )}
                    
                    <div onClick={() => navigate('/cart')} style={{ position: 'relative', cursor: 'pointer', backgroundColor: colors.white, padding: '10px', borderRadius: '50%', display: 'flex', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <ShoppingCart color={colors.forestGreen} size={22} />
                        <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: colors.chocolate, color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                            {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                        </span>
                    </div>
                    
                </div>
            </nav>

            {/* 2. HERO SECTION */}
            <header style={{ height: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <h1 style={{ fontSize: '70px', color: colors.forestGreen, margin: 0, fontWeight: '900', letterSpacing: '-3px' }}>TRUE EATS</h1>
                <p style={{ fontSize: '20px', color: colors.chocolate, fontStyle: 'italic', fontWeight: '500' }}>"The Way Food Was Meant To Be"</p>
            </header>

            {/* 3. MENU SECTION */}
            <section style={{ padding: '60px', backgroundColor: colors.white, borderRadius: '60px 60px 0 0' }}>
                
                {/* CATEGORIES */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => filterCategory(cat)}
                            style={{
                                padding: '10px 25px', borderRadius: '50px', border: '1px solid #eee',
                                backgroundColor: activeCategory === cat ? colors.forestGreen : colors.peach + '44',
                                color: activeCategory === cat ? colors.white : colors.forestGreen,
                                cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '40px' }}>
                    {filteredProducts.map(p => (
                        <div key={p._id} style={{ borderRadius: '30px', overflow: 'hidden', backgroundColor: colors.peach + '22', border: '1px solid #f8f8f8' }}>
                            <div style={{ height: '220px', position: 'relative' }}>
                                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', bottom: '15px', right: '15px', backgroundColor: colors.white, padding: '8px 18px', borderRadius: '20px', fontWeight: '900', color: colors.forestGreen }}>
                                    ₹{p.price}
                                </div>
                            </div>
                            
                            <div style={{ padding: '25px' }}>
                                <h3 style={{ margin: 0, fontSize: '20px', color: colors.chocolate, fontWeight: '700' }}>{p.name}</h3>
                                <p style={{ color: '#777', fontSize: '14px', margin: '10px 0', height: '40px', overflow: 'hidden' }}>{p.description}</p>
                                
                                {/* --- NEW ACTION AREA --- */}
                                <div style={{ marginTop: '20px' }}>
                                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '8px' }}>Quantity</p>
                                    
                                    {/* 1. Default Quantity Selector */}
                                    <div style={{ 
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                        width: '120px', padding: '5px', border: '1px solid #ddd', 
                                        borderRadius: '8px', marginBottom: '15px', backgroundColor: '#fff'
                                    }}>
                                        <button onClick={() => handleLocalQtyChange(p._id, -1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: colors.forestGreen }}><Minus size={16}/></button>
                                        <span style={{ fontWeight: 'bold' }}>{localQtys[p._id] || 1}</span>
                                        <button onClick={() => handleLocalQtyChange(p._id, 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: colors.forestGreen }}><Plus size={16}/></button>
                                    </div>

                                    {/* 2. Add to Cart Button */}
                                    <button 
                                        onClick={() => {
                                            const qtyToAdd = localQtys[p._id] || 1;
                                            for(let i=0; i < qtyToAdd; i++) addToCart(p);
                                            // alert(`${qtyToAdd} ${p.name} added to cart!`);
                                        }}
                                        style={{ 
                                            width: '100%', padding: '12px', border: `1px solid ${colors.forestGreen}`, 
                                            backgroundColor: colors.white, color: colors.forestGreen, 
                                            borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px'
                                        }}
                                    >
                                        Add to Basket
                                    </button>

                                    {/* 3. Buy It Now Button */}
                                    <button 
                                        onClick={() => {
                                            const qtyToAdd = localQtys[p._id] || 1;
                                            for(let i=0; i < qtyToAdd; i++) addToCart(p);
                                            navigate('/cart');
                                        }}
                                        style={{ 
                                            width: '100%', padding: '12px', border: 'none', 
                                            backgroundColor: colors.chocolate, color: colors.white, 
                                            borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
                                        }}
                                    >
                                        BUY IT NOW
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ backgroundColor: colors.darkFooter, color: colors.white, padding: '60px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
                    <div>
                        <h3 style={{ color: colors.peach }}>TRUE EATS</h3>
                        <p style={{ fontSize: '14px', opacity: 0.7 }}><MapPin size={14}/> Hyderabad, India</p>
                        <p style={{ fontSize: '14px', opacity: 0.7 }}><Phone size={14}/> +91 98765-43210</p>
                    </div>
                    <div>
                        <h4>Support</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', opacity: 0.7 }}>
                            <span>Login</span><span>Our Story</span>
                        </div>
                    </div>
                    <div>
                        <h4>Follow</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', opacity: 0.7 }}>
                            <a href="#" style={{color:'inherit', textDecoration:'none'}}>Instagram</a>
                            <a href="#" style={{color:'inherit', textDecoration:'none'}}>Facebook</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;