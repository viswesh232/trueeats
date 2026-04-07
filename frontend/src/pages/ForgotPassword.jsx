import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Mail, ArrowLeft, CheckCircle, Loader } from 'lucide-react';

const c = { forest: '#1a4331', peach: '#fcd5ce', white: '#ffffff', slate: '#64748b', light: '#f1f5f9' };

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await API.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setStatus('success');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong');
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: c.light }}>
      <div style={{ backgroundColor: c.white, padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }}>
        <h2 style={{ color: c.forest, margin: '0 0 10px 0', textAlign: 'center' }}>Reset Password</h2>
        <p style={{ color: c.slate, textAlign: 'center', marginBottom: '25px', fontSize: '14px' }}>Enter your email and we'll send you a secure link to reset your password.</p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 15px' }} />
            <div style={{ color: '#065f46', backgroundColor: '#d1fae5', padding: '12px', borderRadius: '12px', fontWeight: 'bold' }}>{message}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === 'error' && <div style={{ color: '#991b1b', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>{message}</div>}
            
            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '0 15px', marginBottom: '20px' }}>
              <Mail size={18} color={c.slate} />
              <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ border: 'none', padding: '15px', width: '100%', outline: 'none' }} />
            </div>
            
            <button disabled={status === 'loading'} style={{ width: '100%', padding: '15px', backgroundColor: c.forest, color: c.white, border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
              {status === 'loading' ? <Loader size={20} className="animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        )}
        
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '20px', color: c.forest, textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;