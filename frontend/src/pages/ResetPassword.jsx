import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Lock, Loader, CheckCircle } from 'lucide-react';

const c = { forest: '#1a4331', white: '#ffffff', slate: '#64748b', light: '#f1f5f9' };

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // NEW STATE
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // NEW CHECK: Prevent submission if passwords don't match
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match!');
      return;
    }

    setStatus('loading');
    try {
      const res = await API.put(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid or expired token');
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: c.light }}>
      <div style={{ backgroundColor: c.white, padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }}>
        <h2 style={{ color: c.forest, margin: '0 0 10px 0', textAlign: 'center' }}>Create New Password</h2>
        
        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 15px' }} />
            <div style={{ color: '#065f46', backgroundColor: '#d1fae5', padding: '12px', borderRadius: '12px', fontWeight: 'bold', marginBottom: '15px' }}>{message}</div>
            <p style={{ color: c.slate, fontSize: '14px' }}>Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === 'error' && <div style={{ color: '#991b1b', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>{message}</div>}
            
            {/* FIRST PASSWORD INPUT */}
            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '0 15px', marginBottom: '15px' }}>
              <Lock size={18} color={c.slate} />
              <input type="password" placeholder="New Password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} style={{ border: 'none', padding: '15px', width: '100%', outline: 'none' }} />
            </div>

            {/* CONFIRM PASSWORD INPUT */}
            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '0 15px', marginBottom: '20px' }}>
              <Lock size={18} color={c.slate} />
              <input type="password" placeholder="Confirm Password" required minLength="6" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ border: 'none', padding: '15px', width: '100%', outline: 'none' }} />
            </div>
            
            <button disabled={status === 'loading'} style={{ width: '100%', padding: '15px', backgroundColor: c.forest, color: c.white, border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
              {status === 'loading' ? <Loader size={20} className="animate-spin" /> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;