import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../api/api';
import { toast } from 'react-toastify';
import { Mail, KeyRound, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import AuthLayout from './AuthLayout';

export default function ForgotPassword() {
    const navigate = useNavigate();

    // Step 1: Request OTP, Step 2: Reset Password
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword({ email });
            toast.success(`OTP sent to ${email}`);
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data || 'Failed to send OTP. Is the email correct?');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await resetPassword({ email, otp, newPassword });
            toast.success('Password reset successfully!');
            navigate('/login/user'); 
        } catch (err) {
            toast.error(err.response?.data || 'Failed to reset password. Invalid OTP?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout 
            title={step === 1 ? 'Reset Password' : 'Create New Password'}
            subtitle={step === 1
                ? 'Enter your email address and we will send you a 6-digit OTP.'
                : `Enter the OTP sent to ${email} and your new password.`}
        >
            {step === 1 && (
                <form onSubmit={handleRequestOtp}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', borderRadius: '10px' }} disabled={loading}>
                        {loading ? 'Sending...' : 'Send OTP'}
                        {!loading && <ArrowRight size={18} style={{ marginLeft: 8 }} />}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleResetPassword}>
                    <div className="form-group">
                        <label className="form-label">OTP Code</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPw ? 'text' : 'password'}
                                className="form-control"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                style={{ paddingRight: 42 }}
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                                }}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirmPw ? 'text' : 'password'}
                                className="form-control"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                style={{ paddingRight: 42 }}
                            />
                            <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                                }}>
                                {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', borderRadius: '10px' }} disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                        {!loading && <ArrowRight size={18} style={{ marginLeft: 8 }} />}
                    </button>
                </form>
            )}

            <div style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-muted)' }}>
                <Link to="/auth-choice" style={{ color: 'var(--auth-blue-primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <ArrowLeft size={16} /> Back to Login
                </Link>
            </div>
        </AuthLayout>
    );
}
