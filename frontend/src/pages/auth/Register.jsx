import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { register, sendOtp, uploadMedia } from '../../api/api';
import { toast } from 'react-toastify';
import { UserPlus, User, Wrench, ShieldCheck, RefreshCw, ArrowLeft, CheckCircle2, Shield, Info, AlertCircle } from 'lucide-react';
import AuthLayout from './AuthLayout';
import Modal from '../../components/common/Modal';

export default function Register() {
    const { role: urlRole } = useParams();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(urlRole || null);
    const [step, setStep] = useState(1); // 1: Info, 2: OTP
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(300); // 5 minutes
    const [canResend, setCanResend] = useState(false);
    
    // Terms & Conditions state
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        phone: '',
        province: '', district: '',
        specialization: '',
        nicFrontUrl: '', nicBackUrl: ''
    });

    const locationData = {
        "Western": ["Colombo", "Gampaha", "Kalutara"],
        "Central": ["Kandy", "Matale", "Nuwara Eliya"],
        "Southern": ["Galle", "Matara", "Hambantota"],
        "Northern": ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
        "Eastern": ["Trincomalee", "Batticaloa", "Ampara"],
        "North Western": ["Kurunegala", "Puttalam"],
        "North Central": ["Anuradhapura", "Polonnaruwa"],
        "Uva": ["Badulla", "Monaragala"],
        "Sabaragamuwa": ["Ratnapura", "Kegalle"]
    };
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;
        if (!regex.test(password)) {
            return "Password must be at least 8 characters with uppercase, number, and special character.";
        }
        return "";
    };

    const validatePhone = (phone) => {
        if (!phone) return true;
        const regex = /^(?:0|\+94|94)7[0-9]{8}$/;
        return regex.test(phone.replace(/\s/g, ''));
    };

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        setError('');
        
        const errorMsg = validatePassword(form.password);
        if (errorMsg) {
            setPasswordError(errorMsg);
            return;
        }
        setPasswordError('');

        if (form.phone && !validatePhone(form.phone)) {
            setError('Invalid Sri Lankan phone number. Use 07XXXXXXXX format.');
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!form.province || !form.district) {
            setError('Province and District are required');
            return;
        }

        // --- Terms & Conditions Interception ---
        if (selectedRole === 'TECHNICIAN' && !termsAccepted) {
            setShowTermsModal(true);
            return;
        }

        if (selectedRole === 'TECHNICIAN' && (!form.nicFrontUrl || !form.nicBackUrl)) {
            setError('NIC front and back photos are required for technicians');
            return;
        }

        setLoading(true);
        try {
            await sendOtp({ email: form.email });
            toast.success('OTP sent to your email');
            setStep(2);
            setShowTermsModal(false); // Ensure modal closes if open
            setTimer(300);
            setCanResend(false);
        } catch (err) {
            setError(err.response?.data || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');
        try {
            await sendOtp({ email: form.email });
            toast.success('OTP resent successfully');
            setTimer(300);
            setCanResend(false);
        } catch (err) {
            setError(err.response?.data || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (!otp) {
            setError('Please enter the OTP');
            return;
        }

        setLoading(true);
        try {
            await register({
                ...form,
                role: selectedRole,
                otp: otp
            });
            toast.success('Account created successfully!');
            navigate(`/login/${selectedRole}`);
        } catch (err) {
            setError(err.response?.data || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (!selectedRole) return (
        <AuthLayout 
            title="Create Account" 
            subtitle="Are you registering as a User or a Technician?"
        >
            <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
                <button 
                    onClick={() => setSelectedRole('USER')}
                    className="btn btn-social"
                    style={{ height: 'auto', padding: '20px', flexDirection: 'column', textAlign: 'center', borderColor: 'var(--auth-border)' }}
                >
                    <div className="stat-icon blue" style={{ marginBottom: 12 }}>
                        <User size={24} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--auth-blue-deep)', marginBottom: 4 }}>Register as User</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Request support and manage tickets</p>
                </button>

                <button 
                    onClick={() => setSelectedRole('TECHNICIAN')}
                    className="btn btn-social"
                    style={{ height: 'auto', padding: '20px', flexDirection: 'column', textAlign: 'center', borderColor: 'var(--auth-border)' }}
                >
                    <div className="stat-icon purple" style={{ marginBottom: 12 }}>
                        <Wrench size={24} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--auth-blue-deep)', marginBottom: 4 }}>Register as Technician</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Help others by resolving tickets</p>
                </button>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--auth-blue-primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
            </div>
        </AuthLayout>
    );

    if (step === 2) return (
        <AuthLayout 
            title="Verify Email" 
            subtitle={`We've sent a 6-digit OTP to ${form.email}`}
        >
            {error && (
                <div style={{ 
                    background: '#fef2f2', 
                    color: '#dc2626', 
                    padding: '12px 16px', 
                    borderRadius: '10px', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    marginBottom: '20px',
                    border: '1px solid #fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626' }} />
                    {error}
                </div>
            )}
            <form onSubmit={handleFinalRegister}>
                <div className="form-group">
                    <label className="form-label">Enter OTP Code</label>
                    <input
                        className="form-control"
                        placeholder="000000"
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, height: 64, borderRadius: 12 }}
                        autoFocus
                    />
                </div>

                <div style={{ marginBottom: 24, textAlign: 'center', fontSize: 14 }}>
                    {timer > 0 ? (
                        <span style={{ color: 'var(--text-muted)' }}>Expires in <b style={{ color: 'var(--auth-blue-primary)' }}>{formatTime(timer)}</b></span>
                    ) : (
                        <span style={{ color: 'var(--danger)' }}>OTP expired.</span>
                    )}
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', borderRadius: 10 }} disabled={loading || timer === 0}>
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>

                <button
                    type="button"
                    className="btn btn-social"
                    style={{ width: '100%', marginTop: 12, border: 'none' }}
                    onClick={handleResendOtp}
                    disabled={loading || !canResend}
                >
                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
                    Resend Code
                </button>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Edit registration details
                    </button>
                </div>
            </form>
        </AuthLayout>
    );

    // Main Registration Form
    return (
        <AuthLayout 
            title="Create Account" 
            subtitle={`Join TechNova as a ${selectedRole.toLowerCase()}`}
        >
            <button 
                onClick={() => setSelectedRole(null)}
                style={{ 
                    display: 'flex', alignItems: 'center', gap: 6, 
                    marginBottom: 24, background: 'none', border: 'none', 
                    color: 'var(--auth-blue-primary)', cursor: 'pointer', fontSize: 14, fontWeight: 600 
                }}
            >
                <ArrowLeft size={16} /> Back to role selection
            </button>

            <form onSubmit={handleSendOtp}>
                {error && (
                    <div style={{ 
                        background: '#fef2f2', 
                        color: '#dc2626', 
                        padding: '12px 16px', 
                        borderRadius: '10px', 
                        fontSize: '14px', 
                        fontWeight: '600',
                        marginBottom: '20px',
                        border: '1px solid #fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626' }} />
                        {error}
                    </div>
                )}
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-control" placeholder="John Doe" value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input className="form-control" placeholder="07XXXXXXXX" value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })} required />
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Format: 07XXXXXXXX</span>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" placeholder="you@company.com" value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Province</label>
                        <select
                            className="form-control"
                            value={form.province}
                            onChange={e => setForm({ ...form, province: e.target.value, district: '' })}
                            required
                        >
                            <option value="">Select Province</option>
                            {Object.keys(locationData).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">District</label>
                        <select
                            className="form-control"
                            value={form.district}
                            onChange={e => setForm({ ...form, district: e.target.value })}
                            required
                            disabled={!form.province}
                        >
                            <option value="">Select District</option>
                            {form.province && locationData[form.province].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-control" placeholder="Min 8 chars" value={form.password}
                            onChange={e => {
                                setForm({ ...form, password: e.target.value });
                                setPasswordError(validatePassword(e.target.value));
                            }} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input type="password" className="form-control" placeholder="Repeat password" value={form.confirmPassword}
                            onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
                    </div>
                </div>

                {passwordError && (
                    <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: -12, marginBottom: 12 }}>
                        {passwordError}
                    </div>
                )}
                {!passwordError && form.password && (
                    <div style={{ color: 'var(--success)', fontSize: 12, marginTop: -12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={14} /> Strong password
                    </div>
                )}

                {selectedRole === 'TECHNICIAN' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Specialization / Category</label>
                            <select
                                className="form-control"
                                value={form.specialization}
                                onChange={e => setForm({ ...form, specialization: e.target.value })}
                                required
                            >
                                <option value="">Select Specialization</option>
                                <option value="SOFTWARE">Software Technician</option>
                                <option value="HARDWARE">Hardware Technician</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">NIC Front Photo *</label>
                                <div style={{ 
                                    border: '2px dashed var(--auth-border)', 
                                    borderRadius: '12px', 
                                    padding: '16px', 
                                    textAlign: 'center',
                                    background: form.nicFrontUrl ? 'var(--success-50)' : 'transparent',
                                    cursor: 'pointer'
                                }} onClick={() => document.getElementById('nicFront').click()}>
                                    {form.nicFrontUrl ? (
                                        <div style={{ color: 'var(--success)', fontSize: '12px', fontWeight: '600' }}>
                                            <CheckCircle2 size={16} style={{ marginBottom: 4 }} />
                                            Front Uploaded
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                            <Shield size={16} style={{ marginBottom: 4 }} />
                                            Upload Front
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        id="nicFront" 
                                        hidden 
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                                const res = await uploadMedia(formData, 'nic');
                                                setForm({ ...form, nicFrontUrl: res.data.url });
                                                toast.success('NIC Front uploaded');
                                            } catch (err) { 
                                                const errMsg = err.response?.data?.error || err.response?.data || 'Upload failed';
                                                toast.error(errMsg); 
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">NIC Back Photo *</label>
                                <div style={{ 
                                    border: '2px dashed var(--auth-border)', 
                                    borderRadius: '12px', 
                                    padding: '16px', 
                                    textAlign: 'center',
                                    background: form.nicBackUrl ? 'var(--success-50)' : 'transparent',
                                    cursor: 'pointer'
                                }} onClick={() => document.getElementById('nicBack').click()}>
                                    {form.nicBackUrl ? (
                                        <div style={{ color: 'var(--success)', fontSize: '12px', fontWeight: '600' }}>
                                            <CheckCircle2 size={16} style={{ marginBottom: 4 }} />
                                            Back Uploaded
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                            <Shield size={16} style={{ marginBottom: 4 }} />
                                            Upload Back
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        id="nicBack" 
                                        hidden 
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                                const res = await uploadMedia(formData, 'nic');
                                                setForm({ ...form, nicBackUrl: res.data.url });
                                                toast.success('NIC Back uploaded');
                                            } catch (err) { 
                                                const errMsg = err.response?.data?.error || err.response?.data || 'Upload failed';
                                                toast.error(errMsg); 
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8, borderRadius: 10 }} disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Continue to Verification'}
                    {!loading && <UserPlus size={18} style={{ marginLeft: 8 }} />}
                </button>
            </form>

            {/* Terms & Conditions Modal */}
            <Modal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                title="Technician Terms & Conditions"
                maxWidth="600px"
                footer={
                    <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowTermsModal(false)}>Cancel</button>
                        <button 
                            className="btn btn-primary" 
                            style={{ flex: 1.5 }} 
                            onClick={() => handleSendOtp()}
                            disabled={!termsAccepted}
                        >
                            Accept & Continue
                        </button>
                    </div>
                }
            >
                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '16px', background: 'var(--primary-50)', borderRadius: '16px', color: 'var(--primary-dark)' }}>
                        <Info size={24} />
                        <div style={{ fontSize: '13px', fontWeight: '600', lineHeight: 1.4 }}>
                            Please review our professional terms for technicians before completing your registration.
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <section>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-primary)' }}>
                                <Shield size={18} style={{ color: 'var(--primary)' }} />
                                1. Subscription & Payments
                            </h4>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Technicians are required to pay a monthly subscription fee of <b>LKR 1,500</b>. This payment must be made to the Operations Manager account on or before the monthly due date.
                            </p>
                        </section>

                        <section>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-primary)' }}>
                                <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
                                2. Account Compliance
                            </h4>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Failure to complete the subscription payment by the due date will result in <b>automatic account deactivation</b>. Inactive accounts cannot accept jobs or access platform features.
                            </p>
                        </section>

                        <section>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-primary)' }}>
                                <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
                                3. Ethical Conduct
                            </h4>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Proper use of platform services is mandatory. Any misuse of customer data, fraudulent activity, or harassment will lead to a <b>permanent ban</b> from the TechNova ecosystem.
                            </p>
                        </section>

                        <section>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-primary)' }}>
                                <User size={18} style={{ color: 'var(--info)' }} />
                                4. Data Privacy
                            </h4>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Your technician profile, qualifications, and payment records will be stored securely. This data is used solely for platform administration and verifying service quality.
                            </p>
                        </section>
                    </div>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            checked={termsAccepted}
                            onChange={e => setTermsAccepted(e.target.checked)}
                        />
                        <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            I agree to the Terms and Conditions
                        </span>
                    </label>
                </div>
            </Modal>

            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--auth-blue-primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
            </div>
        </AuthLayout>
    );
}
