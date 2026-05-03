import { useEffect, useState } from 'react';
import { getTickets, getUsersByRole, assignTechnician, deleteTicket, getAvailableTechnicians } from '../../api/api';
import Topbar from '../../components/Topbar';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/Badges';
import { toast } from 'react-toastify';
import { Search, Trash2, UserCheck, Clock } from 'lucide-react';
import { calculateSlaStatus } from '../../utils/dateUtils';

export default function AdminTickets() {
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [assignModal, setAssignModal] = useState(null);
    const [selectedTech, setSelectedTech] = useState('');

    const load = () => {
        setLoading(true);
        Promise.all([getTickets(), getAvailableTechnicians()])
            .then(([t, tech]) => { setTickets(t.data); setTechnicians(tech.data); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const filtered = tickets
        .filter(t => filterStatus === 'ALL' || t.status === filterStatus)
        .filter(t => t.title?.toLowerCase().includes(search.toLowerCase()) || t.userName?.toLowerCase().includes(search.toLowerCase()));

    const handleAssign = async () => {
        if (!selectedTech) { toast.error('Select a technician'); return; }
        const tech = technicians.find(t => t.id === selectedTech);
        try {
            await assignTechnician(assignModal.id, { technicianId: tech.id, technicianName: tech.name });
            toast.success('Technician assigned');
            setAssignModal(null);
            load();
        } catch { toast.error('Assignment failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this ticket?')) return;
        await deleteTicket(id);
        toast.success('Ticket deleted');
        load();
    };

    return (
        <>
            <Topbar title="All Tickets" subtitle="Manage and assign all service requests" />
            <div className="page-content">
                <div className="search-bar">
                    <div className="search-input-wrapper">
                        <Search size={15} />
                        <input className="search-input" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="form-control" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>

                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        {loading ? <div className="loading-spinner" /> : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr><th>Title</th><th>User</th><th>Category</th><th>Priority</th><th>SLA Deadline</th><th>Status</th><th>Technician</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(t => (
                                            <tr key={t.id}>
                                                <td style={{ fontWeight: 600, maxWidth: 180 }}>{t.title}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{t.userName}</td>
                                                <td><CategoryBadge category={t.category} /></td>
                                                <td><PriorityBadge priority={t.priority} /></td>
                                                <td>
                                                    {(() => {
                                                        const sla = calculateSlaStatus(t.slaDeadline, t.status);
                                                        return (
                                                            <span className={`badge ${sla.color}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                                                                <Clock size={12} /> {sla.text}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td><StatusBadge status={t.status} /></td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{t.technicianName || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button className="btn btn-primary btn-sm" onClick={() => setAssignModal(t)}>
                                                            <UserCheck size={13} /> Assign
                                                        </button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>
                                                            <Trash2 size={13} />
                                                        </button>
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

            {assignModal && (
                <div className="modal-overlay" onClick={() => setAssignModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">Assign Technician</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => setAssignModal(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: 12, color: 'var(--text-secondary)' }}>
                                Assigning for: <strong>{assignModal.title}</strong>
                            </p>
                            <div className="form-group">
                                <label className="form-label">Select Technician</label>
                                <select className="form-control" value={selectedTech} onChange={e => setSelectedTech(e.target.value)}>
                                    <option value="">-- Choose Technician --</option>
                                    {technicians.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} {!t.active && '(Inactive)'}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setAssignModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAssign}>
                                <UserCheck size={15} /> Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
