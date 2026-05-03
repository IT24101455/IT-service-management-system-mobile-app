import { useEffect, useState } from 'react';
import { getAllLeaves, updateLeaveStatus } from '../../api/api';
import Topbar from '../../components/Topbar';
import { CheckCircle, XCircle, Clock, Search, FileText, Image } from 'lucide-react';
import { getProfilePicUrl } from '../../api/api'; // Reusing this for base URL logic if needed, or just manual
import { toast } from 'react-toastify';

export default function AdminLeaves() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const res = await getAllLeaves();
            setLeaves(res.data);
        } catch (err) {
            toast.error('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateLeaveStatus(id, status);
            toast.success(`Leave request ${status.toLowerCase()}`);
            fetchLeaves(); // Refresh list to get updated data
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const filteredLeaves = leaves.filter(l => filter === 'ALL' || l.status === filter);

    return (
        <>
            <Topbar title="Leave Requests" subtitle="Manage and approve technician time off" />
            <div className="page-content">

                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <button className={`btn ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('ALL')}>
                        All Requests
                    </button>
                    <button className={`btn ${filter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('PENDING')}>
                        Pending
                    </button>
                    <button className={`btn ${filter === 'APPROVED' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('APPROVED')}>
                        Approved
                    </button>
                    <button className={`btn ${filter === 'REJECTED' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('REJECTED')}>
                        Rejected
                    </button>
                </div>

                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        {loading ? <div className="loading-spinner" /> :
                            filteredLeaves.length === 0 ? (
                                <div className="empty-state">
                                    <h3>No Leave Requests Found</h3>
                                    <p>There are no leave requests matching the current filter.</p>
                                </div>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Technician</th>
                                            <th>Type</th>
                                            <th>Dates</th>
                                            <th>Reason</th>
                                            <th>Report</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLeaves.map(l => (
                                            <tr key={l.id}>
                                                <td style={{ fontWeight: 600 }}>{l.technicianName}</td>
                                                <td>
                                                    <span className={`badge ${l.type === 'SICK' ? 'bg-danger' : l.type === 'PERSONAL' ? 'bg-warning' : 'bg-info'}`}>
                                                        {l.type}
                                                    </span>
                                                </td>
                                                <td>{l.startDate} &rarr; {l.endDate}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{l.reason || '—'}</td>
                                                <td>
                                                    {l.medicalReport ? (
                                                        <a 
                                                            href={l.medicalReport?.startsWith('http') ? l.medicalReport : `http://localhost:8081${l.medicalReport}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                                                        >
                                                            <Image size={16} /> View
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {l.status === 'PENDING' && <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, fontSize: 13 }}><Clock size={14} /> Pending</span>}
                                                    {l.status === 'APPROVED' && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, fontSize: 13 }}><CheckCircle size={14} /> Approved</span>}
                                                    {l.status === 'REJECTED' && <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, fontSize: 13 }}><XCircle size={14} /> Rejected</span>}
                                                </td>
                                                <td>
                                                    {l.status === 'PENDING' ? (
                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                            <button className="btn btn-sm" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
                                                                onClick={() => handleUpdateStatus(l.id, 'APPROVED')}>Approve</button>
                                                            <button className="btn btn-sm" style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
                                                                onClick={() => handleUpdateStatus(l.id, 'REJECTED')}>Reject</button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Processed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                    </div>
                </div>
            </div>
        </>
    );
}
