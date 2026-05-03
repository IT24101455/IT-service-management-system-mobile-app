import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createTicket } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import Topbar from '../../components/Topbar';
import { toast } from 'react-toastify';
import { Send, Upload, MapPin, User as UserIcon, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { getAvailableTechnicians } from '../../api/api';

export default function SubmitTicket() {
    // Hooks and state initialization for ticket form, technician list, and UI loading state
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({
        title: '', description: '', category: 'SOFTWARE', priority: 'MEDIUM',
        province: '', district: '', technicianId: '', technicianName: '', attachmentUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [technicians, setTechnicians] = useState([]);

    // Predefined mapping of provinces to their respective districts for the location dropdowns
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

    // Fetches available technicians on mount and pre-selects a technician if specified in URL query params
    useEffect(() => {
        const fetchTechs = async () => {
            try {
                const res = await getAvailableTechnicians();
                setTechnicians(res.data);

                // Pre-fill technician if techId is in query params
                const params = new URLSearchParams(location.search);
                const queryTechId = params.get('techId');
                if (queryTechId) {
                    const tech = res.data.find(t => t.id === queryTechId);
                    if (tech) {
                        setForm(prev => ({ ...prev, technicianId: tech.id, technicianName: tech.name }));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch technicians', err);
            }
        };
        fetchTechs();
    }, [location.search]);

    // Handles the ticket creation request, including setting default status based on assignment
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createTicket({
                ...form,
                userId: user.userId,
                userName: user.name,
                status: form.technicianId ? 'OPEN' : 'PENDING'
            });
            toast.success('Ticket submitted successfully!');
            navigate('/user/tickets');
        } catch {
            toast.error('Failed to submit ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Topbar title="Request Support" subtitle="Help us understand your technical issue" />
            <div className="page-content" style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
                
                <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                    {/* Decorative Background */}
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(26, 111, 196, 0.05) 0%, transparent 70%)', zIndex: 0 }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ width: '48px', height: '48px', background: 'var(--primary-50)', color: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>New Service Ticket</h2>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Required fields are marked with an asterisk (*)</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            
                            {/* Section 1: Basic Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'block' }}>
                                        Issue Title *
                                    </label>
                                    <input 
                                        className="form-control" 
                                        style={{ height: '52px', borderRadius: '14px', fontSize: '15px' }}
                                        placeholder="e.g., Computer won't start after update"
                                        value={form.title} 
                                        onChange={e => setForm({ ...form, title: e.target.value })} 
                                        required 
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'block' }}>
                                        Detailed Description *
                                    </label>
                                    <textarea 
                                        className="form-control" 
                                        rows={5} 
                                        style={{ borderRadius: '14px', fontSize: '15px', padding: '16px', lineHeight: '1.6' }}
                                        placeholder="Please provide as much detail as possible..."
                                        value={form.description} 
                                        onChange={e => setForm({ ...form, description: e.target.value })} 
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Section 2: Classification */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px', background: 'var(--bg)', borderRadius: '20px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', marginBottom: '8px', display: 'block' }}>Category *</label>
                                    <select className="form-control" style={{ height: '48px', borderRadius: '12px' }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        <option value="SOFTWARE">Software Issue</option>
                                        <option value="HARDWARE">Hardware Fault</option>
                                        <option value="NETWORK">Connectivity / Network</option>
                                        <option value="OTHER">Other / General</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', marginBottom: '8px', display: 'block' }}>Priority Level *</label>
                                    <select className="form-control" style={{ height: '48px', borderRadius: '12px' }} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                        <option value="LOW">Low - No rush</option>
                                        <option value="MEDIUM">Medium - Normal</option>
                                        <option value="HIGH">High - Urgent</option>
                                        <option value="CRITICAL">Critical - Blocking work</option>
                                    </select>
                                </div>
                            </div>

                            {/* Section 3: Location & Assignment */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', marginBottom: '8px', display: 'block' }}>Province *</label>
                                        <div style={{ position: 'relative' }}>
                                            <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <select
                                                className="form-control"
                                                style={{ paddingLeft: '40px', height: '48px', borderRadius: '12px' }}
                                                value={form.province}
                                                onChange={e => setForm({ ...form, province: e.target.value, district: '' })}
                                                required
                                            >
                                                <option value="">Select Province</option>
                                                {Object.keys(locationData).map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', marginBottom: '8px', display: 'block' }}>District *</label>
                                        <div style={{ position: 'relative' }}>
                                            <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <select
                                                className="form-control"
                                                style={{ paddingLeft: '40px', height: '48px', borderRadius: '12px' }}
                                                value={form.district}
                                                onChange={e => setForm({ ...form, district: e.target.value })}
                                                disabled={!form.province}
                                                required
                                            >
                                                <option value="">Select District</option>
                                                {form.province && locationData[form.province].map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', marginBottom: '8px', display: 'block' }}>Assign Technician (Optional)</label>
                                    <div style={{ position: 'relative' }}>
                                        <UserIcon size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <select
                                            className="form-control"
                                            style={{ paddingLeft: '40px', height: '48px', borderRadius: '12px' }}
                                            value={form.technicianId}
                                            onChange={e => {
                                                const tech = technicians.find(t => t.id === e.target.value);
                                                setForm({ ...form, technicianId: e.target.value, technicianName: tech ? tech.name : '' });
                                            }}
                                        >
                                            <option value="">Auto-assign by administrator</option>
                                            {technicians.map(t => (
                                                <option key={t.id} value={t.id}>{t.name} ({t.specialization || 'General Support'})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Attachments */}
                            <div style={{ padding: '24px', borderRadius: '18px', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', background: form.attachmentUrl ? 'var(--primary-50)' : 'transparent' }} 
                                 onPointerOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                 onPointerOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                    <Upload size={20} style={{ color: 'var(--primary)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                        {form.attachmentUrl ? form.attachmentUrl : 'Click to upload screenshot or log file'}
                                        <input
                                            type="file"
                                            style={{ display: 'none' }}
                                            onChange={e => setForm({ ...form, attachmentUrl: e.target.files[0]?.name || '' })}
                                        />
                                    </label>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Maximum file size: 10MB (PDF, PNG, JPG)</span>
                                </div>
                                {form.attachmentUrl && <ChevronRight size={20} style={{ color: 'var(--primary)' }} />}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '32px' }}>
                                <button type="button" className="btn btn-secondary btn-lg" style={{ borderRadius: '12px', height: '52px', minWidth: '120px' }} onClick={() => navigate('/user/tickets')}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-lg" style={{ borderRadius: '12px', height: '52px', minWidth: '200px', boxShadow: '0 8px 16px rgba(26, 111, 196, 0.2)' }} disabled={loading}>
                                    <Send size={18} />
                                    {loading ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 24px', background: 'rgba(26, 111, 196, 0.05)', borderRadius: '16px', color: 'var(--primary-dark)', fontSize: '13px' }}>
                        <Info size={16} />
                        <span>Tickets with <strong>Critical</strong> priority are prioritized for immediate resolution by our network operations center.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
