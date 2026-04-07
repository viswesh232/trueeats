import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Utensils, User, Mail, Lock, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', phoneNumber: '',
        address: { doorNo: '', colony: '', city: '', pincode: '' }
    });
    const [showPw, setShowPw] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (['doorNo', 'colony', 'city', 'pincode'].includes(name)) {
            setFormData({ ...formData, address: { ...formData.address, [name]: value } });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('/auth/signup', formData);
            setMessage(res.data.message);
            setIsError(false);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Something went wrong');
            setIsError(true);
        }
        setLoading(false);
    };

    const inp = (pl) => ({
        style: {
            width: '100%', padding: '13px 14px 13px 42px', borderRadius: '12px',
            border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none',
            boxSizing: 'border-box', backgroundColor: '#f8fafc', fontFamily: 'inherit', transition: '0.2s'
        },
        placeholder: pl,
        onFocus: e => e.target.style.borderColor = '#1a4331',
        onBlur: e => e.target.style.borderColor = '#e2e8f0',
    });

    const IconWrap = ({ icon: Icon }) => (
        <Icon size={16} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
    );

    const SectionLabel = ({ icon: Icon, label }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '20px 0 12px', color: '#1a4331', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Icon size={14} /> {label}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fcd5ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '30px 20px' }}>
            <div style={{ width: '100%', maxWidth: '480px' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', backgroundColor: '#1a4331', padding: '12px 24px', borderRadius: '18px', marginBottom: '12px' }}>
                        <Utensils color="#fcd5ce" size={24} />
                        <span style={{ color: '#fff', fontWeight: '900', fontSize: '20px', letterSpacing: '1px' }}>TRUE EATS</span>
                    </div>
                </div>

                {/* Card */}
                <div style={{ backgroundColor: '#fff', borderRadius: '28px', padding: '36px', boxShadow: '0 20px 50px rgba(26,67,49,0.12)' }}>
                    <h2 style={{ margin: '0 0 4px', fontWeight: '900', color: '#1a4331', fontSize: '22px' }}>Create your account</h2>
                    <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '13px' }}>Join True Eats to start ordering</p>

                    <form onSubmit={handleSubmit}>
                        {/* Personal info */}
                        <SectionLabel icon={User} label="Personal Info" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ position: 'relative' }}>
                                <IconWrap icon={User} />
                                <input name="firstName" {...inp('First Name')} onChange={handleChange} required />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <IconWrap icon={User} />
                                <input name="lastName" {...inp('Last Name')} onChange={handleChange} required />
                            </div>
                        </div>
                        <div style={{ position: 'relative', marginBottom: '10px' }}>
                            <IconWrap icon={Mail} />
                            <input type="email" name="email" {...inp('Email address')} onChange={handleChange} required />
                        </div>
                        <div style={{ position: 'relative', marginBottom: '10px' }}>
                            <IconWrap icon={Phone} />
                            <input name="phoneNumber" {...inp('Phone Number')} onChange={handleChange} required />
                        </div>
                        <div style={{ position: 'relative', marginBottom: '10px' }}>
                            <IconWrap icon={Lock} />
                            <input type={showPw ? 'text' : 'password'} name="password" {...inp('Password')} onChange={handleChange} required />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Address */}
                        <SectionLabel icon={MapPin} label="Delivery Address" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {[
                                { name: 'doorNo', pl: 'Door No / Flat' },
                                { name: 'colony', pl: 'Colony / Area' },
                                { name: 'city',   pl: 'City' },
                                { name: 'pincode',pl: 'Pincode' },
                            ].map(f => (
                                <div key={f.name} style={{ position: 'relative' }}>
                                    <IconWrap icon={MapPin} />
                                    <input name={f.name} {...inp(f.pl)} onChange={handleChange} />
                                </div>
                            ))}
                        </div>

                        {message && (
                            <div style={{ margin: '16px 0', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', backgroundColor: isError ? '#fee2e2' : '#d1fae5', color: isError ? '#991b1b' : '#065f46' }}>
                                {isError ? '⚠ ' : '✓ '}{message}
                            </div>
                        )}

                        <button type="submit" disabled={loading} style={{
                            width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#1a4331',
                            color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800',
                            fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                        }}>
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#1a4331', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;