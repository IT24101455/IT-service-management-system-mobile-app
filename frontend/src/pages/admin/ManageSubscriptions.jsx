import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllSubscriptions, approveSubscription, rejectSubscription } from '../../api/api';
import Topbar from '../../components/Topbar';
import { CheckCircle, XCircle, Clock, Search, Filter, ExternalLink, User, Calendar, Receipt, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ManageSubscriptions() {
    const { user: currentUser } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            const res = await getAllSubscriptions();
            setSubscriptions(res.data);
        } catch (error) {
            toast.error("Failed to load subscriptions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const handleApprove = async (id) => {
        console.log('ManageSubscriptions: Approving sub:', id, 'Admin:', currentUser);
        try {
            await approveSubscription(id, currentUser.userId || currentUser.id);
            toast.success("Subscription approved and account activated");
            loadSubscriptions();
        } catch (error) {
            console.error('ManageSubscriptions: Approval failed:', error);
            toast.error("Approval failed");
        }
    };

    const handleReject = async () => {
        if (!rejectionReason) return toast.warning("Please provide a reason for rejection");
        try {
            await rejectSubscription(rejectModal.id, currentUser.userId || currentUser.id, rejectionReason);
            toast.success("Subscription rejected");
            setRejectModal(null);
            setRejectionReason('');
            loadSubscriptions();
        } catch (error) {
            toast.error("Rejection failed");
        }
    };

    const filtered = subscriptions
        .filter(s => filter === 'ALL' || s.status === filter)
        .filter(s => 
            s.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.technicianReference && s.technicianReference.toLowerCase().includes(searchTerm.toLowerCase()))
        );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return { bg: 'var(--success-50)', color: 'var(--success)' };
            case 'REJECTED': return { bg: 'var(--danger-50)', color: 'var(--danger)' };
            default: return { bg: 'var(--warning-50)', color: 'var(--warning)' };
        }
    };

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Topbar title="Technician Subscriptions" subtitle="Verify monthly payments and manage account activations" />
            
            <div className="page-content" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                
                {/* Stats Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--warning-50)', color: 'var(--warning)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>PENDING REVIEW</div>
                            <div style={{ fontSize: '24px', fontWeight: '900' }}>{subscriptions.filter(s => s.status === 'PENDING').length}</div>
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--success-50)', color: 'var(--success)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>APPROVED THIS MONTH</div>
                            <div style={{ fontSize: '24px', fontWeight: '900' }}>{subscriptions.filter(s => s.status === 'APPROVED').length}</div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: filter === f ? 'var(--primary)' : 'white',
                                    color: filter === f ? 'white' : 'var(--text-secondary)',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    boxShadow: filter === f ? '0 4px 12px rgba(26, 111, 196, 0.2)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '12px', background: 'white', border: '1px solid var(--border)' }}>
                            <Search size={18} style={{ color: 'var(--text-muted)' }} />
                            <input 
                                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', width: '250px' }} 
                                placeholder="Search technician or ref #" 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <div className="glass-card" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '100px 0', textAlign: 'center' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '100px 40px', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', background: 'var(--bg)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--text-muted)' }}>
                                <CreditCard size={40} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>No subscriptions found</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto' }}>Wait for technicians to submit their monthly payment proofs.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper" style={{ margin: 0 }}>
                            <table style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '20px 24px' }}>Technician</th>
                                        <th>Month / Year</th>
                                        <th>Payment Details</th>
                                        <th>Submission</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(sub => (
                                        <tr key={sub.id}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '40px', height: '40px', background: 'var(--primary-50)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                                                        {sub.technicianName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '800', fontSize: '14px' }}>{sub.technicianName}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>REF: {sub.technicianReference || 'N/A'}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {sub.technicianId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                                                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{sub.month} {sub.year}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '700', fontSize: '13px' }}>REF: {sub.referenceNumber}</div>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                    <a href={sub.paymentSlipUrl?.startsWith('http') ? sub.paymentSlipUrl : `http://localhost:8081${sub.paymentSlipUrl}`} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                                                        <ExternalLink size={12} /> View Payment Slip
                                                    </a>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px', fontWeight: '500' }}>{new Date(sub.submissionDate).toLocaleDateString()}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(sub.submissionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td>
                                                <div style={{ 
                                                    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '800',
                                                    background: getStatusStyle(sub.status).bg,
                                                    color: getStatusStyle(sub.status).color
                                                }}>
                                                    <div style={{ width: '6px', height: '6px', background: 'currentColor', borderRadius: '50%' }} />
                                                    {sub.status}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                                {sub.status === 'PENDING' ? (
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button 
                                                            className="btn btn-primary btn-sm" 
                                                            style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
                                                            onClick={() => handleApprove(sub.id)}
                                                        >
                                                            <CheckCircle size={14} /> Approve
                                                        </button>
                                                        <button 
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => setRejectModal(sub)}
                                                        >
                                                            <XCircle size={14} /> Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                        Verified by Ops Manager
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Rejection Modal */}
            {rejectModal && (
                <div className="modal-overlay" onClick={() => setRejectModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Reject Subscription</h3>
                            <button className="btn-icon" onClick={() => setRejectModal(null)}><XCircle size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: '14px', marginBottom: '16px' }}>Provide a reason for rejecting <strong>{rejectModal.technicianName}</strong>'s payment proof.</p>
                            <div className="form-group">
                                <label className="form-label">Reason for Rejection</label>
                                <textarea 
                                    className="form-control" 
                                    placeholder="e.g. Invalid reference number, blurry image..."
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setRejectModal(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleReject}>Reject Payment</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
