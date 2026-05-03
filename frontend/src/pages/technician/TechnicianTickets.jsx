import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTicketsByTechnician, updateTicket } from '../../api/api';
import Topbar from '../../components/Topbar';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import { toast } from 'react-toastify';
import { CheckCircle, RefreshCw, MessageSquare, Eye, X, Info, MapPin, Calendar, FileText, User as UserIcon, AlertTriangle, Ticket, Clock, ShieldAlert } from 'lucide-react';
import { calculateSlaStatus, formatDeadline } from '../../utils/dateUtils';
import ChatModal from '../../components/ChatModal';

export default function TechnicianTickets() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [solution, setSolution] = useState('');
    const [updating, setUpdating] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const load = () => {
        setLoading(true);
        getTicketsByTechnician(user.userId)
            .then(res => setTickets(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [user]);

    const handleUpdate = async (id, status) => {
        setUpdating(true);
        try {
            await updateTicket(id, { status, solution: status === 'RESOLVED' ? solution : undefined });
            toast.success(`Ticket marked as ${status}`);
            setModal(null);
            setSolution('');
            load();
        } catch { toast.error('Update failed'); }
        finally { setUpdating(false); }
    };

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            await updateTicket(ticketId, { status: newStatus });
            toast.success('Ticket status updated');
            load();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <>
            <Topbar title="My Tickets" subtitle="Update ticket status and solutions" />
            <div className="page-content">
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Assigned Tickets</span>
                        <button className="btn btn-secondary btn-sm" onClick={load}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {loading ? <div className="loading-spinner" /> : (
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Ref</th><th>Title</th><th>Priority</th><th>SLA Deadline</th><th>Status</th><th>User</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {tickets.map(t => (
                                            <tr key={t.id}>
                                                <td style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.5px' }}>#{t.id?.slice(-6).toUpperCase()}</td>
                                                <td style={{ fontWeight: 600, maxWidth: 200 }}>{t.title}</td>
                                                <td><PriorityBadge priority={t.priority} /></td>
                                                <td>
                                                    {t.slaBreached ? (
                                                        <span style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                                            padding: '3px 10px', borderRadius: '9999px',
                                                            fontSize: 11, fontWeight: 700,
                                                            background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca'
                                                        }}>
                                                            <ShieldAlert size={11} /> SLA Breached
                                                        </span>
                                                    ) : (() => {
                                                        const sla = calculateSlaStatus(t.slaDeadline, t.status);
                                                        return (
                                                            <span style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                                padding: '3px 10px', borderRadius: '9999px',
                                                                fontSize: 11, fontWeight: 600,
                                                                ...sla.style
                                                            }}>
                                                                <Clock size={11} /> {sla.text}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td>
                                                    <select
                                                        value={t.status}
                                                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                                                        className="form-control"
                                                        style={{ padding: '4px 8px', fontSize: '12px', height: 'auto', width: 'auto' }}
                                                    >
                                                        <option value="PENDING">Pending</option>
                                                        <option value="IN_PROGRESS">In Progress</option>
                                                        <option value="RESOLVED">Resolved</option>
                                                        <option value="CLOSED">Closed</option>
                                                    </select>
                                                </td>
                                                <td>{t.userName}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button 
                                                            className="btn btn-outline btn-sm"
                                                            style={{ padding: '6px 10px', minWidth: '40px' }}
                                                            onClick={() => setSelectedTicket(t)}
                                                            title="View Details"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline btn-sm"
                                                            style={{ padding: '6px 10px', minWidth: '40px' }}
                                                            onClick={() => {
                                                                setSelectedUser({ id: t.userId, name: t.userName });
                                                                setIsChatOpen(true);
                                                            }}
                                                            title="Chat with User"
                                                        >
                                                            <MessageSquare size={14} />
                                                        </button>
                                                        {t.status === 'IN_PROGRESS' && (
                                                            <button className="btn btn-success btn-sm" onClick={() => { setModal(t); setSolution(''); }}>
                                                                <CheckCircle size={13} /> Resolve
                                                            </button>
                                                        )}
                                                        {t.status === 'RESOLVED' && (
                                                            <span style={{ color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>✓ Done</span>
                                                        )}
                                                    </div>
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

            {modal && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">Resolve Ticket</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => setModal(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: 12, color: 'var(--text-secondary)' }}>
                                <strong>{modal.title}</strong>
                            </p>
                            <div className="form-group">
                                <label className="form-label">Solution Details</label>
                                <textarea className="form-control" rows={5} placeholder="Describe the solution applied..."
                                    value={solution} onChange={e => setSolution(e.target.value)} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                            <button className="btn btn-success" disabled={updating} onClick={() => handleUpdate(modal.id, 'RESOLVED')}>
                                <CheckCircle size={15} /> {updating ? 'Saving...' : 'Mark Resolved'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {selectedUser && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    recipient={selectedUser}
                />
            )}

            {/* Ticket Details Modal */}
            {selectedTicket && (
                <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
                    <div 
                        className="glass-card modal-card" 
                        style={{ 
                            padding: '0', 
                            borderRadius: '28px', 
                            border: 'none', 
                            maxWidth: '700px', 
                            width: '95%',
                            overflow: 'hidden',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column'
                        }} 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{ 
                            padding: '32px 40px', 
                            background: 'linear-gradient(135deg, #1a365d 0%, #2a4365 100%)',
                            color: 'white',
                            position: 'relative'
                        }}>
                            <button 
                                onClick={() => setSelectedTicket(null)}
                                style={{ 
                                    position: 'absolute', 
                                    right: '24px', 
                                    top: '24px', 
                                    background: 'rgba(255, 255, 255, 0.2)', 
                                    border: 'none', 
                                    color: 'white', 
                                    padding: '8px', 
                                    borderRadius: '12px', 
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '10px', borderRadius: '14px' }}>
                                    <Ticket size={24} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '800', opacity: 0.8, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                        Ticket ID: #{selectedTicket.id?.slice(-8).toUpperCase()}
                                    </div>
                                    <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 0' }}>{selectedTicket.title}</h2>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <StatusBadge status={selectedTicket.status} />
                                <PriorityBadge priority={selectedTicket.priority} />
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '32px 40px', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                                
                                {/* Left Column: Description & Feedback */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-primary)' }}>
                                            <FileText size={18} style={{ color: 'var(--primary)' }} />
                                            <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Full Description</h3>
                                        </div>
                                        <div style={{ 
                                            padding: '20px', 
                                            background: '#f8fafc', 
                                            borderRadius: '16px', 
                                            fontSize: '14px', 
                                            lineHeight: '1.6', 
                                            color: 'var(--text-secondary)',
                                            border: '1px solid var(--border-light)',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {selectedTicket.description}
                                        </div>
                                    </section>

                                    {selectedTicket.rating && (
                                        <section>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#f59e0b' }}>
                                                <Star size={18} fill="#f59e0b" />
                                                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>User Feedback</h3>
                                            </div>
                                            <div style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={16} fill={i < selectedTicket.rating ? '#f59e0b' : 'none'} color={i < selectedTicket.rating ? '#f59e0b' : '#cbd5e1'} />
                                                    ))}
                                                </div>
                                                <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic', color: '#92400e' }}>
                                                    "{selectedTicket.ratingComment || 'No comment provided'}"
                                                </p>
                                            </div>
                                        </section>
                                    )}

                                    {selectedTicket.solution && (
                                        <section>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--success-dark)' }}>
                                                <CheckCircle size={18} />
                                                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Applied Resolution</h3>
                                            </div>
                                            <div style={{ padding: '20px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                                {selectedTicket.solution}
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* Right Column: Meta Info */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ padding: '24px', borderRadius: '20px', background: '#f8fafc', border: '1px solid var(--border-light)' }}>
                                        <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.5px' }}>Ticket Info</h4>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {/* SLA Breach Banner */}
                                            {selectedTicket.slaBreached && (
                                                <div style={{
                                                    padding: '12px 16px',
                                                    background: 'linear-gradient(135deg, #fef2f2, #fff5f5)',
                                                    border: '1.5px solid #fecaca',
                                                    borderRadius: '12px',
                                                    display: 'flex', alignItems: 'center', gap: '10px'
                                                }}>
                                                    <ShieldAlert size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
                                                    <div>
                                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#dc2626' }}>SLA DEADLINE BREACHED</div>
                                                        <div style={{ fontSize: '11px', color: '#ef4444' }}>Missed resolution deadline — ticket may be reassigned.</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* SLA Deadline row */}
                                            {selectedTicket.slaDeadline && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <Clock size={18} style={{ color: selectedTicket.slaBreached ? '#dc2626' : 'var(--text-muted)' }} />
                                                    <div>
                                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SLA Deadline</div>
                                                        <div style={{ fontSize: '13px', fontWeight: '700', color: selectedTicket.slaBreached ? '#dc2626' : 'var(--text-primary)' }}>
                                                            {formatDeadline(selectedTicket.slaDeadline)}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <UserIcon size={18} style={{ color: 'var(--text-muted)' }} />
                                                <div>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Submitted By</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{selectedTicket.userName}</div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
                                                <div>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Created Date</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{new Date(selectedTicket.createdAt).toLocaleDateString()} {new Date(selectedTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <MapPin size={18} style={{ color: 'var(--text-muted)' }} />
                                                <div>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>User Location</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{selectedTicket.province}, {selectedTicket.district}</div>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Info size={18} style={{ color: 'var(--text-muted)' }} />
                                                <div>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Category</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>{selectedTicket.category || 'NOT SPECIFIED'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedTicket.attachmentUrl && (
                                        <button 
                                            className="btn btn-outline" 
                                            style={{ 
                                                width: '100%', 
                                                padding: '14px', 
                                                borderRadius: '16px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: '10px',
                                                background: 'white',
                                                border: '1px solid var(--border-light)'
                                            }}
                                            onClick={() => window.open(selectedTicket.attachmentUrl, '_blank')}
                                        >
                                            <FileText size={18} />
                                            <span style={{ fontSize: '13px', fontWeight: '700' }}>View Attachment</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '24px 40px', background: '#f8fafc', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" style={{ height: '42px', padding: '0 20px', borderRadius: '10px' }} onClick={() => setSelectedTicket(null)}>
                                Close Details
                            </button>
                            {selectedTicket.status === 'IN_PROGRESS' && (
                                <button className="btn btn-success" style={{ height: '42px', padding: '0 20px', borderRadius: '10px' }} onClick={() => { setSelectedTicket(null); setModal(selectedTicket); }}>
                                    Mark Resolved
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const Star = ({ size, fill, color, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);
