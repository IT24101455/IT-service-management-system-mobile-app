export default function StatCard({ label, value, icon: Icon, color = 'blue', trend }) {
    return (
        <div className="stat-card glass-card hover-lift" style={{ border: '1px solid rgba(255,255,255,0.3)' }}>
            <div className={`stat-icon ${color}`} style={{ borderRadius: '14px', width: '48px', height: '48px' }}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div>
                <div className="stat-value" style={{ fontSize: '24px', letterSpacing: '-0.5px' }}>{value ?? '0'}</div>
                <div className="stat-label" style={{ fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '10px', opacity: 0.8 }}>{label}</div>
                {trend !== undefined && (
                    <div style={{ 
                        fontSize: '11px', 
                        fontWeight: '700',
                        color: trend >= 0 ? 'var(--success)' : 'var(--danger)', 
                        marginTop: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span style={{ background: trend >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </span>
                        <span style={{ fontWeight: '500', opacity: 0.7 }}>vs last month</span>
                    </div>
                )}
            </div>
        </div>
    );
}
