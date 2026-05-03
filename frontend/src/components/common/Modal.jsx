import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal Component
 * @param {boolean} isOpen - Controls visibility
 * @param {Function} onClose - Close callback
 * @param {string} title - Header title
 * @param {ReactNode} children - Modal content
 * @param {ReactNode} footer - Optional footer actions
 * @param {string} maxWidth - Max width of modal (e.g. '500px')
 */
const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = '560px' }) => {
    // Handle Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden'; // Prevent scroll
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div 
                className="modal" 
                onClick={(e) => e.stopPropagation()} 
                style={{ maxWidth }}
            >
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="btn-icon" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
