import React from 'react';

/**
 * Modern Multi-column Dark Footer
 * Inspired by the user-provided design.
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            background: '#0f172a',
            color: '#f8fafc',
            padding: '24px 40px 16px',
            width: '100%',
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-sm)'
        }}>
            {/* Middle Section: Logo and Socials */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '12px'
            }}>
                <h1 style={{ 
                    fontSize: '18px', 
                    fontWeight: 800, 
                    margin: 0,
                    letterSpacing: '-0.3px',
                    color: '#ffffff',
                    fontFamily: "'Orbitron', sans-serif"
                }}>Tech<span style={{ color: '#3b9eff' }}>Nova</span></h1>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                    <SocialIcon color="#3b5998" icon="facebook" />
                    <SocialIcon color="#1da1f2" icon="twitter" />
                    <SocialIcon color="#e1306c" icon="instagram" />
                    <SocialIcon color="#0077b5" icon="linkedin" />
                </div>
            </div>

            {/* Bottom Section: Links Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '16px'
            }}>
                <FooterColumn title="SERVICES" links={['Help Desk', 'Asset Tracking', 'Network Security', 'Cloud Solutions']} />
                <FooterColumn title="RESOURCES" links={['Knowledge Base', 'User Manual', 'System Status', 'API Docs']} />
                <FooterColumn title="SUPPORT" links={['Submit Ticket', 'Live Chat', 'Technical FAQ', 'Contact IT']} />
                <FooterColumn title="LEGAL" links={['Privacy Policy', 'Terms of Service', 'Security Policy', 'SLA']} />
            </div>

            {/* Copyright */}
            <div style={{
                marginTop: '4px',
                textAlign: 'center',
                fontSize: '9px',
                color: 'rgba(255, 255, 255, 0.3)',
                fontWeight: 500
            }}>
                &copy; {currentYear} TechNova ITSM.
            </div>
        </footer>
    );
};

const FooterColumn = ({ title, links }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h4 style={{ 
            fontSize: '10px', 
            fontWeight: 800, 
            color: '#ffffff', 
            letterSpacing: '0.5px',
            margin: 0,
            marginBottom: '2px'
        }}>{title}</h4>
        {links.map(link => (
            <a key={link} href="#" style={{ 
                fontSize: '12px', 
                color: 'rgba(255, 255, 255, 0.5)', 
                textDecoration: 'none',
                transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#ffffff'}
            onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.5)'}
            >
                {link}
            </a>
        ))}
    </div>
);

const SocialIcon = ({ color, icon }) => {
    // Basic SVG icons for social media
    const icons = {
        facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>,
        twitter: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>,
        instagram: <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>,
        linkedin: <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"></path>
    };

    return (
        <a href="#" style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
            color: 'white'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <svg 
                viewBox="0 0 24 24" 
                width="14" 
                height="14" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            >
                {icons[icon]}
                {icon === 'instagram' && <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>}
                {icon === 'instagram' && <circle cx="12" cy="12" r="5"></circle>}
                {icon === 'linkedin' && <circle cx="4" cy="4" r="2"></circle>}
            </svg>
        </a>
    );
};

export default Footer;
