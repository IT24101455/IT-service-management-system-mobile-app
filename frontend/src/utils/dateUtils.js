export const calculateSlaStatus = (slaDeadline, status) => {
    if (!slaDeadline) return { text: 'No SLA', style: { background: '#f1f5f9', color: '#64748b' } };

    if (status === 'RESOLVED' || status === 'CLOSED') {
        return { text: 'SLA Met ✓', style: { background: '#ecfdf5', color: '#059669' } };
    }

    const now = new Date();
    const deadline = new Date(slaDeadline);
    const diffMs = deadline - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 0) {
        const diffAbs = Math.abs(diffHours);
        const text = diffAbs > 24
            ? `Overdue ${Math.floor(diffAbs / 24)}d ${Math.floor(diffAbs % 24)}h`
            : `Overdue ${Math.floor(diffAbs)}h ${Math.floor((diffAbs % 1) * 60)}m`;
        return { text, style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' } };
    } else if (diffHours <= 2) {
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const text = diffHours >= 1
            ? `Due in ${Math.floor(diffHours)}h ${mins}m`
            : `Due in ${mins}m`;
        return { text, style: { background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' } };
    } else {
        const text = diffHours > 24
            ? `Due in ${Math.floor(diffHours / 24)}d`
            : `Due in ${Math.floor(diffHours)}h`;
        return { text, style: { background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' } };
    }
};

// Returns the absolute deadline formatted nicely
export const formatDeadline = (slaDeadline) => {
    if (!slaDeadline) return null;
    const d = new Date(slaDeadline);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' at ' +
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
