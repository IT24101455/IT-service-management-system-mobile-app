import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Ticket, Users, FileBarChart, Wrench,
    LogOut, AlertCircle, Calendar, User, Bell, CreditCard,
    Shield, Monitor, Settings
} from 'lucide-react';
import logo from '../assets/logo.png';
import { getProfilePicUrl } from '../api/api';
import Modal from './common/Modal'; // Import new Modal

const navConfig = {
    USER: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/user/dashboard' },
        { label: 'My Profile', icon: User, path: '/profile' },
        { label: 'My Tickets', icon: Ticket, path: '/user/tickets' },
        { label: 'Submit Ticket', icon: Ticket, path: '/user/tickets/new' },
        { label: 'Submit Complaint', icon: AlertCircle, path: '/user/complaints/new' },
        { label: 'Notifications', icon: Bell, path: '/notifications' },
        { label: 'Payments', icon: CreditCard, path: '/payments' },
    ],
    TECHNICIAN: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/technician/dashboard' },
        { label: 'My Profile', icon: User, path: '/profile' },
        { label: 'My Tickets', icon: Ticket, path: '/technician/tickets' },
        { label: 'Schedule & Leaves', icon: Calendar, path: '/technician/schedule' },
        { label: 'Performance', icon: FileBarChart, path: '/technician/performance' },
        { label: 'Subscription', icon: CreditCard, path: '/technician/subscription' },
        { label: 'Notifications', icon: Bell, path: '/notifications' },
    ],
    ADMIN: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { label: 'My Profile', icon: User, path: '/profile' },
        { label: 'All Tickets', icon: Ticket, path: '/admin/tickets' },
        { label: 'Users', icon: Users, path: '/admin/users' },
        { label: 'Technicians', icon: Wrench, path: '/admin/technicians' },
        { label: 'Leave Requests', icon: Calendar, path: '/admin/leaves' },
        { label: 'Assets', icon: Monitor, path: '/admin/assets' },
        { label: 'Complaints', icon: AlertCircle, path: '/admin/complaints' },
        { label: 'Reports', icon: FileBarChart, path: '/reports' },
        { label: 'Payments', icon: CreditCard, path: '/payments' },
        { label: 'Manage Subscriptions', icon: CreditCard, path: '/admin/subscriptions' },
        { label: 'Notifications', icon: Bell, path: '/notifications' },
    ],
};

const roleIcons = { USER: User, TECHNICIAN: Wrench, ADMIN: Shield };

export default function Sidebar() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    if (!user) return null;
    const role = user?.role;
    const links = navConfig[role] || [];
    const RoleIcon = roleIcons[role] || User;

    const handleLogout = () => {
        logoutUser();
        navigate('/auth-choice');
    };

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <img src={logo} alt="TechNova Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                        <div>
                            <h1 style={{ fontSize: '20px', letterSpacing: '0.5px' }}>TechNova</h1>
                        </div>
                    </div>
                    <span style={{ fontSize: '11px', opacity: 0.7 }}>IT Service Management Portal</span>
                </div>

                <div className="sidebar-section" style={{ flex: 1 }}>
                    <div className="sidebar-section-title">Navigation</div>
                    {links.map(({ label, icon: Icon, path }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                        >
                            <Icon size={16} />
                            {label}
                        </NavLink>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div className="user-avatar" style={{ 
                            width: 34, 
                            height: 34, 
                            fontSize: 13,
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
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ color: 'white', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                                <RoleIcon size={10} color="rgba(255,255,255,0.5)" />
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{user?.role}</span>
                            </div>
                        </div>
                    </div>
                    <button className="sidebar-link" onClick={() => setShowLogoutConfirm(true)}
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            <Modal 
                isOpen={showLogoutConfirm} 
                onClose={() => setShowLogoutConfirm(false)}
                title="Sign Out?"
                maxWidth="400px"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>
                            No, Stay
                        </button>
                        <button className="btn btn-primary" onClick={handleLogout}>
                            Yes, Sign Out
                        </button>
                    </>
                }
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <LogOut size={32} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.5 }}>
                        Are you sure you want to log out of TechNova? You will need to sign in again to access your dashboard.
                    </p>
                </div>
            </Modal>
        </>
    );
}
