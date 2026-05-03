import { useEffect, useState } from 'react';
import { getUsers, deleteUser, toggleUserActive } from '../../api/api';
import Topbar from '../../components/Topbar';
import { RoleBadge } from '../../components/Badges';
import { toast } from 'react-toastify';
import { Search, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        getUsers().then(res => setUsers(res.data)).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        await deleteUser(id);
        toast.success('User deleted');
        load();
    };

    const handleToggle = async (id) => {
        await toggleUserActive(id);
        toast.success('User status updated');
        load();
    };

    const filtered = users
        .filter(u => u.role !== 'ADMIN')
        .filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

    return (
        <>
            <Topbar title="User Management" subtitle="Manage all registered users" />
            <div className="page-content">
                <div className="search-bar">
                    <div className="search-input-wrapper">
                        <Search size={15} />
                        <input className="search-input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        {loading ? <div className="loading-spinner" /> : (
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Dept.</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {filtered.map(u => (
                                            <tr key={u.id}>
                                                <td style={{ fontWeight: 600 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div className="user-avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
                                                            {u.name?.charAt(0)}
                                                        </div>
                                                        {u.name}
                                                    </div>
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                                                <td><RoleBadge role={u.role} /></td>
                                                <td style={{ color: 'var(--text-muted)' }}>{u.phone || '—'}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{u.department || '—'}</td>
                                                <td>
                                                    <span className={`badge ${u.active ? 'badge-active' : 'badge-inactive'}`}>
                                                        {u.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(u.id)} title={u.active ? 'Deactivate' : 'Activate'}>
                                                            {u.active ? <ToggleRight size={15} color="var(--success)" /> : <ToggleLeft size={15} />}
                                                        </button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
