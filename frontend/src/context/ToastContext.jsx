import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, [removeToast]);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={18} />;
            case 'error': return <AlertCircle size={18} />;
            case 'warning': return <AlertTriangle size={18} />;
            default: return <Info size={18} />;
        }
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container" style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 10000,
                pointerEvents: 'none'
            }}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast toast-${toast.type}`}
                        style={{
                            pointerEvents: 'auto',
                            minWidth: '300px',
                            background: 'white',
                            color: 'var(--text-primary)',
                            padding: '16px',
                            borderRadius: 'var(--radius)',
                            boxShadow: 'var(--shadow-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            borderLeft: `4px solid var(--${toast.type === 'info' ? 'primary' : toast.type})`,
                            animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        <div style={{ color: `var(--${toast.type === 'info' ? 'primary' : toast.type})` }}>
                            {getIcon(toast.type)}
                        </div>
                        <div style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>
                            {toast.message}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                padding: '4px'
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .toast-success { border-left-color: var(--success) !important; }
                .toast-error { border-left-color: var(--danger) !important; }
                .toast-warning { border-left-color: var(--warning) !important; }
                .toast-info { border-left-color: var(--primary) !important; }
            `}</style>
        </ToastContext.Provider>
    );
};
