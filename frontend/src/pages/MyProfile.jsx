import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { User, Mail, Phone, MapPin, Edit2, Save, Loader, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const c = { forest: '#1a4331', peach: '#fcd5ce', white: '#ffffff', slate: '#64748b', light: '#f1f5f9' };

const MyProfile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '', altPhoneNumber: '',
    address: { doorNo: '', colony: '', city: '', pincode: '' }
  });

  // Fetch the user's profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/auth/profile');
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          altPhoneNumber: data.altPhoneNumber || '',
          address: data.address || { doorNo: '', colony: '', city: '', pincode: '' }
        });
        setLoading(false);
      } catch (error) {
        setMessage({ text: 'Failed to load profile', type: 'error' });
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[2];
      setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put('/auth/profile', formData);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Update failed', type: 'error' });
    }
    setSaving(false);
    setTimeout(() => setMessage({ text: '', type: '' }), 3000); // Clear message after 3s
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}><Loader className="animate-spin" color={c.forest} size={40} /></div>;

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${isEditing ? c.forest : '#e2e8f0'}`, backgroundColor: isEditing ? c.white : c.light, color: c.slate, outline: 'none', marginBottom: '15px', boxSizing: 'border-box' };
  const labelStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', color: c.forest, marginBottom: '5px' };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: c.forest, display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div style={{ backgroundColor: c.white, borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${c.light}`, paddingBottom: '20px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: c.forest }}>My Profile</h2>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: c.peach, color: c.forest, border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              <Edit2 size={16} /> Edit
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: c.forest, color: c.white, border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              {saving ? <Loader size={16} /> : <Save size={16} />} Save
            </button>
          )}
        </div>

        {message.text && (
          <div style={{ padding: '12px', borderRadius: '12px', marginBottom: '20px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b', fontWeight: 'bold', textAlign: 'center' }}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}><User size={16}/> First Name</label>
            <input name="firstName" value={formData.firstName} onChange={handleChange} disabled={!isEditing} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}><User size={16}/> Last Name</label>
            <input name="lastName" value={formData.lastName} onChange={handleChange} disabled={!isEditing} style={inputStyle} />
          </div>
        </div>

        <label style={labelStyle}><Mail size={16}/> Email Address</label>
        <input value={formData.email} disabled style={{ ...inputStyle, backgroundColor: c.light, cursor: 'not-allowed' }} title="Email cannot be changed" />

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}><Phone size={16}/> Phone Number</label>
            <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} disabled={!isEditing} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}><Phone size={16}/> Alt Phone (Optional)</label>
            <input name="altPhoneNumber" value={formData.altPhoneNumber} onChange={handleChange} disabled={!isEditing} style={inputStyle} />
          </div>
        </div>

        <h3 style={{ borderBottom: `1px solid ${c.light}`, paddingBottom: '10px', marginTop: '20px', color: c.forest }}>Delivery Address</h3>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}><MapPin size={16}/> Door No / Flat</label>
            <input name="address.doorNo" value={formData.address.doorNo} onChange={handleChange} disabled={!isEditing} style={inputStyle} />
          </div>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}><MapPin size={16}/> Colony / Street</label>
            <input name="address.colony" value={formData.address.colony} onChange={handleChange} disabled={!isEditing} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}><MapPin size={16}/> City</label>
            <input name="address.city" value={formData.address.city} onChange={handleChange} disabled={!isEditing} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}><MapPin size={16}/> Pincode</label>
            <input name="address.pincode" value={formData.address.pincode} onChange={handleChange} disabled={!isEditing} style={inputStyle} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyProfile;