import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUser, updateUser, uploadProfilePicture, removeProfilePicture, getProfilePicUrl, addQualification, removeQualification } from '../../api/api';
import Topbar from '../../components/Topbar';
import { toast } from 'react-toastify';
import { Save, User, MapPin, Briefcase, Phone, Mail, Camera, ShieldCheck, Trash2, ExternalLink, Award, Plus } from 'lucide-react';
import { useRef } from 'react';
import { RoleBadge } from '../../components/Badges';

export default function Profile() {
    const { user, updateAuthUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [qualifications, setQualifications] = useState([]);
    const [showQualModal, setShowQualModal] = useState(false);
    const [newQual, setNewQual] = useState({ title: '', institution: '', year: '' });
    const [addingQual, setAddingQual] = useState(false);
    const fileInputRef = useRef(null);

    // We will store the original role and active state so they aren't accidentally modified
    const [form, setForm] = useState({
        name: '', phone: '',
        province: '', district: '', specialization: '',
        experienceYears: '',
        workingDays: '', workingStartTime: '', workingEndTime: ''
    });

    const locationData = {
        "Western": ["Colombo", "Gampaha", "Kalutara"],
        "Central": ["Kandy", "Matale", "Nuwara Eliya"],
        "Southern": ["Galle", "Matara", "Hambantota"],
        "Northern": ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
        "Eastern": ["Trincomalee", "Batticaloa", "Ampara"],
        "North Western": ["Kurunegala", "Puttalam"],
        "North Central": ["Anuradhapura", "Polonnaruwa"],
        "Uva": ["Badulla", "Monaragala"],
        "Sabaragamuwa": ["Ratnapura", "Kegalle"]
    };

    useEffect(() => {
        if (!user || !user.userId) return;
        const fetchProfile = async () => {
            try {
                // Auth token logic decodes email into 'userId' typically if it's email based, but let's assume get user works.
                // In context, user object has user.userId which might be ID or Email. 
                // Since our `getUser(id)` expects an ID, we assume user.userId is the Mongo _id
                const res = await getUser(user.userId);
                const data = res.data;
                setForm({
                    name: data.name || '',
                    phone: data.phone || '',
                    province: data.province || '',
                    district: data.district || '',
                    specialization: data.specialization || '',
                    experienceYears: data.experienceYears !== undefined ? data.experienceYears : '',
                    workingDays: data.workingDays || 'Monday - Friday',
                    workingStartTime: data.workingStartTime || '09:00',
                    workingEndTime: data.workingEndTime || '17:00'
                });
                setQualifications(data.qualifications || []);
            } catch (err) {
                toast.error('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        if (!user || !user.userId) {
            toast.error('Session error. Please refresh.');
            return;
        }
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('File is too large. Max 2MB.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await uploadProfilePicture(user.userId, formData);
            const fileUrl = res.data.url;
            updateAuthUser({ profilePicture: fileUrl });
            toast.success('Profile picture updated');
        } catch (err) {
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePicture = async () => {
        if (!user || !user.userId) {
            toast.error('Session error. Please refresh.');
            return;
        }
        if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
        
        setUploading(true);
        try {
            await removeProfilePicture(user.userId);
            updateAuthUser({ profilePicture: null });
            toast.success('Profile picture removed');
        } catch (err) {
            toast.error('Failed to remove profile picture');
        } finally {
            setUploading(false);
        }
    };

    const handleAddQualification = async (e) => {
        e.preventDefault();
        setAddingQual(true);
        try {
            const res = await addQualification(user.userId, { ...newQual });
            setQualifications(res.data.qualifications || []);
            setShowQualModal(false);
            setNewQual({ title: '', institution: '', year: '' });
            toast.success('Qualification added');
        } catch (err) {
            console.error('Error adding qualification:', err);
            const msg = err.response?.data || err.message || 'Failed to add qualification';
            toast.error(msg);
        } finally {
            setAddingQual(false);
        }
    };

    const handleRemoveQual = async (qualId) => {
        if (!window.confirm('Remove this qualification?')) return;
        try {
            const res = await removeQualification(user.userId, qualId);
            setQualifications(res.data.qualifications || []);
            toast.success('Qualification removed');
        } catch (err) {
            toast.error('Failed to remove qualification');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Sri Lankan Phone Validation
        const phoneRegex = /^(?:0|\+94|94)7[0-9]{8}$/;
        if (form.phone && !phoneRegex.test(form.phone.replace(/\s/g, ''))) {
            toast.error('Invalid Sri Lankan phone number. Use 07XXXXXXXX format.');
            return;
        }

        setSaving(true);
        try {
            await updateUser(user.userId, form);
            updateAuthUser(form);
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-spinner" />;

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Topbar title="My Profile" subtitle="Manage your personal information and preferences" />
            <div className="page-content" style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', alignItems: 'start' }}>
                    
                    {/* Profile Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center', borderRadius: '24px' }}>
                            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    hidden 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                />
                                <div className="user-avatar" style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    fontSize: '48px', 
                                    borderRadius: '32px',
                                    boxShadow: '0 12px 24px rgba(26, 111, 196, 0.2)',
                                    overflow: 'hidden',
                                    background: 'var(--primary-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {user?.profilePicture ? (
                                        <img 
                                            src={getProfilePicUrl(user.profilePicture)} 
                                            alt="Profile" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    ) : (
                                        form.name?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={uploading}
                                    title="Change Picture"
                                    style={{
                                        position: 'absolute',
                                        bottom: '-8px',
                                        right: '24px',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '12px',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: '3px solid white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: 'var(--shadow)',
                                        transition: 'all 0.2s ease',
                                        zIndex: 2
                                    }}
                                >
                                    {uploading ? <div className="spinner-micro" /> : <Camera size={16} />}
                                </button>
                                {user?.profilePicture && (
                                    <button 
                                        onClick={handleRemovePicture}
                                        disabled={uploading}
                                        title="Remove Picture"
                                        style={{
                                            position: 'absolute',
                                            bottom: '-8px',
                                            left: '24px',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '12px',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: '3px solid white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: 'var(--shadow)',
                                            transition: 'all 0.2s ease',
                                            zIndex: 2
                                        }}
                                    >
                                        <User size={16} />
                                    </button>
                                )}
                            </div>
                            
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>{form.name}</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{user?.email}</p>
                            
                            <div style={{ display: 'inline-flex' }}>
                                <RoleBadge role={user?.role} />
                            </div>

                            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
                                    <span>Account Verified</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                                    <span>{form.district || 'Location not set'}</span>
                                </div>
                                {user?.role === 'TECHNICIAN' && form.experienceYears && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        <Award size={16} style={{ color: 'var(--warning)' }} />
                                        <span>{form.experienceYears} Years Experience</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'white' }}>
                            <h4 style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>Security Tip</h4>
                            <p style={{ fontSize: '12px', opacity: 0.9, lineHeight: '1.5' }}>
                                Keep your profile information up to date to ensure seamless communication with our support team.
                            </p>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="glass-card" style={{ padding: '40px', borderRadius: '24px' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>Personal Details</h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Update your contact and location information</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ marginBottom: '10px' }}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{ paddingLeft: '48px', height: '48px', borderRadius: '12px' }}
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '10px' }}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="email"
                                            className="form-control"
                                            style={{ paddingLeft: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg)', cursor: 'not-allowed' }}
                                            value={user?.email || ''}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '10px' }}>Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ paddingLeft: '48px', height: '48px', borderRadius: '12px' }}
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="e.g. +94 77 123 4567"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '24px', background: 'var(--bg)', borderRadius: '16px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ marginBottom: '10px' }}>Province</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <select
                                            className="form-control"
                                            style={{ paddingLeft: '48px', height: '48px', borderRadius: '12px' }}
                                            name="province"
                                            value={form.province}
                                            onChange={(e) => setForm({ ...form, province: e.target.value, district: '' })}
                                        >
                                            <option value="">Select Province</option>
                                            {Object.keys(locationData).map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ marginBottom: '10px' }}>District</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <select
                                            className="form-control"
                                            style={{ paddingLeft: '48px', height: '48px', borderRadius: '12px' }}
                                            name="district"
                                            value={form.district}
                                            onChange={handleChange}
                                            disabled={!form.province}
                                        >
                                            <option value="">Select District</option>
                                            {form.province && locationData[form.province].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {user?.role === 'TECHNICIAN' && (
                                <div style={{ marginTop: '16px', padding: '32px', background: 'var(--primary-50)', borderRadius: '24px', border: '1px dashed var(--primary-200)' }}>
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '4px' }}>Professional Profile</h3>
                                        <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '500' }}>Customize your expertise and availability</p>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Specialization</label>
                                        <select
                                            className="form-control"
                                            style={{ height: '48px', borderRadius: '12px' }}
                                            name="specialization"
                                            value={form.specialization}
                                            onChange={handleChange}
                                        >
                                            <option value="">General (No specific specialization)</option>
                                            <option value="SOFTWARE">Software Development</option>
                                            <option value="HARDWARE">Hardware & Infrastructure</option>
                                            <option value="NETWORK">Network Engineering</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Years of Experience</label>
                                        <div style={{ position: 'relative' }}>
                                            <Award size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                type="number"
                                                className="form-control"
                                                style={{ paddingLeft: '48px', height: '48px', borderRadius: '12px' }}
                                                name="experienceYears"
                                                value={form.experienceYears}
                                                onChange={handleChange}
                                                placeholder="e.g. 5"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Working Days</label>
                                        <select
                                            className="form-control"
                                            style={{ height: '48px', borderRadius: '12px' }}
                                            name="workingDays"
                                            value={form.workingDays}
                                            onChange={handleChange}
                                        >
                                            <option value="Monday - Friday">Monday - Friday</option>
                                            <option value="Monday - Saturday">Monday - Saturday</option>
                                            <option value="All Week (Mon-Sun)">All Week (Mon-Sun)</option>
                                            <option value="Weekends Only">Weekends Only</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Shift Start</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                style={{ height: '48px', borderRadius: '12px' }}
                                                name="workingStartTime"
                                                value={form.workingStartTime}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Shift End</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                style={{ height: '48px', borderRadius: '12px' }}
                                                name="workingEndTime"
                                                value={form.workingEndTime}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {user?.role === 'TECHNICIAN' && (
                                <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-light)', paddingTop: '32px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>Qualifications & Certifications</h3>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Showcase your professional achievements</p>
                                        </div>
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowQualModal(true)} style={{ borderRadius: '8px', padding: '6px 12px' }}>
                                            <Plus size={14} /> Add New
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                        {qualifications.length === 0 ? (
                                            <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                                                <Award size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
                                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No qualifications listed yet.</p>
                                            </div>
                                        ) : (
                                            qualifications.map(q => (
                                                <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                        <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                            <Award size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '2px' }}>{q.title}</h4>
                                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{q.institution} • {q.year}</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleRemoveQual(q.id)}
                                                        >
                                                            <Trash2 size={14} /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn btn-primary btn-lg" style={{ borderRadius: '12px', minWidth: '180px' }} disabled={saving}>
                                    <Save size={18} />
                                    {saving ? 'Updating...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Qualification Modal */}
            {showQualModal && (
                <div className="modal-overlay" onClick={() => setShowQualModal(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <h3 className="modal-title">Add Qualification</h3>
                        <form onSubmit={handleAddQualification}>
                            <div className="form-group">
                                <label className="form-label">Qualification Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={newQual.title}
                                    onChange={e => setNewQual({ ...newQual, title: e.target.value })}
                                    placeholder="e.g. Bsc Computer Science"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Institution</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={newQual.institution}
                                    onChange={e => setNewQual({ ...newQual, institution: e.target.value })}
                                    placeholder="e.g. University of Colombo"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Year</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={newQual.year}
                                    onChange={e => setNewQual({ ...newQual, year: e.target.value })}
                                    placeholder="e.g. 2020"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowQualModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={addingQual}>
                                    {addingQual ? 'Processing...' : 'Add Qualification'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
