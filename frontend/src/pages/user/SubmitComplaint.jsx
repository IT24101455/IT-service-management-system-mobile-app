import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaint, getUsersByRole } from '../../api/api';
import Topbar from '../../components/Topbar';
import { toast } from 'react-toastify';
import { Send, User as UserIcon, AlertTriangle, ShieldAlert, Info } from 'lucide-react';

export default function SubmitComplaint() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        technicianId: '', description: ''
    });
    const [loading, setLoading] = useState(false);
    const [technicians, setTechnicians] = useState([]);

    useEffect(() => {
        const fetchTechs = async () => {
            try {
                const res = await getUsersByRole('TECHNICIAN');
                setTechnicians(res.data);
            } catch (err) {
                console.error('Failed to fetch technicians', err);
            }
        };
        fetchTechs();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createComplaint({
                technicianId: form.technicianId,
                description: form.description
            });
            toast.success('Complaint submitted successfully!');
            navigate('/user/dashboard');
        } catch {
            toast.error('Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Topbar title="Submit Complaint" subtitle="Report issues or feedback regarding technical service" />
            <div className="page-content" style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
                
                <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                    {/* Decorative Background */}
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%)', zIndex: 0 }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>Issue Reporting</h2>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>All reports are reviewed by the administration panel.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'block' }}>
                                    Target Technician *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <select
                                        className="form-control"
                                        style={{ height: '52px', paddingLeft: '44px', borderRadius: '14px', fontSize: '15px' }}
                                        value={form.technicianId}
                                        onChange={e => setForm({ ...form, technicianId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select the technician involved...</option>
                                        {technicians.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.specialization || 'General Support'})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'block' }}>
                                    Detailed Description *
                                </label>
                                <textarea 
                                    className="form-control" 
                                    rows={6} 
                                    style={{ borderRadius: '14px', fontSize: '15px', padding: '16px', lineHeight: '1.6' }}
                                    placeholder="Please provide a factual and detailed account of the issue. Include dates, specific incidents, and impact on your work..."
                                    value={form.description} 
                                    onChange={e => setForm({ ...form, description: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '32px' }}>
                                <button type="button" className="btn btn-secondary btn-lg" style={{ borderRadius: '12px', height: '52px', minWidth: '120px' }} onClick={() => navigate('/user/dashboard')}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-lg" style={{ borderRadius: '12px', height: '52px', minWidth: '220px', background: '#ef4444', borderColor: '#ef4444', boxShadow: '0 8px 16px rgba(239, 68, 68, 0.2)' }} disabled={loading}>
                                    <ShieldAlert size={18} />
                                    {loading ? 'Submitting...' : 'Confirm Submission'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '20px 24px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', color: '#b91c1c', fontSize: '13px' }}>
                        <Info size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div style={{ lineHeight: '1.6' }}>
                            <strong>Privacy Notice:</strong> Your complaint will be shared with the IT Administration for investigation. Please ensure all information provided is accurate and professional.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
