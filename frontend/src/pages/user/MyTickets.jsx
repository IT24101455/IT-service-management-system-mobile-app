import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTicketsByUser, updateTicket } from '../../api/api';
import Topbar from '../../components/Topbar';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/Badges';
import { Ticket, Search, PlusCircle, Star, Filter, Calendar, Clock, ChevronRight, MessageSquare, X, Info, MapPin, CheckCircle, AlertTriangle, FileText, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ChatModal from '../../components/ChatModal';

export default function MyTickets() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [loading, setLoading] = useState(true);

    const [ratingTicket, setRatingTicket] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ratingValue, setRatingValue] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const loadTickets = () => {
        setLoading(true);
        getTicketsByUser(user.userId)
            .then(res => setTickets(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadTickets();
    }, [user]);

    useEffect(() => {
        const handleNotif = () => loadTickets();
        window.addEventListener('notificationReceived', handleNotif);
        return () => window.removeEventListener('notificationReceived', handleNotif);
    }, []);

    const filtered = tickets
        .filter(t => filterStatus === 'ALL' || t.status === filterStatus)
        .filter(t => t.title?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()) || t.id?.includes(search));

    const submitRating = async () => {
        setSubmittingRating(true);
        try {
            await updateTicket(ratingTicket.id, { rating: ratingValue, ratingComment });
            toast.success('Thank you for your feedback!');
            setRatingTicket(null);
            setRatingValue(0);
            setRatingComment('');
            loadTickets();
        } catch {
            toast.error('Failed to submit rating');
        } finally {
            setSubmittingRating(false);
        }
    };

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Topbar title="Service History" subtitle="Track and manage your technical support requests" />
            <div className="page-content" style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
                
                {/* Search & Filter Header */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="glass-card" style={{ flex: 1, minWidth: '300px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <Search size={18} style={{ color: 'var(--text-muted)' }} />
                        <input 
                            style={{ flex: 1, background: 'transparent', border: 'none', height: '40px', outline: 'none', fontSize: '15px' }}
                            placeholder="Search by ticket title, ID or description..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                    </div>
                    
                    <div className="glass-card" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <Filter size={16} style={{ color: 'var(--primary)' }} />
                        <select 
                            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer' }}
                            value={filterStatus} 
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending Approval</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Archived / Closed</option>
                        </select>
                    </div>

                    <Link to="/user/tickets/new" className="btn btn-primary" style={{ height: '52px', padding: '0 24px', borderRadius: '16px', boxShadow: '0 8px 16px rgba(26, 111, 196, 0.15)' }}>
                        <PlusCircle size={18} /> New Request
                    </Link>
                </div>

                {/* Ticket Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {loading ? (
                        <div style={{ padding: '100px 0', textAlign: 'center' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center', borderRadius: '24px' }}>
                            <div style={{ width: '80px', height: '80px', background: 'var(--bg)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--text-muted)' }}>
                                <Ticket size={40} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>No tickets found</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto' }}>Adjust your filters or submit a new service request to get started.</p>
                        </div>
                    ) : (
                        filtered.map(t => (
                            <div key={t.id} className="glass-card hover-lift" style={{ padding: '24px', borderRadius: '20px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'start', transition: 'all 0.3s ease' }}>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ width: '56px', height: '56px', background: 'var(--bg)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)' }}>
                                        <Ticket size={24} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px' }}>#{t.id?.slice(-6).toUpperCase()}</span>
                                            <StatusBadge status={t.status} />
                                            <PriorityBadge priority={t.priority} />
                                        </div>
                                        <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>{t.title}</h3>
                                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {t.description}
                                        </p>
                                        
                                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                                                <span>{new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                                                <span>{new Date(t.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            {t.technicianName && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
                                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                                        {t.technicianName.charAt(0)}
                                                    </div>
                                                    <span>{t.technicianName}</span>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedTechnician({ id: t.technicianId, name: t.technicianName });
                                                            setIsChatOpen(true);
                                                        }}
                                                        style={{ 
                                                            background: 'rgba(26, 111, 196, 0.1)', 
                                                            border: 'none', 
                                                            color: 'var(--primary)', 
                                                            padding: '4px', 
                                                            borderRadius: '6px', 
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        title="Chat with Technician"
                                                    >
                                                        <MessageSquare size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
                                    <CategoryBadge category={t.category} />
                                    
                                    <div style={{ marginTop: 'auto' }}>
                                        {t.status === 'RESOLVED' && !t.rating ? (
                                            <button 
                                                className="btn btn-primary" 
                                                style={{ padding: '8px 20px', borderRadius: '12px', fontSize: '13px' }}
                                                onClick={() => setRatingTicket(t)}
                                            >
                                                Rate Support
                                            </button>
                                        ) : t.rating ? (
                                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '6px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Star size={14} fill="#f59e0b" />
                                                {t.rating}/5
                                            </div>
                                        ) : (
                                            <button 
                                                className="btn btn-outline btn-sm" 
                                                style={{ borderRadius: '10px' }}
                                                onClick={() => setSelectedTicket(t)}
                                            >
                                                View Details <ChevronRight size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

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
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
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
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                            >
                                <X size={20} />
                            </button>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '10px', borderRadius: '14px' }}>
                                    <Ticket size={24} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: '800', opacity: 0.8, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                        Ticket ID: #{selectedTicket.id?.slice(-8).toUpperCase()}
                                    </div>
                                    <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 0' }}>{selectedTicket.title}</h2>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <StatusBadge status={selectedTicket.status} />
                                <PriorityBadge priority={selectedTicket.priority} />
                                <CategoryBadge category={selectedTicket.category} />
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '40px', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                                
                                {/* Left Column: Description & Solution */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-primary)' }}>
                                            <FileText size={18} style={{ color: 'var(--primary)' }} />
                                            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Description</h3>
                                        </div>
                                        <div style={{ 
                                            padding: '20px', 
                                            background: 'var(--bg)', 
                                            borderRadius: '16px', 
                                            fontSize: '15px', 
                                            lineHeight: '1.6', 
                                            color: 'var(--text-secondary)',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {selectedTicket.description}
                                        </div>
                                    </section>

                                    {selectedTicket.solution ? (
                                        <section style={{ animation: 'slideUp 0.4s ease-out' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--success-dark)' }}>
                                                <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                                                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Resolution Details</h3>
                                            </div>
                                            <div style={{ 
                                                padding: '24px', 
                                                background: 'rgba(34, 197, 94, 0.05)', 
                                                border: '1px solid rgba(34, 197, 94, 0.2)', 
                                                borderRadius: '20px', 
                                                fontSize: '15px', 
                                                lineHeight: '1.6', 
                                                color: 'var(--text-primary)',
                                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.05)'
                                            }}>
                                                <div style={{ fontWeight: '800', fontSize: '13px', marginBottom: '10px', color: 'var(--success-dark)', textTransform: 'uppercase' }}>Official Solution:</div>
                                                {selectedTicket.solution}
                                            </div>
                                        </section>
                                    ) : (
                                        <section style={{ opacity: 0.7 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-muted)' }}>
                                                <Info size={18} />
                                                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Status Update</h3>
                                            </div>
                                            <div style={{ padding: '20px', borderRadius: '16px', border: '2px dashed var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                                                {selectedTicket.status === 'PENDING' 
                                                    ? 'Waiting for administrator to assign a technician.' 
                                                    : 'A technician is currently working on this issue.'}
                                            </div>
                                        </section>
                                    )}

                                    {selectedTicket.rating && (
                                        <section>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#f59e0b' }}>
                                                <Star size={18} fill="#f59e0b" />
                                                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Your Feedback</h3>
                                            </div>
                                            <div style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={16} fill={i < selectedTicket.rating ? '#f59e0b' : 'none'} color={i < selectedTicket.rating ? '#f59e0b' : '#cbd5e1'} />
                                                    ))}
                                                </div>
                                                <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                                    "{selectedTicket.ratingComment || 'No comment provided'}"
                                                </p>
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* Right Column: Meta Info */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', background: 'var(--bg-light)', border: '1px solid var(--border-light)' }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.5px' }}>Information</h4>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
                                                <div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Created Date</div>
                                                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{new Date(selectedTicket.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <MapPin size={18} style={{ color: 'var(--text-muted)' }} />
                                                <div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Location</div>
                                                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedTicket.province}, {selectedTicket.district}</div>
                                                </div>
                                            </div>

                                            {selectedTicket.technicianName && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', padding: '12px', background: 'white', borderRadius: '14px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                                                        {selectedTicket.technicianName.charAt(0)}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned Technician</div>
                                                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{selectedTicket.technicianName}</div>
                                                    </div>
                                                    <button 
                                                        className="btn btn-primary btn-sm"
                                                        style={{ padding: '8px', minWidth: '36px', height: '36px', borderRadius: '10px' }}
                                                        onClick={() => {
                                                            setSelectedTechnician({ id: selectedTicket.technicianId, name: selectedTicket.technicianName });
                                                            setIsChatOpen(true);
                                                        }}
                                                    >
                                                        <MessageSquare size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedTicket.attachmentUrl && (
                                        <div className="glass-card shadow-sm" style={{ padding: '20px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid var(--border-light)', cursor: 'pointer' }} onClick={() => window.open(selectedTicket.attachmentUrl, '_blank')}>
                                            <div style={{ padding: '10px', background: 'var(--bg)', borderRadius: '12px', color: 'var(--primary)' }}>
                                                <FileText size={20} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '13px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedTicket.attachmentUrl.split('/').pop()}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>View Attachment</div>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ 
                                        padding: '20px', 
                                        borderRadius: '20px', 
                                        background: 'rgba(26, 111, 196, 0.05)', 
                                        color: 'var(--primary-dark)', 
                                        fontSize: '13px', 
                                        lineHeight: '1.5',
                                        display: 'flex',
                                        gap: '12px'
                                    }}>
                                        <Info size={20} style={{ flexShrink: 0 }} />
                                        <span>If you have additional information regarding this ticket, please contact your assigned technician or use the support chat.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '24px 40px', background: 'var(--bg-light)', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" style={{ height: '44px', padding: '0 24px', borderRadius: '12px' }} onClick={() => setSelectedTicket(null)}>
                                Close View
                            </button>
                            {selectedTicket.status === 'RESOLVED' && !selectedTicket.rating && (
                                <button className="btn btn-primary" style={{ height: '44px', padding: '0 24px', borderRadius: '12px' }} onClick={() => { setSelectedTicket(null); setRatingTicket(selectedTicket); }}>
                                    Rate Support
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {ratingTicket && (
                <div className="modal-overlay" onClick={() => { setRatingTicket(null); setRatingValue(0); setRatingComment(''); }}>
                    <div className="glass-card modal-card" style={{ padding: '40px', borderRadius: '28px', border: 'none', maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <Star size={32} fill="#f59e0b" />
                            </div>
                            <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>Rate Your Experience</h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                How satisfied are you with the resolution provided for <strong>"{ratingTicket.title}"</strong>?
                            </p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', justifyContent: 'center' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    size={40}
                                    fill={star <= ratingValue ? '#f59e0b' : 'none'}
                                    color={star <= ratingValue ? '#f59e0b' : '#cbd5e1'}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transform: star <= ratingValue ? 'scale(1.1)' : 'scale(1)' }}
                                    onClick={() => setRatingValue(star)}
                                />
                            ))}
                        </div>
                        
                        <div style={{ marginBottom: '32px' }}>
                            <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', marginBottom: '8px', display: 'block' }}>Add a Comment (Optional)</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                style={{ borderRadius: '14px', padding: '12px', fontSize: '14px' }}
                                placeholder="Your feedback helps us improve..."
                                value={ratingComment}
                                onChange={e => setRatingComment(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-secondary" style={{ flex: 1, height: '48px', borderRadius: '12px' }} onClick={() => { setRatingTicket(null); setRatingValue(0); setRatingComment(''); }}>
                                Maybe Later
                            </button>
                            <button className="btn btn-primary" style={{ flex: 1, height: '48px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(26, 111, 196, 0.2)' }} onClick={submitRating} disabled={!ratingValue || submittingRating}>
                                {submittingRating ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {selectedTechnician && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    recipient={selectedTechnician}
                />
            )}
        </div>
    );
}
