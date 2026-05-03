import { useNavigate } from 'react-router-dom';
import { User, Wrench, ShieldCheck, Activity } from 'lucide-react';
import AuthLayout from './AuthLayout';

export default function AuthChoice() {
    const navigate = useNavigate();

    return (
        <AuthLayout 
            title="Welcome to TechNova" 
            subtitle="Please select your login type to continue to your dashboard."
        >
            <div className="auth-choice-grid">
                <button
                    onClick={() => navigate('/login/USER')}
                    className="auth-choice-card group"
                >
                    <div className="card-icon-wrapper blue">
                        <User size={26} />
                    </div>
                    <div className="card-content">
                        <h3>Login as User</h3>
                        <p>Access your personal support dashboard</p>
                    </div>
                    <div className="card-arrow">
                        <Activity size={16} />
                    </div>
                </button>

                <button
                    onClick={() => navigate('/login/TECHNICIAN')}
                    className="auth-choice-card group"
                >
                    <div className="card-icon-wrapper purple">
                        <Wrench size={26} />
                    </div>
                    <div className="card-content">
                        <h3>Login as Technician</h3>
                        <p>Manage tickets and resolve technical issues</p>
                    </div>
                    <div className="card-arrow">
                        <Activity size={16} />
                    </div>
                </button>
            </div>


            <div style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <button 
                    onClick={() => navigate('/register')}
                    style={{ background: 'none', border: 'none', color: 'var(--auth-blue-primary)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
                >
                    Create Account
                </button>
            </div>
        </AuthLayout>
    );
}
