import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTechnicianLeaves, createLeave, deleteLeave, uploadMedicalReport } from '../../api/api';
import Topbar from '../../components/Topbar';
import { Calendar, PlusCircle, Trash2, Clock, CheckCircle, Upload, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

export default function TechnicianSchedule() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ type: 'VACATION', startDate: '', endDate: '', reason: '' });
    const [medicalFile, setMedicalFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const res = await getTechnicianLeaves(user.userId);
            setLeaves(res.data);
        } catch (err) {
            toast.error('Failed to load leaves');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (new Date(form.startDate) > new Date(form.endDate)) {
            toast.error('End date cannot be before start date');
            return;
        }

        if (form.type === 'SICK' && !medicalFile) {
            toast.error('Please upload a medical report for sick leave');
            return;
        }

        setSubmitting(true);
        try {
            let medicalReportUrl = null;
            if (form.type === 'SICK' && medicalFile) {
                const formData = new FormData();
                formData.append('file', medicalFile);
                const res = await uploadMedicalReport(formData);
                medicalReportUrl = res.data.url;
            }

            await createLeave({
                technicianId: user.userId,
                technicianName: user.name,
                ...form,
                medicalReport: medicalReportUrl
            });
            toast.success('Leave requested successfully');
            setShowModal(false);
            setForm({ type: 'VACATION', startDate: '', endDate: '', reason: '' });
            setMedicalFile(null);
            fetchLeaves();
        } catch (err) {
            toast.error('Failed to submit leave');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this leave?')) return;
        try {
            await deleteLeave(id);
            toast.success('Leave cancelled');
            fetchLeaves();
        } catch (err) {
            toast.error('Failed to cancel leave');
        }
    };

    const isUpcoming = (endDate) => new Date(endDate) >= new Date(new Date().setHours(0, 0, 0, 0));

    return (
        <>
            <Topbar title="Schedule & Leaves" subtitle="Manage your availability and time off" />
            <div className="page-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, color: 'var(--text)' }}>Upcoming Time Off</h3>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <PlusCircle size={16} /> Request Leave
                    </button>
                </div>

                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        {loading ? <div className="loading-spinner" /> :
                            leaves.length === 0 ? (
                                <div className="empty-state">
                                    <Calendar size={48} />
                                    <h3>No Leaves Scheduled</h3>
                                    <p>You have no upcoming time off.</p>
                                </div>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Duration</th>
                                            <th>Reason</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaves.map(l => (
                                            <tr key={l.id} style={{ opacity: isUpcoming(l.endDate) ? 1 : 0.6 }}>
                                                <td>
                                                    <span className={`badge ${l.type === 'SICK' ? 'bg-danger' : 'bg-info'}`}>
                                                        {l.type}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 500 }}>
                                                    {l.startDate} &rarr; {l.endDate}
                                                </td>
                                                <td style={{ color: 'var(--text-muted)' }}>{l.reason || '—'}</td>
                                                <td>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                                        color: l.status === 'APPROVED' ? '#10b981' : '#f59e0b',
                                                        fontSize: 13, fontWeight: 600
                                                    }}>
                                                        {l.status === 'APPROVED' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                        {l.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {isUpcoming(l.endDate) && (
                                                        <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(l.id)}>
                                                            <Trash2 size={14} color="#ef4444" />
                                                        </button>
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

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()} style={{ width: 450 }}>
                        <h3 className="modal-title">Request Time Off</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Leave Type</label>
                                <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="VACATION">Vacation / Annual Leave</option>
                                    <option value="SICK">Sick Leave</option>
                                    <option value="PERSONAL">Personal Reason</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: 15 }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Start Date</label>
                                    <input type="date" className="form-control" required min={new Date().toISOString().split('T')[0]}
                                        value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">End Date</label>
                                    <input type="date" className="form-control" required min={form.startDate || new Date().toISOString().split('T')[0]}
                                        value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Reason (Optional)</label>
                                <textarea className="form-control" rows={3} placeholder="Briefly describe the reason..."
                                    value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
                            </div>

                            {form.type === 'SICK' && (
                                <div className="form-group" style={{ padding: '16px', background: 'var(--primary-50)', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
                                    <label className="form-label" style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                                        Medical Report (Required for Sick Leave)
                                    </label>
                                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <button type="button" className="btn btn-secondary btn-sm" 
                                            onClick={() => document.getElementById('medical-file').click()}
                                            style={{ background: 'white' }}>
                                            <Upload size={14} /> {medicalFile ? 'Change File' : 'Upload Picture'}
                                        </button>
                                        <input id="medical-file" type="file" accept="image/*" hidden 
                                            onChange={e => setMedicalFile(e.target.files[0])} />
                                        {medicalFile && (
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FileText size={14} /> {medicalFile.name.substring(0, 20)}...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
