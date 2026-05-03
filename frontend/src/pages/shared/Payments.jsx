// Import React hooks for lifecycle management and state storage
import { useEffect, useState } from 'react';
// Import custom authentication context hook to access the logged-in user
import { useAuth } from '../../context/AuthContext';
// Import API functions for fetching and updating payment records
import { getPayments, getPaymentsByUser, createPayment, markPaid } from '../../api/api';
// Import Topbar component for the page header UI
import Topbar from '../../components/Topbar';
// Import icons from the lucide-react library for visual elements
import { CreditCard, Plus, CheckCircle, Wallet, Clock, Receipt, Filter, Search, Download, ExternalLink, ChevronRight, AlertCircle } from 'lucide-react';
// Import toast function from React Toastify for displaying alert notifications
import { toast } from 'react-toastify';

// Define the standard Payments functional component and export as default
export default function Payments() {
    // Destructure the user object from the authentication context
    const { user } = useAuth();
    // Initialize the payments state as an empty array to store invoices
    const [payments, setPayments] = useState([]);
    // Initialize loading state to true to trigger the loading spinner initially
    const [loading, setLoading] = useState(true);
    // Initialize payModal state to track which payment is currently being flagged as paid
    const [payModal, setPayModal] = useState(null);
    // Initialize payMethod state to default to 'CASH' for the payment form
    const [payMethod, setPayMethod] = useState('CASH');

    // Define the load function to fetch payment records
    const load = () => {
        // Set loading to true before the API request
        setLoading(true);
        // Determine the correct API call based on whether the user is an ADMIN or standard user
        const fn = user.role === 'ADMIN' ? getPayments() : getPaymentsByUser(user.userId);
        // Execute the API call, update state on success, and turn off loading flag on completion
        fn.then(res => setPayments(res.data)).finally(() => setLoading(false));
    };

    // Use the useEffect hook to load payments when the component mounts or user changes
    useEffect(() => { load(); }, [user]);

    // Define async function to handle the confirmation of a payment
    const handlePay = async () => {
        try {
            // Call the API to mark the specific payment ID as paid via the selected method
            await markPaid(payModal.id, { paymentMethod: payMethod });
            // Display a success toast alert
            toast.success('Payment marked as paid');
            // Close the payment modal
            setPayModal(null);
            // Reload the payment data to reflect changes
            load();
        } catch { 
            // Display an error toast alert if the API call fails
            toast.error('Payment update failed'); 
        }
    };

    // Calculate the total amount of all payments that have status PAiD
    const totalPaid = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
    // Calculate the total amount of all payments that have status PENDING
    const totalPending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);

    // Return the JSX representing the UI for the Payments component
    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Topbar title="Billing & Finance" subtitle="Manage invoices and track payment history" />
            
            <div className="page-content" style={{ maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
                
                {/* Visual Stats Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                    <div className="glass-card hover-lift" style={{ padding: '32px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, color: 'var(--success)' }}>
                            <Wallet size={120} />
                        </div>
                        <div style={{ width: '64px', height: '64px', background: 'var(--success-50)', color: 'var(--success)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Revenue Received</div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary)' }}>
                                <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-muted)', marginRight: '4px' }}>LKR</span>
                                {totalPaid.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div className="glass-card hover-lift" style={{ padding: '32px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', overflow: 'hidden' }}>
                         <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, color: 'var(--warning)' }}>
                            <Clock size={120} />
                        </div>
                        <div style={{ width: '64px', height: '64px', background: 'var(--warning-50)', color: 'var(--warning)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Receipt size={32} />
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Outstanding Balance</div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary)' }}>
                                <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-muted)', marginRight: '4px' }}>LKR</span>
                                {totalPending.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Control Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)' }}>Transaction History</h2>
                        <span style={{ padding: '4px 12px', background: 'var(--bg-dark)', borderRadius: '10px', fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                            {payments.length} Records
                        </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div className="glass-card" style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                            <Search size={16} style={{ color: 'var(--text-muted)' }} />
                            <input style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', width: '200px' }} placeholder="Search invoices..." />
                        </div>
                        <button className="btn btn-secondary" style={{ borderRadius: '12px', height: '44px' }}>
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                {/* Main Data Container */}
                <div className="glass-card" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '100px 0', textAlign: 'center' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                        </div>
                    ) : payments.length === 0 ? (
                        <div style={{ padding: '100px 40px', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', background: 'var(--bg)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--text-muted)' }}>
                                <CreditCard size={40} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>No financial activity</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto' }}>Invoices will appear here once service tickets are resolved and billed.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper" style={{ margin: 0, borderRadius: 0 }}>
                            <table style={{ borderCollapse: 'separate', borderSpacing: '0 8px', margin: '0 20px', width: 'calc(100% - 40px)' }}>
                                <thead>
                                    <tr>
                                        <th style={{ background: 'transparent', color: 'var(--text-muted)', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', padding: '20px 16px' }}>Invoice ID</th>
                                        <th style={{ background: 'transparent', color: 'var(--text-muted)', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', padding: '20px 16px' }}>Client / User</th>
                                        <th style={{ background: 'transparent', color: 'var(--text-muted)', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', padding: '20px 16px' }}>Description</th>
                                        <th style={{ background: 'transparent', color: 'var(--text-muted)', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', padding: '20px 16px' }}>Amount</th>
                                        <th style={{ background: 'transparent', color: 'var(--text-muted)', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', padding: '20px 16px' }}>Status</th>
                                        <th style={{ background: 'transparent', color: 'var(--text-muted)', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', padding: '20px 16px' }}>Date</th>
                                        {user.role === 'ADMIN' && <th style={{ background: 'transparent', color: 'var(--text-muted)', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', padding: '20px 16px', textAlign: 'right' }}>Management</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map(p => (
                                        <tr key={p.id} className="hover-lift" style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <td style={{ padding: '16px', background: 'var(--card-bg)', borderRadius: '16px 0 0 16px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderLeft: '1px solid var(--border-light)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', background: 'var(--primary-50)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Receipt size={16} />
                                                    </div>
                                                    <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '13px' }}>{p.invoiceNumber}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '24px', height: '24px', background: 'var(--border)', borderRadius: '50%', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'var(--text-secondary)' }}>
                                                        {p.userName?.charAt(0)}
                                                    </div>
                                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{p.userName}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', maxWidth: '200px' }}>
                                                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.ticketTitle || 'Service Fee'}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ITSM Resolution Activity</div>
                                            </td>
                                            <td style={{ padding: '16px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                                                <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{Number(p.amount).toLocaleString()}</div>
                                                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>LKR</div>
                                            </td>
                                            <td style={{ padding: '16px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                                                <div style={{ 
                                                    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '800',
                                                    background: p.status === 'PAID' ? 'var(--success-50)' : 'var(--warning-50)',
                                                    color: p.status === 'PAID' ? 'var(--success)' : 'var(--warning)'
                                                }}>
                                                    <div style={{ width: '6px', height: '6px', background: 'currentColor', borderRadius: '50%' }} />
                                                    {p.status}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            {user.role === 'ADMIN' && (
                                                <td style={{ padding: '16px', background: 'var(--card-bg)', textAlign: 'right', borderRadius: '0 16px 16px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }}>
                                                    {p.status === 'PENDING' ? (
                                                        <button 
                                                            className="btn btn-primary btn-sm" 
                                                            style={{ borderRadius: '10px', height: '36px', padding: '0 16px', boxShadow: '0 4px 8px rgba(26, 111, 196, 0.1)' }}
                                                            onClick={(e) => { e.stopPropagation(); setPayModal(p); }}
                                                        >
                                                            Collect Payment
                                                        </button>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', color: 'var(--success)', fontWeight: '700', fontSize: '12px' }}>
                                                            <CheckCircle size={14} /> Verified
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
                <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', background: 'var(--primary-50)', borderRadius: '20px', color: 'var(--primary-dark)' }}>
                    <AlertCircle size={24} />
                    <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                        <strong>Need a formal invoice?</strong> Click on any transaction row to generate a high-resolution PDF receipt for your internal accounting or reimbursement process.
                    </div>
                </div>
            </div>

            {/* Payment Modal Overhaul */}
            {payModal && (
                <div className="modal-overlay" onClick={() => setPayModal(null)} style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.4)' }}>
                    <div className="glass-card modal-card" onClick={e => e.stopPropagation()} style={{ padding: '40px', borderRadius: '32px', border: 'none', maxWidth: '480px', animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ width: '72px', height: '72px', background: 'var(--success-50)', color: 'var(--success)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 12px 24px rgba(34, 197, 94, 0.15)' }}>
                                <CreditCard size={36} />
                            </div>
                            <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px' }}>Record Payment</h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Confirming settlement for Invoice <strong>#{payModal.invoiceNumber}</strong></p>
                        </div>

                        <div style={{ background: 'var(--bg)', borderRadius: '20px', padding: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>Settlement Amount</span>
                            <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)' }}>LKR {Number(payModal.amount).toLocaleString()}</span>
                        </div>

                        <div className="form-group" style={{ marginBottom: '40px' }}>
                            <label className="form-label" style={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>Payment Channel</label>
                            <div style={{ position: 'relative' }}>
                                <Wallet size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <select 
                                    className="form-control" 
                                    style={{ height: '56px', paddingLeft: '48px', borderRadius: '16px', fontSize: '15px', border: '2px solid var(--border)' }}
                                    value={payMethod} 
                                    onChange={e => setPayMethod(e.target.value)}
                                >
                                    <option value="CASH">Physical Cash</option>
                                    <option value="CARD">Credit / Debit Card</option>
                                    <option value="BANK_TRANSFER">Digital Bank Transfer</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button className="btn btn-secondary btn-lg" style={{ flex: 1, height: '56px', borderRadius: '16px' }} onClick={() => setPayModal(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary btn-lg" style={{ flex: 1, height: '56px', borderRadius: '16px', background: 'var(--success)', borderColor: 'var(--success)', boxShadow: '0 8px 16px rgba(34, 197, 94, 0.2)' }} onClick={handlePay}>
                                <CheckCircle size={18} /> Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
