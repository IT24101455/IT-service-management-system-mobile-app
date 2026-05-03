import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitSubscription, getSubscriptionHistory, uploadSlip, getUser } from '../../api/api';
import Topbar from '../../components/Topbar';
import { CreditCard, Upload, CheckCircle, Clock, XCircle, AlertTriangle, FileText, Calendar, DollarSign, Info } from 'lucide-react';
import { toast } from 'react-toastify';

export default function SubscriptionPayment() {
    const { user, updateAuthUser } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    const [formData, setFormData] = useState({
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNumber: '',
        month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()),
        year: new Date().getFullYear(),
        paymentSlipUrl: ''
    });

    const loadHistory = async () => {
        try {
            const res = await getSubscriptionHistory(user.userId || user.id);
            setHistory(res.data);
        } catch (error) {
            toast.error("Failed to load payment history");
        } finally {
            setLoading(false);
        }
    };

    const fetchLatestUser = async () => {
        try {
            const res = await getUser(user.userId || user.id);
            updateAuthUser(res.data);
        } catch (error) {
            console.error("Failed to fetch latest user status", error);
        }
    };

    useEffect(() => {
        loadHistory();
        fetchLatestUser();
    }, [user.userId, user.id]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append('file', file);

        setUploading(true);
        try {
            const res = await uploadSlip(data);
            setFormData({ ...formData, paymentSlipUrl: res.data.url });
            toast.success("Payment slip uploaded successfully");
        } catch (error) {
            toast.error("File upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.paymentSlipUrl) {
            return toast.warning("Please upload a payment slip first");
        }

        try {
            await submitSubscription({
                ...formData,
                technicianId: user?.id || user?.userId,
                technicianName: user?.name,
                technicianReference: user?.technicianReference || `TECH-${(user?.id || user?.userId || 'XXXXXXXX').substring(0, 8).toUpperCase()}`,
                amount: 1500
            });
            toast.success("Subscription submitted for verification");
            setFormData({
                paymentDate: new Date().toISOString().split('T')[0],
                referenceNumber: '',
                month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()),
                year: new Date().getFullYear(),
                paymentSlipUrl: ''
            });
            loadHistory();
        } catch (error) {
            toast.error("Submission failed");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'var(--success)';
            case 'REJECTED': return 'var(--danger)';
            default: return 'var(--warning)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle size={14} />;
            case 'REJECTED': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Topbar title="Monthly Subscription" subtitle="Manage your technician account status and payments" />
            
            <div className="page-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
                    
                    {/* Left Side: Info & Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Account Status Card */}
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: user.active ? 'var(--success-50)' : 'var(--danger-50)', border: user.active ? '1px solid var(--success-100)' : '1px solid var(--danger-100)' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: user.active ? 'var(--success)' : 'var(--danger)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {user.active ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                            </div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: user.active ? 'var(--success)' : 'var(--danger)', textTransform: 'uppercase', letterSpacing: '1px' }}>Account Status</div>
                                <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)' }}>{user.active ? 'Active' : 'Inactive'}</div>
                                {!user.active && <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>Payment overdue. Please submit proof to reactivate.</div>}
                            </div>
                        </div>

                        {/* Bank Details Card */}
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ width: '40px', height: '40px', background: 'var(--primary-50)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Info size={20} />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Bank Transfer Details</h3>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '16px' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Operations Manager</div>
                                    <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Tharaniya Jeyapalan</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '16px' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Account Number</div>
                                        <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>86002310</div>
                                    </div>
                                    <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '16px' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Bank</div>
                                        <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Bank of Ceylon</div>
                                    </div>
                                </div>
                                <div style={{ background: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>Monthly Amount</div>
                                    <div style={{ fontSize: '20px', fontWeight: '900' }}>LKR 1,500.00</div>
                                </div>
                                <div style={{ border: '2px dashed var(--primary-100)', padding: '16px', borderRadius: '16px', textAlign: 'center', background: 'var(--primary-50)' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Your Unique Reference Number</div>
                                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '2px' }}>
                                        {user?.technicianReference || `TECH-${(user?.id || user?.userId || 'XXXXXXXX').substring(0, 8).toUpperCase()}`}
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Include this number in your bank transfer description</div>
                                </div>
                            </div>
                        </div>

                        {/* Submission Form */}
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Submit Payment Proof</h3>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Month</label>
                                        <select 
                                            className="form-control" 
                                            value={formData.month} 
                                            onChange={e => setFormData({...formData, month: e.target.value})}
                                        >
                                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Year</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={formData.year} 
                                            onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Payment Date</label>
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            value={formData.paymentDate} 
                                            onChange={e => setFormData({...formData, paymentDate: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Ref Number</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Bank Ref #"
                                            value={formData.referenceNumber} 
                                            onChange={e => setFormData({...formData, referenceNumber: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Payment Slip (Image/PDF)</label>
                                    <div style={{ 
                                        border: '2px dashed var(--border)', 
                                        borderRadius: '16px', 
                                        padding: '20px', 
                                        textAlign: 'center',
                                        position: 'relative',
                                        background: formData.paymentSlipUrl ? 'var(--success-50)' : 'transparent',
                                        transition: 'all 0.3s'
                                    }}>
                                        {uploading ? (
                                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                                        ) : formData.paymentSlipUrl ? (
                                            <div style={{ color: 'var(--success)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                <CheckCircle size={32} />
                                                <span style={{ fontSize: '13px', fontWeight: '700' }}>Slip Uploaded</span>
                                            </div>
                                        ) : (
                                            <div style={{ color: 'var(--text-muted)' }}>
                                                <Upload size={32} style={{ marginBottom: '8px' }} />
                                                <div style={{ fontSize: '13px', fontWeight: '600' }}>Click to upload file</div>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                                            onChange={handleFileChange}
                                            accept="image/*,application/pdf"
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ height: '52px', borderRadius: '16px' }}>
                                    Submit Subscription
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Side: History */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="glass-card" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Payment History</h3>
                                <CreditCard size={20} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            
                            {loading ? (
                                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                                    <div className="loading-spinner" style={{ margin: '0 auto' }} />
                                </div>
                            ) : history.length === 0 ? (
                                <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                                    <div style={{ width: '64px', height: '64px', background: 'var(--bg)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--text-muted)' }}>
                                        <FileText size={32} />
                                    </div>
                                    <h4 style={{ fontWeight: '800', marginBottom: '8px' }}>No records found</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Your subscription history will appear here.</p>
                                </div>
                            ) : (
                                <div className="table-wrapper" style={{ margin: 0 }}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Month / Year</th>
                                                <th>Reference</th>
                                                <th>Status</th>
                                                <th>Submission</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map(item => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div style={{ fontWeight: '700' }}>{item.month}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.year}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>{item.referenceNumber}</div>
                                                        <a href={item.paymentSlipUrl?.startsWith('http') ? item.paymentSlipUrl : `http://localhost:8081${item.paymentSlipUrl}`} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            View Slip
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <div style={{ 
                                                            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800',
                                                            background: getStatusColor(item.status) + '15',
                                                            color: getStatusColor(item.status)
                                                        }}>
                                                            {getStatusIcon(item.status)}
                                                            {item.status}
                                                        </div>
                                                        {item.status === 'REJECTED' && (
                                                            <div style={{ fontSize: '10px', color: 'var(--danger)', marginTop: '4px', maxWidth: '150px' }}>{item.rejectionReason}</div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div style={{ fontSize: '12px' }}>{new Date(item.submissionDate).toLocaleDateString()}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
