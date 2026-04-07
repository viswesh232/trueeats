import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import {
    Trash2, Utensils, IndianRupee, Tag,
    ToggleLeft, ToggleRight, Pencil, Check, X,
    ArrowLeft, Plus, Upload, Link, ChevronLeft, ChevronRight, Image
} from 'lucide-react';

const c = {
    forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a',
    white: '#ffffff', bg: '#f4f7fe', slate: '#64748b', light: '#f1f5f9',
    purple: '#4318FF',
};

const inp = {
    padding: '10px 14px', borderRadius: '10px', border: '1px solid #e0e5f2',
    backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none',
    width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
};

// ── Image builder — used in both Add and Edit forms ──────────────────────────
// Returns { urlRows, fileRows, addUrl, removeUrl, addFile, removeFile, buildFormData }
const useImageBuilder = (initialImages = []) => {
    // Separate existing URLs from new file slots
    const [urlRows, setUrlRows] = useState(
        initialImages.length > 0 ? initialImages : ['']
    );
    const [fileRows, setFileRows] = useState([]); // array of File objects

    const addUrl    = ()        => setUrlRows(r => [...r, '']);
    const removeUrl = (i)       => setUrlRows(r => r.filter((_, idx) => idx !== i));
    const updateUrl = (i, val)  => setUrlRows(r => r.map((v, idx) => idx === i ? val : v));
    const addFile   = (files)   => setFileRows(r => [...r, ...Array.from(files)]);
    const removeFile= (i)       => setFileRows(r => r.filter((_, idx) => idx !== i));

    // Build FormData ready to POST/PUT
    const buildFormData = (fields) => {
        const fd = new FormData();
        Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
        // Valid URLs only
        urlRows.filter(u => u.trim()).forEach(u => fd.append('urlImages', u.trim()));
        fileRows.forEach(f => fd.append('images', f));
        return fd;
    };

    const resetImages = () => { setUrlRows(['']); setFileRows([]); };
    return { urlRows, fileRows, addUrl, removeUrl, updateUrl, addFile, removeFile, buildFormData, resetImages };
};

// ── Small image carousel for product cards ───────────────────────────────────
const ImageCarousel = ({ images = [], unavailable }) => {
    const [idx, setIdx] = useState(0);
    const list = images.length > 0 ? images : [];

    if (list.length === 0) return (
        <div style={{ height: '190px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image size={40} color="#cbd5e1" />
        </div>
    );

    return (
        <div style={{ height: '190px', position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
            <img
                src={list[idx]}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.2s' }}
                onError={e => { e.target.src = 'https://placehold.co/400x200?text=No+Image'; }}
            />
            {unavailable && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ backgroundColor: '#ef4444', color: '#fff', fontWeight: '900', fontSize: '13px', padding: '6px 16px', borderRadius: '20px' }}>UNAVAILABLE</span>
                </div>
            )}
            {list.length > 1 && (
                <>
                    <button onClick={() => setIdx(i => (i - 1 + list.length) % list.length)}
                        style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'rgba(0,0,0,0.45)', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setIdx(i => (i + 1) % list.length)}
                        style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'rgba(0,0,0,0.45)', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronRight size={16} />
                    </button>
                    <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
                        {list.map((_, i) => (
                            <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? '16px' : '6px', height: '6px', borderRadius: '3px', backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: '0.2s' }} />
                        ))}
                    </div>
                </>
            )}
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(255,255,255,0.92)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', color: '#64748b' }}>
                {idx + 1}/{list.length}
            </div>
        </div>
    );
};

// ── Image input section (reused in both Add and Edit) ────────────────────────
const ImageInputSection = ({ urlRows, fileRows, addUrl, removeUrl, updateUrl, addFile, removeFile }) => {
    const fileRef = useRef();

    return (
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e0e5f2' }}>
            <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: c.slate, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Image size={14} /> Images (URL or upload — both optional, add as many as you want)
            </p>

            {/* URL rows */}
            {urlRows.map((url, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, border: '1px solid #e0e5f2', borderRadius: '10px', backgroundColor: c.white, overflow: 'hidden' }}>
                        <div style={{ padding: '0 10px', color: c.slate, flexShrink: 0 }}><Link size={14} /></div>
                        <input
                            value={url}
                            onChange={e => updateUrl(i, e.target.value)}
                            placeholder={`Image URL ${i + 1} (optional)`}
                            style={{ ...inp, border: 'none', backgroundColor: 'transparent', padding: '10px 10px 10px 0' }}
                        />
                        {url && (
                            <img src={url} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', flexShrink: 0, margin: '4px' }}
                                onError={e => { e.target.style.display = 'none'; }} />
                        )}
                    </div>
                    <button type="button" onClick={() => removeUrl(i)}
                        style={{ border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <X size={14} />
                    </button>
                </div>
            ))}

            <button type="button" onClick={addUrl}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px dashed #cbd5e1', background: 'none', color: c.slate, borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '13px', marginBottom: '12px' }}>
                <Plus size={13} /> Add another URL
            </button>

            {/* File uploads */}
            <div style={{ borderTop: '1px dashed #e0e5f2', paddingTop: '12px' }}>
                <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
                    onChange={e => { addFile(e.target.files); e.target.value = ''; }} />
                <button type="button" onClick={() => fileRef.current.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: c.white, border: '1px solid #e0e5f2', borderRadius: '10px', padding: '9px 16px', cursor: 'pointer', color: c.forest, fontWeight: '600', fontSize: '13px' }}>
                    <Upload size={14} /> Upload from device
                </button>

                {fileRows.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {fileRows.map((file, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                                <img src={URL.createObjectURL(file)} alt=""
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e0e5f2' }} />
                                <button type="button" onClick={() => removeFile(i)}
                                    style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                    ✕
                                </button>
                                <div style={{ fontSize: '10px', color: c.slate, textAlign: 'center', marginTop: '2px', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ────────────────────────────────────────────────────────────────────────────
const EditMenu = () => {
    const navigate = useNavigate();
    const [products, setProducts]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [toast, setToast]         = useState('');

    // ── Add form fields ──
    const [addFields, setAddFields] = useState({ name: '', price: '', category: '', description: '' });
    const addImages = useImageBuilder([]);

    // ── Edit form fields ──
    const [editFields, setEditFields] = useState({ name: '', price: '', category: '', description: '' });
    const [editImages, setEditImages] = useState({ urlRows: [''], fileRows: [] });

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const fetchProducts = async () => {
        try {
            // ?all=true so admin sees unavailable items too
            const { data } = await API.get('/products?all=true');
            setProducts(data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchProducts(); }, []);

    // ── ADD PRODUCT ──────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const fd = addImages.buildFormData({
                name:        addFields.name,
                price:       addFields.price,
                category:    addFields.category,
                description: addFields.description,
                isAvailable: 'true',
            });
            await API.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setAddFields({ name: '', price: '', category: '', description: '' });
            addImages.resetImages();
            fetchProducts();
            showToast('Dish published successfully');
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    // ── DELETE ───────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this dish from the live menu?')) return;
        try {
            await API.delete(`/products/${id}`);
            fetchProducts();
            showToast('Dish removed');
        } catch { alert('Error deleting dish'); }
    };

    // ── AVAILABILITY TOGGLE ──────────────────────────────────────────────────
    const handleToggleAvailable = async (p) => {
        try {
            // Send as JSON — controller handles this case
            await API.put(`/products/${p._id}`, { isAvailable: !p.isAvailable });
            setProducts(prev => prev.map(x => x._id === p._id ? { ...x, isAvailable: !x.isAvailable } : x));
            showToast(`${p.name} marked ${!p.isAvailable ? 'available' : 'unavailable'}`);
        } catch { alert('Failed to update availability'); }
    };

    // ── START EDIT ───────────────────────────────────────────────────────────
    const startEdit = (p) => {
        setEditingId(p._id);
        setEditFields({ name: p.name, price: p.price, category: p.category, description: p.description });
        // Load existing images into URL rows
        const existingUrls = (p.images || []).filter(img => img.startsWith('http'));
        setEditImages({
            urlRows: existingUrls.length > 0 ? existingUrls : [''],
            fileRows: [],
        });
    };

    // ── SAVE EDIT ────────────────────────────────────────────────────────────
    const saveEdit = async (id) => {
        try {
            const fd = new FormData();
            fd.append('name',        editFields.name);
            fd.append('price',       editFields.price);
            fd.append('category',    editFields.category);
            fd.append('description', editFields.description);
            fd.append('isAvailable', 'true');

            // URL images
            editImages.urlRows.filter(u => u.trim()).forEach(u => fd.append('urlImages', u.trim()));
            // File uploads
            editImages.fileRows.forEach(f => fd.append('images', f));

            await API.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setEditingId(null);
            fetchProducts(); // refresh to get updated images
            showToast('Changes saved');
        } catch (err) {
            alert('Failed to save: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div style={{ padding: '40px 50px', fontFamily: "'Inter', sans-serif", backgroundColor: c.bg, minHeight: '100vh', color: '#1b2559' }}>

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: c.forest, color: '#fff', padding: '14px 28px', borderRadius: '50px', fontWeight: 'bold', zIndex: 999, fontSize: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    ✓ {toast}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
                <div onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', padding: '10px', backgroundColor: c.white, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <ArrowLeft size={20} color={c.forest} />
                </div>
                <div style={{ backgroundColor: c.purple, padding: '12px', borderRadius: '14px' }}>
                    <Utensils color="#fff" size={26} />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '900' }}>True Eats Menu</h1>
                    <p style={{ margin: 0, fontSize: '13px', color: c.slate }}>{products.length} items · Toggle availability, edit details, or add new items</p>
                </div>
            </div>

            {/* ── ADD FORM ── */}
            <div style={{ backgroundColor: c.white, padding: '32px', borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', marginBottom: '40px', border: '1px solid #e0e5f2' }}>
                <h3 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px', color: c.forest, fontSize: '16px', fontWeight: '800' }}>
                    <Plus size={18} /> Add New Item
                </h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '14px' }}>
                        <input style={inp} placeholder="Dish Name" value={addFields.name} onChange={e => setAddFields({ ...addFields, name: e.target.value })} required />
                        <input style={inp} placeholder="Price (₹)" type="number" value={addFields.price} onChange={e => setAddFields({ ...addFields, price: e.target.value })} required />
                        <input style={inp} placeholder="Category (e.g. Starters)" value={addFields.category} onChange={e => setAddFields({ ...addFields, category: e.target.value })} required />
                        <textarea style={{ ...inp, height: '44px', resize: 'none' }} placeholder="Description..." value={addFields.description} onChange={e => setAddFields({ ...addFields, description: e.target.value })} required />
                    </div>

                    {/* Image section */}
                    <ImageInputSection
                        urlRows={addImages.urlRows}
                        fileRows={addImages.fileRows}
                        addUrl={addImages.addUrl}
                        removeUrl={addImages.removeUrl}
                        updateUrl={addImages.updateUrl}
                        addFile={addImages.addFile}
                        removeFile={addImages.removeFile}
                    />

                    <button type="submit" style={{ width: '100%', marginTop: '16px', padding: '16px', backgroundColor: c.purple, color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(67,24,255,0.2)' }}>
                        Publish Item
                    </button>
                </form>
            </div>

            {/* ── PRODUCTS GRID ── */}
            {loading ? (
                <p style={{ textAlign: 'center', color: c.slate, padding: '40px' }}>Loading menu...</p>
            ) : products.length === 0 ? (
                <p style={{ textAlign: 'center', color: c.slate, padding: '40px' }}>No items yet. Add your first dish above.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '28px' }}>
                    {products.map(p => {
                        const isEditing = editingId === p._id;
                        const images = p.images || (p.image ? [p.image] : []);

                        return (
                            <div key={p._id} style={{
                                backgroundColor: c.white, borderRadius: '20px', overflow: 'hidden',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                border: `2px solid ${!p.isAvailable ? '#fecdd3' : '#eef2f6'}`,
                                opacity: p.isAvailable ? 1 : 0.8, transition: '0.2s'
                            }}>

                                {/* Image carousel — only in view mode */}
                                {!isEditing && (
                                    <div style={{ position: 'relative' }}>
                                        <ImageCarousel images={images} unavailable={!p.isAvailable} />
                                        {/* Category badge */}
                                        <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(255,255,255,0.92)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: c.purple, display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                                            <Tag size={10} /> {p.category}
                                        </div>
                                        {/* Delete button */}
                                        <button onClick={() => handleDelete(p._id)} style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#fff', border: 'none', borderRadius: '10px', width: '34px', height: '34px', cursor: 'pointer', color: '#ff5c5c', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 2 }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}

                                {/* Content */}
                                <div style={{ padding: '20px' }}>
                                    {isEditing ? (
                                        // ── Edit mode ──
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <input value={editFields.name} onChange={e => setEditFields({ ...editFields, name: e.target.value })} style={inp} placeholder="Name" />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <input type="number" value={editFields.price} onChange={e => setEditFields({ ...editFields, price: e.target.value })} style={inp} placeholder="Price ₹" />
                                                <input value={editFields.category} onChange={e => setEditFields({ ...editFields, category: e.target.value })} style={inp} placeholder="Category" />
                                            </div>
                                            <textarea value={editFields.description} onChange={e => setEditFields({ ...editFields, description: e.target.value })} style={{ ...inp, height: '60px', resize: 'none' }} placeholder="Description" />

                                            {/* Image editor */}
                                            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e0e5f2' }}>
                                                <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '700', color: c.slate }}>IMAGES (edit or replace)</p>
                                                {editImages.urlRows.map((url, i) => (
                                                    <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', flex: 1, border: '1px solid #e0e5f2', borderRadius: '8px', backgroundColor: c.white, overflow: 'hidden' }}>
                                                            <div style={{ padding: '0 8px', color: c.slate }}><Link size={13} /></div>
                                                            <input value={url} onChange={e => setEditImages(prev => ({ ...prev, urlRows: prev.urlRows.map((v, idx) => idx === i ? e.target.value : v) }))}
                                                                placeholder="Image URL" style={{ ...inp, border: 'none', backgroundColor: 'transparent', padding: '8px 8px 8px 0', fontSize: '13px' }} />
                                                            {url && <img src={url} alt="" style={{ width: '30px', height: '30px', objectFit: 'cover', margin: '4px', borderRadius: '4px' }} onError={e => { e.target.style.display = 'none'; }} />}
                                                        </div>
                                                        <button type="button" onClick={() => setEditImages(prev => ({ ...prev, urlRows: prev.urlRows.filter((_, idx) => idx !== i) }))}
                                                            style={{ border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => setEditImages(prev => ({ ...prev, urlRows: [...prev.urlRows, ''] }))}
                                                    style={{ fontSize: '12px', border: '1px dashed #cbd5e1', background: 'none', color: c.slate, borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', marginBottom: '8px' }}>
                                                    <Plus size={11} style={{ marginRight: '4px' }} /> Add URL
                                                </button>

                                                {/* File upload in edit mode */}
                                                <div>
                                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: c.white, border: '1px solid #e0e5f2', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: c.forest, fontWeight: '600' }}>
                                                        <Upload size={12} /> Upload from device
                                                        <input type="file" multiple accept="image/*" style={{ display: 'none' }}
                                                            onChange={e => { setEditImages(prev => ({ ...prev, fileRows: [...prev.fileRows, ...Array.from(e.target.files)] })); e.target.value = ''; }} />
                                                    </label>
                                                    {editImages.fileRows.length > 0 && (
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                            {editImages.fileRows.map((file, i) => (
                                                                <div key={i} style={{ position: 'relative' }}>
                                                                    <img src={URL.createObjectURL(file)} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                                                                    <button type="button" onClick={() => setEditImages(prev => ({ ...prev, fileRows: prev.fileRows.filter((_, idx) => idx !== i) }))}
                                                                        style={{ position: 'absolute', top: '-5px', right: '-5px', width: '16px', height: '16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => saveEdit(p._id)} style={{ flex: 1, padding: '10px', backgroundColor: c.forest, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}>
                                                    <Check size={15} /> Save Changes
                                                </button>
                                                <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: '10px', backgroundColor: c.light, color: c.slate, border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}>
                                                    <X size={15} /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // ── View mode ──
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: c.chocolate }}>{p.name}</h3>
                                                <div style={{ color: c.purple, fontWeight: '900', fontSize: '17px', display: 'flex', alignItems: 'center' }}>
                                                    <IndianRupee size={15} />{p.price}
                                                </div>
                                            </div>
                                            <p style={{ color: '#a3aed0', fontSize: '13px', lineHeight: '1.5', margin: '0 0 14px', height: '38px', overflow: 'hidden' }}>{p.description}</p>
                                            <div style={{ fontSize: '11px', color: c.slate, marginBottom: '12px' }}>
                                                {images.length} image{images.length !== 1 ? 's' : ''}
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                                                <button onClick={() => handleToggleAvailable(p)} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                                                    {p.isAvailable
                                                        ? <><ToggleRight size={32} color="#10b981" /><span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981' }}>Available</span></>
                                                        : <><ToggleLeft size={32} color="#cbd5e1" /><span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Unavailable</span></>
                                                    }
                                                </button>
                                                <button onClick={() => startEdit(p)} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eef2ff', color: c.purple, border: 'none', padding: '7px 13px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                                                    <Pencil size={12} /> Edit
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EditMenu;