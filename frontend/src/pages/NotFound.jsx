import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX, ArrowLeft } from 'lucide-react';

const c = { forest: '#1a4331', peach: '#fcd5ce', slate: '#64748b', light: '#f1f5f9' };

const NotFound = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: c.light, textAlign: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: c.peach, padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
        <SearchX size={60} color={c.forest} />
      </div>
      <h1 style={{ color: c.forest, fontSize: '48px', margin: '0 0 10px 0' }}>404</h1>
      <h2 style={{ color: '#1e293b', margin: '0 0 10px 0' }}>Page Not Found</h2>
      <p style={{ color: c.slate, maxWidth: '400px', marginBottom: '30px', lineHeight: '1.5' }}>
        Oops! We can't seem to find the page you are looking for. It might have been removed or the link might be broken.
      </p>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: c.forest, color: '#fff', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold' }}>
        <ArrowLeft size={18} /> Back to Home
      </Link>
    </div>
  );
};

export default NotFound;