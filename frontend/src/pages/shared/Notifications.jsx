import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markRead, markAllRead } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import { Bell, CheckCheck, Ticket, CreditCard, Settings, Calendar, Info, Inbox, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useWebSocket } from '../../context/WebSocketContext';

const typeIcons = {
    TICKET_CREATED: Ticket,
    TICKET_UPDATED: Ticket,
    TICKET_RESOLVED: Ticket,
    PAYMENT: CreditCard,
    SYSTEM: Settings,
};

const typeColors = {
    TICKET_CREATED: 'var(--primary)',
    TICKET_UPDATED: 'var(--warning)',
    TICKET_RESOLVED: 'var(--success)',
    PAYMENT: 'var(--info)',
    SYSTEM: 'var(--text-muted)',
};

export default function Notifications() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { subscribe, isConnected } = useWebSocket();

    const load = () => {
        if (!user?.userId) return;
        setLoading(true);
        getNotifications(user.userId)
            .then(res => setNotifications(res.data))
            .catch(err => console.error("Failed to load notifications:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { 
        load(); 
    }, [user]);

    useEffect(() => {
        if (isConnected && user?.userId) {
            console.log("Subscribing to notifications for user:", user.userId);
            const sub = subscribe(`/user/${user.userId}/queue/notifications`, (newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
                toast.info(`New Notification: ${newNotif.title}`, {
                    position: "top-right",
                    autoClose: 5000,
                    icon: <Bell size={18} />
                });
            });
            return () => {
                if (sub) sub.unsubscribe();
            };
        }
    }, [isConnected, user, subscribe]);

    const handleMarkRead = async (id) => {
        try {
            await markRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            toast.error("Failed to mark as read");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllRead(user.userId);
            toast.success('All notifications marked as read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            toast.error("Failed to mark all as read");
        }
    };

    const handleNotificationClick = (n) => {
        const title = n.title || '';
        const type = n.type || '';
        
        if (title.includes('Leave Request') || type === 'LEAVE_REQUEST') {
            if (user.role === 'ADMIN') navigate('/admin/leaves');
            else if (user.role === 'TECHNICIAN') navigate('/technician/schedule');
        } else if (type === 'PAYMENT') {
            navigate('/payments');
        } else if (title.includes('Complaint') || type === 'SYSTEM') {
            if (user.role === 'ADMIN') navigate('/admin/complaints');
        } else if (n.ticketId) {
            if (user.role === 'ADMIN') navigate('/admin/tickets');
            else if (user.role === 'TECHNICIAN') navigate('/technician/tickets');
            else navigate('/user/tickets');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Topbar title="Inbox" subtitle="Manage your alerts and service updates" />
            <div className="page-content" style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--primary-50)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bell size={20} />
                            </div>
                            <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)' }}>Notifications</h1>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', paddingLeft: '52px' }}>
                            {unreadCount > 0 ? `You have ${unreadCount} unread updates.` : "You're all caught up for today."}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button className="btn btn-secondary" onClick={handleMarkAllRead} style={{ borderRadius: '12px', padding: '8px 16px', fontSize: '13px' }}>
                            <CheckCheck size={16} /> Mark all read
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {loading ? (
                        <div style={{ padding: '100px 0', textAlign: 'center' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center', borderRadius: '24px' }}>
                            <div style={{ width: '80px', height: '80px', background: 'var(--bg)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--text-muted)' }}>
                                <Inbox size={40} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>Your inbox is empty</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '250px', margin: '0 auto' }}>Check back later for system alerts or status updates on your requests.</p>
                        </div>
                    ) : (
                        notifications.map(n => {
                            const Icon = typeIcons[n.type] || Bell;
                            const color = typeColors[n.type] || 'var(--text-muted)';
                            return (
                                <div 
                                    key={n.id} 
                                    className={`glass-card ${!n.isRead ? 'hover-lift' : ''}`} 
                                    onClick={() => handleNotificationClick(n)}
                                    style={{
                                        position: 'relative',
                                        padding: '20px 24px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        background: n.isRead ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.8)',
                                        opacity: n.isRead ? 0.7 : 1,
                                        border: n.isRead ? '1px solid transparent' : '1px solid var(--border)',
                                        display: 'flex',
                                        gap: '20px',
                                        alignItems: 'start'
                                    }}
                                >
                                    {!n.isRead && (
                                        <div style={{ position: 'absolute', top: '24px', right: '24px', width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--primary)' }} />
                                    )}

                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        background: n.isRead ? 'var(--bg)' : `${color}15`,
                                        display: 'flex',
                                        flexShrink: 0,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: '4px'
                                    }}>
                                        <Icon size={20} color={n.isRead ? 'var(--text-muted)' : color} />
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: n.isRead ? 'var(--text-muted)' : 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                {n.type?.replace('_', ' ') || 'SYSTEM ALERT'}
                                            </span>
                                            <span style={{ width: '3px', height: '3px', background: 'var(--border)', borderRadius: '50%' }} />
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <h3 style={{ fontSize: '16px', fontWeight: n.isRead ? '600' : '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                            {n.title}
                                        </h3>
                                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
                                            {n.message}
                                        </p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    <Calendar size={12} />
                                                    <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                {n.ticketId && (
                                                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>#TKT-{n.ticketId.slice(-4).toUpperCase()}</div>
                                                )}
                                            </div>

                                            {!n.isRead ? (
                                                <button 
                                                    className="btn btn-primary" 
                                                    style={{ height: '32px', padding: '0 12px', borderRadius: '10px', fontSize: '12px' }}
                                                    onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                                                >
                                                    <CheckCircle size={14} /> Mark Read
                                                </button>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                    View details <ChevronRight size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                
                <div style={{ marginTop: '32px', textAlign: 'center', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', justifySelf: 'center', gap: '8px' }}>
                        <Info size={16} /> 
                        Notifications are automatically cleared after 30 days.
                    </p>
                </div>
            </div>
        </div>
    );
}
