import { useEffect, useState } from 'react';
import { getUsersByRole, getTicketsByTechnician, toggleUserActive } from '../../api/api';
import Topbar from '../../components/Topbar';
import { Wrench, User, Shield } from 'lucide-react';
import TechnicianProfileModal from '../../components/TechnicianProfileModal';
import { toast } from 'react-toastify';

export default function AdminTechnicians() {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTech, setSelectedTech] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        getUsersByRole('TECHNICIAN').then(res => setTechnicians(res.data))
            .finally(() => setLoading(false));
    }, []);

    const handleToggleActive = async (tech) => {
        if (!window.confirm(`Are you sure you want to ${tech.active ? 'deactivate' : 'activate'} ${tech.name}'s account?`)) return;
        
        try {
            await toggleUserActive(tech.id || tech._id);
            toast.success(`Account ${tech.active ? 'deactivated' : 'activated'} successfully`);
            setTechnicians(technicians.map(t => {
                const targetId = tech.id || tech._id;
                const currentId = t.id || t._id;
                return (targetId && currentId && targetId === currentId) ? { ...t, active: !t.active } : t;
            }));
            if (selectedTech) {
                const targetId = tech.id || tech._id;
                const selectedId = selectedTech.id || selectedTech._id;
                if (targetId && selectedId && targetId === selectedId) {
                    setSelectedTech({ ...selectedTech, active: !selectedTech.active });
                }
            }
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleViewProfile = (tech) => {
        setSelectedTech(tech);
        setShowModal(true);
    };

    return (
        <>
            <Topbar title="Technician Management" subtitle="View all technician accounts" />
            <div className="page-content">
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">All Technicians ({technicians.length})</span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {loading ? <div className="loading-spinner" /> :
                            technicians.length === 0 ? (
                                <div className="empty-state">
                                    <Wrench size={48} />
                                    <h3>No technicians registered</h3>
                                    <p>Have technicians register with the TECHNICIAN role</p>
                                </div>
                            ) : (
                                <div className="table-wrapper">
                                    <table>
                                        <thead><tr><th>Name</th><th>Ref Number</th><th>Email</th><th>Phone</th><th>Department</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {technicians.map(t => (
                                                <tr key={t.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 13, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                                                {t.name?.charAt(0)}
                                                            </div>
                                                            <span style={{ fontWeight: 600 }}>{t.name}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '13px' }}>
                                                        {t.technicianReference || `TECH-${(t.id || t._id || 'XXXXXXXX').substring(0, 8).toUpperCase()}`}
                                                    </td>
                                                    <td style={{ color: 'var(--text-secondary)' }}>{t.email}</td>
                                                    <td>{t.phone || '—'}</td>
                                                    <td>{t.department || '—'}</td>
                                                    <td>
                                                        <span className={`badge ${t.active ? 'badge-active' : 'badge-inactive'}`}>
                                                            {t.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                                                    </td>
                                                     <td>
                                                         <div style={{ display: 'flex', gap: 8 }}>
                                                            <button 
                                                                className="btn btn-secondary" 
                                                                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '10px' }}
                                                                onClick={() => handleViewProfile(t)}
                                                            >
                                                                <User size={14} style={{ marginRight: 6 }} />
                                                                Profile
                                                            </button>
                                                            <button 
                                                                className={`btn ${t.active ? 'btn-outline-danger' : 'btn-outline-success'}`} 
                                                                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '10px' }}
                                                                onClick={() => handleToggleActive(t)}
                                                            >
                                                                {t.active ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                         </div>
                                                     </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        }
                    </div>
                </div>

                <TechnicianProfileModal 
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    technician={selectedTech}
                    onToggleActive={handleToggleActive}
                />
            </div>
        </>
    );
}
