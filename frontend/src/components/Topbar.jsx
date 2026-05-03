import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { getUnreadCount, getProfilePicUrl } from '../api/api';

export default function Topbar({ title, subtitle }) {
    const { user } = useAuth();
    const [unread, setUnread] = useState(0);

    useEffect(() => {
        if (user?.userId) {
            getUnreadCount(user.userId)
                .then(res => setUnread(res.data.count))
                .catch(() => { });
        }
    }, [user]);

    useEffect(() => {
        const handleNewMessage = () => {
            setUnread(prev => prev + 1);
        };
        window.addEventListener('newMessageReceived', handleNewMessage);
        return () => window.removeEventListener('newMessageReceived', handleNewMessage);
    }, []);

    return (
        <header className="topbar">
            <div className="topbar-left">
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
            </div>

            <div className="topbar-right">
                <div style={{ position: 'relative' }}>
                    <button className="btn btn-secondary btn-icon" style={{ position: 'relative' }}
                        onClick={() => window.location.href = '/notifications'}>
                        <Bell size={18} />
                        {unread > 0 && (
                            <span className="notif-badge" style={{ position: 'absolute', top: -6, right: -6 }}>
                                {unread > 9 ? '9+' : unread}
                            </span>
                        )}
                    </button>
                </div>
                <div className="user-avatar" title={user?.name} style={{
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
                        user?.name?.charAt(0).toUpperCase()
                    )}
                </div>
            </div>
        </header>
    );
}
