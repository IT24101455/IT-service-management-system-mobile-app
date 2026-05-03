import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTicketsByTechnician, updateTicket } from '../../api/api';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import { Ticket, Clock, CheckCircle, AlertCircle, MessageSquare, User as UserIcon } from 'lucide-react';
import { calculateSlaStatus } from '../../utils/dateUtils';
import ChatModal from '../../components/ChatModal';
import { getInbox } from '../../api/api';
import { toast } from 'react-toastify';

export default function TechnicianDashboard() {
    // Context for currently logged-in user and state variables for tickets, loading status, inbox, and chat
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inbox, setInbox] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Fetches assigned tickets and inbox messages for the technician
    const loadData = async () => {
        setLoading(true);
        try {
            const [ticketsRes, inboxRes] = await Promise.all([
                getTicketsByTechnician(user.userId),
                getInbox(user.userId)
            ]);
            setTickets(ticketsRes.data);

            const uniqueSenders = [];
            const seenSenders = new Set();
            inboxRes.data.forEach(msg => {
                if (!seenSenders.has(msg.senderId)) {
                    seenSenders.add(msg.senderId);
                    uniqueSenders.push({ id: msg.senderId, name: 'User' });
                }
            });
            setInbox(uniqueSenders);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.userId]);

    // Handles updating a ticket's status and refreshes dashboard data on success
    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            await updateTicket(ticketId, { status: newStatus });
            toast.success('Ticket status updated');
            loadData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // Compute summary statistics based on current tickets
    const stats = {
        total: tickets.length,
        pending: tickets.filter(t => t.status === 'PENDING').length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    };

    // Identify unresolved urgent tickets for the top alerts section
    const urgent = tickets.filter(t => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && t.status !== 'RESOLVED');

    return (
        <>
            <Topbar title={`Technician Panel – ${user.name}`} subtitle="Manage your assigned tickets" />
            <div className="page-content">
                <div className="stats-grid">
                    <StatCard label="Assigned" value={stats.total} icon={Ticket} color="blue" />
                    <StatCard label="Pending" value={stats.pending} icon={Clock} color="yellow" />
                    <StatCard label="In Progress" value={stats.inProgress} icon={AlertCircle} color="blue" />
                    <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} color="green" />
                </div>

                {urgent.length > 0 && (
                    <div className="card" style={{ marginBottom: 20, borderLeft: '4px solid var(--danger)' }}>
                        <div className="card-header">
                            <span className="card-title" style={{ color: 'var(--danger)' }}>⚠ Urgent Tickets ({urgent.length})</span>
                        </div>
                        <div className="card-body" style={{ padding: 0 }}>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Title</th><th>Priority</th><th>Deadline</th><th>Status</th><th>Submitted By</th></tr></thead>
                                    <tbody>
                                        {urgent.map(t => (
                                            <tr key={t.id}>
                                                <td style={{ fontWeight: 600 }}>{t.title}</td>
                                                <td><PriorityBadge priority={t.priority} /></td>
                                                <td>
                                                    {t.slaDeadline && (() => {
                                                        const sla = calculateSlaStatus(t.slaDeadline, t.status);
                                                        return (
                                                            <span style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                                padding: '3px 10px', borderRadius: '9999px',
                                                                fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-header">
                        <span className="card-title">Recent Chats</span>
                    </div>
                    <div className="card-body">
                        {inbox.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No recent chats</p>
                        ) : (
                            <div style={{ display: 'flex', gap: 15, overflowX: 'auto', paddingBottom: 10 }}>
                                {inbox.map(chatUser => (
                                    <button
                                        key={chatUser.id}
                                        onClick={() => {
                                            setSelectedUser(chatUser);
                                            setIsChatOpen(true);
                                        }}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                            background: 'none', border: 'none', cursor: 'pointer', minWidth: 80
                                        }}
                                    >
                                        <div className="stat-icon purple" style={{ width: 48, height: 48 }}>
                                            <UserIcon size={20} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600 }}>Message User</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">All Assigned Tickets</span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {loading ? <div className="loading-spinner" /> :
                            tickets.length === 0 ? (
                                <div className="empty-state">
                                    <Ticket size={48} />
                                    <h3>No tickets assigned yet</h3>
                                </div>
                            ) : (
                                <div className="table-wrapper">
                                    <table>
                                        <thead><tr><th>Title</th><th>Category</th><th>Priority</th><th>Deadline</th><th>Status</th><th>User</th><th>Date</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                                        <tbody>
                                            {tickets.map(t => (
                                                <tr key={t.id}>
                                                    <td style={{ fontWeight: 600 }}>{t.title}</td>
                                                    <td style={{ color: 'var(--text-secondary)' }}>{t.category}</td>
                                                    <td><PriorityBadge priority={t.priority} /></td>
                                                    <td>
                                                        {t.slaDeadline && (() => {
                                                            const sla = calculateSlaStatus(t.slaDeadline, t.status);
                                                            return (
                                                                <span style={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                                                    padding: '3px 10px', borderRadius: '9999px',
                                                                    fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
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
                                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button
                                                            className="btn btn-outline btn-sm"
                                                            onClick={() => {
                                                                setSelectedUser({ id: t.userId, name: t.userName });
                                                                setIsChatOpen(true);
                                                            }}
                                                        >
                                                            <MessageSquare size={14} /> Chat
                                                        </button>
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
            {selectedUser && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    recipient={selectedUser}
                />
            )}
        </>
    );
}
