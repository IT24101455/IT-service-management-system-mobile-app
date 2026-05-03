import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const statusMeta = {
    PENDING: { label: 'Pending', icon: Clock, colorClass: 'badge-pending' },
    IN_PROGRESS: { label: 'In Progress', icon: AlertCircle, colorClass: 'badge-in_progress' },
    RESOLVED: { label: 'Resolved', icon: CheckCircle, colorClass: 'badge-resolved' },
    CLOSED: { label: 'Closed', icon: XCircle, colorClass: 'badge-closed' },
};

const priorityMeta = {
    LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high', CRITICAL: 'badge-critical',
};

export function StatusBadge({ status }) {
    const meta = statusMeta[status] || { label: status, colorClass: 'badge-other' };
    const Icon = meta.icon;
    return (
        <span className={`badge ${meta.colorClass}`} style={{ gap: '6px', padding: '4px 12px' }}>
            {Icon && <Icon size={12} strokeWidth={2.5} />}
            <span style={{ fontSize: '11px', fontWeight: '700' }}>{meta.label}</span>
        </span>
    );
}

export function PriorityBadge({ priority }) {
    return (
        <span className={`badge ${priorityMeta[priority] || 'badge-low'}`} style={{ padding: '2px 10px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800' }}>{priority}</span>
        </span>
    );
}

export function CategoryBadge({ category }) {
    return (
        <span className={`badge badge-${category?.toLowerCase()}`}>
            {category}
        </span>
    );
}

export function RoleBadge({ role }) {
    const colors = { ADMIN: 'badge-critical', TECHNICIAN: 'badge-in_progress', USER: 'badge-resolved' };
    return <span className={`badge ${colors[role] || 'badge-other'}`}>{role}</span>;
}
