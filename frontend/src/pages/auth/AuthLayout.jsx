import React from 'react';
import { Link } from 'react-router-dom';
import AuthVisual from './AuthVisual';
import logo from '../../assets/logo.png';
import Footer from '../../components/Footer';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--auth-white)' }}>
            <div className="auth-split-container" style={{ flex: 1, minHeight: 'auto' }}>
                {/* Left Side: Forms */}
                <div className="auth-form-side">
                    <Link to="/" className="auth-logo-top">
                        <img src={logo} alt="TechNova" style={{ width: 34, height: 34, objectFit: 'contain' }} />
                        <span className="auth-logo-text">Tech<span className="brand-accent">Nova</span></span>
                    </Link>

                    <div className="auth-form-container">
                        <div className="auth-header">
                            <h1>{title}</h1>
                            <p>{subtitle}</p>
                        </div>

                        {children}
                    </div>
                </div>

                {/* Right Side: Decorative Visual */}
                <AuthVisual />
            </div>
            
            <div style={{ width: '100%' }}>
                <Footer />
            </div>
        </div>
    );
};

export default AuthLayout;
