import { useState } from 'react';
import { X, CheckCircle, Ticket as TicketIcon, AlertCircle } from 'lucide-react';
import { assignTechnician } from '../api/api';
import { toast } from 'react-toastify';

export default function AssignTicketModal({ isOpen, onClose, technician, pendingTickets, onAssignmentSuccess }) {
    const [selectedTicketId, setSelectedTicketId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAssign = async () => {
        if (!selectedTicketId) {
            toast.error('Please select a ticket');
            return;
        }

        setLoading(true);
        try {
            await assignTechnician(selectedTicketId, {
                technicianId: technician.id,
                technicianName: technician.name
            });
            toast.success('Ticket assigned successfully!');
            onAssignmentSuccess();
            onClose();
        } catch (error) {
            toast.error('Failed to assign ticket');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white', borderRadius: '16px',
                width: '100%', maxWidth: '500px', padding: '24px',
                boxShadow: 'var(--shadow-xl)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>Assign Ticket</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-light)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Assigning to:</p>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)' }}>{technician?.name}</p>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{technician?.specialization || 'General Technician'}</span>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        Select one of your pending tickets:
                    </label>
                    {pendingTickets.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px', border: '1px dashed var(--border)', borderRadius: '12px', backgroundColor: 'var(--bg-light)' }}>
                            <AlertCircle size={32} style={{ color: 'var(--warning)', marginBottom: '12px' }} />
                            <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>No Pending Tickets</p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                You don't have any unassigned tickets. Only tickets with <strong>Pending</strong> status can be assigned to a technician.
                            </p>
                            <button
                                className="btn btn-primary"
                                style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => {
                                    onClose();
                                    window.location.href = `/user/tickets/new?techId=${technician.id}`;
                                }}
                            >
                                Submit New Ticket
                            </button>
                        </div>
                    ) : (
                        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {pendingTickets.map(ticket => (
                                <label key={ticket.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '12px', border: `1px solid ${selectedTicketId === ticket.id ? 'var(--primary)' : 'var(--border)'}`,
                                    borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                                    backgroundColor: selectedTicketId === ticket.id ? 'rgba(59, 130, 246, 0.05)' : 'white'
                                }}>
                                    <input
                                        type="radio"
                                        name="ticket"
                                        value={ticket.id}
                                        checked={selectedTicketId === ticket.id}
                                        onChange={() => setSelectedTicketId(ticket.id)}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{ticket.title}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{ticket.category}</p>
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--warning)', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                        {ticket.priority}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={loading || !selectedTicketId || pendingTickets.length === 0}
                        className="btn btn-primary"
                        style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        {loading ? 'Assigning...' : (
                            <>
                                <CheckCircle size={18} />
                                Confirm Assignment
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
