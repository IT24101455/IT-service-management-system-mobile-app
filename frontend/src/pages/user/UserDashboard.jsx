import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTicketsByUser, getUsersByRole, getAllLeaves } from '../../api/api';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/Badges';
import { Ticket, Clock, CheckCircle, AlertCircle, PlusCircle, Search, Users, MapPin, Mail, Phone, MessagesSquare, UserPlus, Zap, History, ShieldQuestion, ArrowRight, BanIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useMemo } from 'react';
import ChatModal from '../../components/ChatModal';
import AssignTicketModal from '../../components/AssignTicketModal';
import TechnicianProfileModal from '../../components/TechnicianProfileModal';

export default function UserDashboard() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [onLeaveTechIds, setOnLeaveTechIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedTech, setSelectedTech] = useState(null);

    // Assignment State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedTechForAssign, setSelectedTechForAssign] = useState(null);
    const [selectedTechForProfile, setSelectedTechForProfile] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ticketsRes, techRes, leavesRes] = await Promise.all([
                getTicketsByUser(user.userId),
                getUsersByRole('TECHNICIAN'),
                getAllLeaves()
            ]);
            setTickets(ticketsRes.data);
            setTechnicians(techRes.data);

            // Determine which technicians are currently on approved leave
            const today = new Date();
            const onLeaveIds = new Set(
                (leavesRes.data || []).filter(leave => {
                    if (leave.status?.toUpperCase() !== 'APPROVED') return false;
                    const start = new Date(leave.startDate);
                    const end = new Date(leave.endDate);
                    // Normalize to date-only comparison
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    return today >= start && today <= end;
                }).map(leave => leave.technicianId)
            );
            setOnLeaveTechIds(onLeaveIds);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.userId]);

    const pendingTickets = useMemo(() =>
        tickets.filter(t => t.status?.toUpperCase() === 'PENDING'),
        [tickets]);

    const stats = {
        total: Math.max(0, tickets.length),
        pending: tickets.filter(t => t.status === 'PENDING').length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    };

    const recent = [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    const filteredTechnicians = useMemo(() => {
        return technicians.filter(tech => {
            const matchesSearch = !searchTerm ||
                tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (tech.specialization && tech.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesSearch;
        });
    }, [technicians, searchTerm]);

    const getTechAvailability = (tech) => {
        if (!tech.active) return { available: false, reason: 'Inactive Account' };
        if (onLeaveTechIds.has(tech.id)) return { available: false, reason: 'On Leave' };
        return { available: true, reason: 'Available' };
    };

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Topbar title={`Dashboard`} subtitle={`Welcome back, ${user.name}`} />
            
            <div className="page-content" style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
                
                {/* Hero Section */}
                <div className="glass-card" style={{ 
                    marginBottom: '32px', 
                    padding: '40px', 
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(26, 111, 196, 0.9) 0%, rgba(15, 79, 154, 0.9) 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-1px' }}>
                            Need technical assistance?
                        </h1>
                        <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px', maxWidth: '500px' }}>
                            Our experts are here to help. Search for a technician or submit a new service request below.
                        </p>
                        
                        <div style={{
                            display: 'flex',
                            background: 'rgba(255, 255, 255, 0.25)',
                            backdropFilter: 'blur(15px)',
                            padding: '10px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            maxWidth: '600px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <Search size={22} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'white' }} />
                                <input
                                    type="text"
                                    placeholder="Search technicians by name or skill..."
                                    className="dashboard-search-input"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px 12px 52px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        outline: 'none'
                                    }}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <Link to="/user/tickets/new" className="glass-card hover-lift" style={{ padding: '24px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ padding: '12px', background: 'var(--primary-50)', color: 'var(--primary)', borderRadius: '12px' }}>
                            <PlusCircle size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Submit Ticket</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Get help with your issues</p>
                        </div>
                        <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                    </Link>

                    <Link to="/user/tickets" className="glass-card hover-lift" style={{ padding: '24px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ padding: '12px', background: '#ecfdf5', color: '#10b981', borderRadius: '12px' }}>
                            <History size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Request History</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Track your past requests</p>
                        </div>
                        <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                    </Link>

                    <Link to="/user/complaints/new" className="glass-card hover-lift" style={{ padding: '24px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '12px' }}>
                            <ShieldQuestion size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Report Complaint</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Share your feedback</p>
                        </div>
                        <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                    </Link>
                </div>

                {/* Search Results (Conditional) */}
                {(searchTerm) && (
                    <div style={{ marginBottom: '40px', animation: 'slideUp 0.3s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={20} className="text-secondary" />
                                Technicians Found ({filteredTechnicians.length})
                            </h3>
                        </div>

                        {filteredTechnicians.length === 0 ? (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '64px', borderRadius: '24px' }}>
                                <Users size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.3 }} />
                                <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>We couldn't find any matching technicians</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                                {filteredTechnicians.map(tech => (
                                    <div key={tech.id} className="glass-card hover-lift" style={{ 
                                        padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
                                        opacity: getTechAvailability(tech).available ? 1 : 0.65,
                                        borderLeft: getTechAvailability(tech).available ? undefined : '3px solid rgba(239,68,68,0.4)',
                                        position: 'relative'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <div className="user-avatar" style={{ width: 56, height: 56, fontSize: '20px', borderRadius: '16px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                                                    {tech.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 style={{ fontWeight: '800', fontSize: '17px', color: 'var(--text-primary)' }}>{tech.name}</h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                                        <Zap size={12} style={{ color: 'var(--warning)' }} />
                                                        <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>{tech.specialization || 'Support Specialist'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Availability Badge */}
                                            {(() => {
                                                const avail = getTechAvailability(tech);
                                                return avail.available ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--success)', fontWeight: '800', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
                                                        AVAILABLE
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#dc2626', fontWeight: '800', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                        <BanIcon size={11} />
                                                        NOT AVAILABLE
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            {tech.experienceYears && (
                                                <div style={{ fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px', background: 'var(--primary-50)', color: 'var(--primary)', border: '1px solid var(--primary-100)' }}>
                                                    {tech.experienceYears}Y EXP
                                                </div>
                                            )}
                                            {tech.qualifications && tech.qualifications.length > 0 && (
                                                <div style={{ fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px', background: 'var(--success-light)', color: '#047857', border: '1px solid #a7f3d0' }}>
                                                    {tech.qualifications.length} CERTIFIED
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: 'var(--bg)', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                                <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                                                <span style={{ fontWeight: '500' }}>{tech.province}, {tech.district}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                                <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                                                <span style={{ fontWeight: '500' }}>{tech.email}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ flex: 1, borderRadius: '12px', fontSize: '13px' }}
                                                onClick={() => {
                                                    setSelectedTechForProfile(tech);
                                                    setIsProfileModalOpen(true);
                                                }}
                                            >
                                                <Users size={14} />
                                                Profile
                                            </button>
                                            <button
                                                className="btn btn-primary"
                                                style={{ flex: 1, borderRadius: '12px', fontSize: '13px' }}
                                                onClick={() => {
                                                    const avail = getTechAvailability(tech);
                                                    if (!avail.available) {
                                                        toast.warning(`${tech.name} is currently not available (${avail.reason}).`);
                                                        return;
                                                    }
                                                    setSelectedTechForAssign(tech);
                                                    setIsAssignModalOpen(true);
                                                }}
                                                disabled={!getTechAvailability(tech).available}
                                            >
                                                <UserPlus size={14} />
                                                Assign
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Stats Overview */}
                <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={20} style={{ color: 'var(--warning)' }} />
                        Operational Status
                    </h3>
                    <div className="stats-grid">
                        <StatCard label="Total Service Requests" value={stats.total} icon={Ticket} color="blue" trend={5} />
                        <StatCard label="Awaiting Response" value={stats.pending} icon={Clock} color="yellow" trend={-2} />
                        <StatCard label="Active Troubleshooting" value={stats.inProgress} icon={AlertCircle} color="blue" />
                        <StatCard label="Successfully Resolved" value={stats.resolved} icon={CheckCircle} color="green" />
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={{ marginTop: '40px' }}>
                    <div className="glass-card" style={{ overflow: 'hidden' }}>
                        <div className="card-header" style={{ padding: '24px 32px', background: 'transparent' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Recent Activity</h3>
                            <Link to="/user/tickets/new" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
                                <PlusCircle size={14} /> New Ticket
                            </Link>
                        </div>
                        <div className="card-body" style={{ padding: '0 32px 32px' }}>
                            {loading ? <div className="loading-spinner" /> :
                                tickets.length === 0 ? (
                                    <div className="empty-state" style={{ padding: '60px 0' }}>
                                        <div style={{ width: '80px', height: '80px', background: 'var(--bg)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifySelf: 'center', margin: '0 auto 20px', color: 'var(--text-muted)' }}>
                                            <Ticket size={40} style={{ margin: 'auto' }} />
                                        </div>
                                        <h3 style={{ fontSize: '18px' }}>No active tickets</h3>
                                        <p style={{ maxWidth: '300px', margin: '0 auto 20px' }}>Once you submit a service request, it will appear here for tracking.</p>
                                        <Link to="/user/tickets/new" className="btn btn-primary" style={{ borderRadius: '12px' }}>
                                            <PlusCircle size={18} /> Submit Ticket
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="table-wrapper">
                                        <table style={{ borderSpacing: '0 8px', borderCollapse: 'separate' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ background: 'transparent', padding: '12px 16px' }}>Request Details</th>
                                                    <th style={{ background: 'transparent', padding: '12px 16px' }}>Category</th>
                                                    <th style={{ background: 'transparent', padding: '12px 16px' }}>Priority</th>
                                                    <th style={{ background: 'transparent', padding: '12px 16px' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recent.map(t => (
                                                    <tr key={t.id} className="hover-lift" style={{ borderRadius: '12px', background: 'var(--bg-card)', transition: 'all 0.2s' }}>
                                                        <td style={{ padding: '20px 16px', borderBottom: 'none', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>{t.title}</span>
                                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Ticket #{t.id.slice(-6).toUpperCase()}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '20px 16px', borderBottom: 'none' }}><CategoryBadge category={t.category} /></td>
                                                        <td style={{ padding: '20px 16px', borderBottom: 'none' }}><PriorityBadge priority={t.priority} /></td>
                                                        <td style={{ padding: '20px 16px', borderBottom: 'none', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}><StatusBadge status={t.status} /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
            {selectedTech && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    recipient={selectedTech}
                />
            )}
            {selectedTechForAssign && (
                <AssignTicketModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    technician={selectedTechForAssign}
                    pendingTickets={pendingTickets}
                    onAssignmentSuccess={fetchData}
                />
            )}
            {selectedTechForProfile && (
                <TechnicianProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    technician={selectedTechForProfile}
                    onMessage={(tech) => {
                        setSelectedTech(tech);
                        setIsChatOpen(true);
                    }}
                />
            )}
        </div>
    );
}
