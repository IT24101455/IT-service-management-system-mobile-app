// Import the useEffect and useState hooks for lifecycle and state management
import { useEffect, useState } from 'react';
// Import API methods for CRUD operations on assets
import { getAssets, createAsset, updateAsset, deleteAsset } from '../../api/api';
// Import Topbar component for the page header
import Topbar from '../../components/Topbar';
// Import toast for ui notifications
import { toast } from 'react-toastify';
// Import icons used in the ui
import { Plus, Trash2, Edit, Monitor, Search } from 'lucide-react';

// Define the initial form state structure for creating/editing an asset
const initialForm = { name: '', type: 'LAPTOP', serialNumber: '', model: '', manufacturer: '', status: 'ACTIVE', location: '', purchaseCost: '', notes: '' };

// Define the AdminAssets default export component
export default function AdminAssets() {
    // State to store the array of assets
    const [assets, setAssets] = useState([]);
    // State to track if data is currently loading
    const [loading, setLoading] = useState(true);
    // State to control modal visibility
    const [modal, setModal] = useState(false);
    // State to store the asset currently being edited (or null if creating new)
    const [editAsset, setEditAsset] = useState(null);
    // State to manage the form inputs
    const [form, setForm] = useState(initialForm);
    // State to handle the search filter text
    const [search, setSearch] = useState('');

    // Define a function to reload asset data from the API
    const load = () => {
        // Set loading to true initially
        setLoading(true);
        // Call the getAssets API, set the resulting data to state, then set loading to false
        getAssets().then(res => setAssets(res.data)).finally(() => setLoading(false));
    };

    // Use useEffect to load data initially when the component mounts
    useEffect(() => { load(); }, []);

    // Function to open the modal in 'Create' mode
    const openCreate = () => { setEditAsset(null); setForm(initialForm); setModal(true); };
    // Function to open the modal in 'Edit' mode for a specific asset
    const openEdit = (a) => { setEditAsset(a); setForm(a); setModal(true); };

    // Async function to handle saving an asset (create or update)
    const handleSave = async () => {
        try {
            // Update if editAsset exists, otherwise create
            if (editAsset) await updateAsset(editAsset.id, form);
            else await createAsset(form);
            // Show success toast
            toast.success(editAsset ? 'Asset updated' : 'Asset created');
            // Close the modal
            setModal(false);
            // Reload the assets list
            load();
        } catch {
            // Show error toast on failure
            toast.error('Save failed');
        }
    };

    // Async function to handle deleting an asset
    const handleDelete = async (id) => {
        // Prompt for user confirmation before deleting
        if (!window.confirm('Delete this asset?')) return;
        // Proceed to delete via API
        await deleteAsset(id);
        // Show success toast
        toast.success('Asset deleted');
        // Reload asset list
        load();
    };

    // Derive a filtered list of assets based on the search state matching name or serial number
    const filtered = assets.filter(a =>
        a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.serialNumber?.toLowerCase().includes(search.toLowerCase())
    );

    // Dictionary mapping asset statuses to specific badge CSS classes
    const statusColors = { ACTIVE: 'badge-active', INACTIVE: 'badge-inactive', UNDER_MAINTENANCE: 'badge-maintenance', RETIRED: 'badge-closed' };

    // Render the layout
    return (
        <>
            {/* Topbar navigation */}
            <Topbar title="Asset Inventory" subtitle="Manage IT assets and equipment" />
            <div className="page-content">
                {/* Search bar container */}
                <div className="search-bar">
                    <div className="search-input-wrapper">
                        {/* Search icon */}
                        <Search size={15} />
                        {/* Text input bound to the search state */}
                        <input className="search-input" placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {/* Add button to trigger modal */}
                    <button className="btn btn-primary" onClick={openCreate}>
                        <Plus size={15} /> Add Asset
                    </button>
                </div>

                {/* Main data card */}
                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        {/* Conditional rendering for loading, empty data, or table */}
                        {loading ? <div className="loading-spinner" /> :
                            filtered.length === 0 ? (
                                <div className="empty-state">
                                    <Monitor size={48} />
                                    <h3>No assets found</h3>
                                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openCreate}>
                                        <Plus size={15} /> Add First Asset
                                    </button>
                                </div>
                            ) : (
                                <div className="table-wrapper">
                                    {/* Asset Table */}
                                    <table>
                                        <thead>
                                            <tr><th>Name</th><th>Type</th><th>Serial No.</th><th>Model</th><th>Location</th><th>Status</th><th>Cost</th><th>Actions</th></tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map(a => (
                                                <tr key={a.id}>
                                                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                                                    <td style={{ color: 'var(--text-secondary)' }}>{a.type}</td>
                                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.serialNumber || '—'}</td>
                                                    <td>{a.model || '—'}</td>
                                                    <td>{a.location || '—'}</td>
                                                    <td><span className={`badge ${statusColors[a.status] || 'badge-other'}`}>{a.status?.replace('_', ' ')}</span></td>
                                                    <td>{a.purchaseCost ? `LKR ${Number(a.purchaseCost).toLocaleString()}` : '—'}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            {/* Edit button */}
                                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}><Edit size={13} /></button>
                                                            {/* Delete button */}
                                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}><Trash2 size={13} /></button>
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

            {/* Modal dialog for creating/editing */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    {/* Stop propagation so clicking inside modal doesn't close it */}
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">{editAsset ? 'Edit Asset' : 'Add New Asset'}</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => setModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {/* Input fields bound to the form state */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Name *</label>
                                    <input className="form-control" placeholder="Dell Laptop" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                        {['LAPTOP', 'DESKTOP', 'PRINTER', 'SERVER', 'NETWORK', 'PHONE', 'OTHER'].map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Serial Number</label>
                                    <input className="form-control" placeholder="SN123456" value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                                        <option value="RETIRED">Retired</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Model</label>
                                    <input className="form-control" placeholder="XPS 15" value={form.model || ''} onChange={e => setForm({ ...form, model: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <input className="form-control" placeholder="Room 201" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Purchase Cost (LKR)</label>
                                <input type="number" className="form-control" placeholder="0" value={form.purchaseCost} onChange={e => setForm({ ...form, purchaseCost: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            {/* Form submit/cancel buttons */}
                            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>{editAsset ? 'Save Changes' : 'Add Asset'}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
