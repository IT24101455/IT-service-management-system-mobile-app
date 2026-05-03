import React from 'react';

/**
 * Reusable Loading Spinner Component
 * @param {string} size - 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} fullPage - If true, renders as a full-page overlay
 * @param {string} color - CSS color for the spinner
 */
const LoadingSpinner = ({ size = 'md', fullPage = false, color = 'var(--primary)' }) => {
  const sizes = {
    sm: { width: '20px', height: '20px', borderWidth: '2px' },
    md: { width: '40px', height: '40px', borderWidth: '3px' },
    lg: { width: '64px', height: '64px', borderWidth: '4px' }
  };

  const spinnerStyle = {
    ...sizes[size],
    borderColor: `${color}33`, // Low opacity background
    borderTopColor: color,
    borderRadius: '50%',
    borderStyle: 'solid',
    animation: 'spin 1s linear infinite'
  };

  if (fullPage) {
    return (
      <div className="loading-overlay" style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={spinnerStyle}></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
      <div style={spinnerStyle}></div>
    </div>
  );
};

export default LoadingSpinner;
