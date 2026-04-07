import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

// Using your existing True Eats color palette
const c = { forest: '#1a4331', peach: '#fcd5ce', white: '#ffffff', slate: '#64748b' };

const VerifyEmail = () => {
  const { token } = useParams(); // Extracts the token from the URL
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', or 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        // Calls your existing backend authController.verifyEmail [1, 2]
        const res = await API.get(`/auth/verify/${token}`); 
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed or token expired.');
      }
    };

    if (token) {
      verifyUserEmail();
    }
  }, [token]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
      <div style={{ backgroundColor: c.white, padding: '40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }}>
        
        {/* LOADING STATE */}
        {status === 'loading' && (
          <>
            <Loader size={48} color={c.forest} style={{ margin: '0 auto 20px' }} />
            <h2 style={{ color: c.forest, margin: '0 0 10px 0' }}>Verifying...</h2>
            <p style={{ color: c.slate, margin: 0 }}>Please wait while we verify your email address.</p>
          </>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <>
            <CheckCircle size={56} color="#10b981" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ color: c.forest, margin: '0 0 10px 0' }}>Verified!</h2>
            <p style={{ color: c.slate, margin: 0 }}>{message}</p>
            <button 
              onClick={() => navigate('/login')}
              style={{ marginTop: '25px', width: '100%', padding: '15px', backgroundColor: c.forest, color: c.white, border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
            >
              Go to Login
            </button>
          </>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <>
            <XCircle size={56} color="#ef4444" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ color: c.forest, margin: '0 0 10px 0' }}>Verification Failed</h2>
            <p style={{ color: c.slate, margin: 0 }}>{message}</p>
            <Link to="/signup" style={{ color: c.forest, fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', marginTop: '25px' }}>
              Back to Sign Up
            </Link>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;