import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminLayout from '@/components/Admin/AdminLayout';
import { useSchemeStore, serviceCategories } from '@/stores/schemeStore';
import { useAuthStore, useActivityLogStore } from '@/lib/store';
import { hasPermission, ACTIONS } from '@/lib/rbac';
import { paginate } from '@/lib/pagination';
import Pagination from '@/components/Pagination';
import { toast } from 'sonner';

const AdminSchemes = () => {
    const { schemes, addScheme, updateScheme, removeScheme, toggleSchemeStatus } = useSchemeStore();
    const { user } = useAuthStore();
    const addLog = useActivityLogStore(s => s.addLog);

    const canAdd = hasPermission(user?.role, ACTIONS.ADD_SCHEME);
    const canEdit = hasPermission(user?.role, ACTIONS.EDIT_SCHEME);
    const canDelete = hasPermission(user?.role, ACTIONS.DELETE_SCHEME);

    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [formData, setFormData] = useState({
        name: '', description: '', category: 'social-welfare',
        state: 'central', eligibility: '', benefits: '', status: 'active',
    });

    const filtered = useMemo(() => {
        return schemes.filter(s => {
            if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
                !s.description.toLowerCase().includes(search.toLowerCase())) return false;
            if (filterCat && s.category !== filterCat) return false;
            if (filterStatus && s.status !== filterStatus) return false;
            return true;
        });
    }, [schemes, search, filterCat, filterStatus]);

    const paged = useMemo(() => paginate(filtered, page, limit), [filtered, page, limit]);

    const openAdd = () => {
        setEditId(null);
        setFormData({ name: '', description: '', category: 'social-welfare', state: 'central', eligibility: '', benefits: '', status: 'active' });
        setShowModal(true);
    };

    const openEdit = (scheme) => {
        setEditId(scheme.id);
        setFormData({
            name: scheme.name,
            description: scheme.description,
            category: scheme.category,
            state: scheme.state || 'central',
            eligibility: scheme.eligibility || '',
            benefits: scheme.benefits || '',
            status: scheme.status,
        });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.description.trim()) {
            toast.error('Name and description are required');
            return;
        }

        if (editId) {
            const result = updateScheme(editId, formData);
            if (result.success) {
                toast.success('Scheme updated');
                addLog(`Scheme updated: ${formData.name}`);
            } else {
                toast.error(result.error);
            }
        } else {
            const result = addScheme(formData);
            if (result.success) {
                toast.success('Scheme added');
                addLog(`Scheme added: ${formData.name}`);
            } else {
                toast.error(result.error);
            }
        }
        setShowModal(false);
    };

    const handleDelete = (scheme) => {
        if (!confirm(`Delete "${scheme.name}"?`)) return;
        const result = removeScheme(scheme.id);
        if (result.success) {
            toast.success('Scheme deleted');
            addLog(`Scheme deleted: ${scheme.name}`);
        }
    };

    const handleToggle = (scheme) => {
        const result = toggleSchemeStatus(scheme.id);
        if (result.success) {
            toast.success(`Scheme ${scheme.status === 'active' ? 'deactivated' : 'activated'}`);
            addLog(`Scheme toggled: ${scheme.name}`);
        }
    };

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="admin-page-title mb-0">Schemes ({schemes.length})</h1>
                    {canAdd && (
                        <button onClick={openAdd} className="admin-btn admin-btn-primary">
                            <Plus className="h-4 w-4 mr-1" /> Add Scheme
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search schemes..." className="admin-input pl-10" />
                    </div>
                    <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }} className="admin-select">
                        <option value="">All Categories</option>
                        {serviceCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.nameKey}</option>)}
                    </select>
                    <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="admin-select">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div className="admin-card">
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>State</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.items.map(s => (
                                    <tr key={s.id}>
                                        <td className="font-medium max-w-[250px] truncate">{s.name}</td>
                                        <td className="capitalize text-sm">{s.category?.replace(/-/g, ' ')}</td>
                                        <td className="capitalize text-sm">{s.state?.replace(/-/g, ' ') || 'Central'}</td>
                                        <td>
                                            <span className={`admin-badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                {canEdit && (
                                                    <button onClick={() => openEdit(s)} className="admin-btn-icon" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {canEdit && (
                                                    <button onClick={() => handleToggle(s)} className="admin-btn-icon" title={s.status === 'active' ? 'Deactivate' : 'Activate'}>
                                                        {s.status === 'active'
                                                            ? <ToggleRight className="h-4 w-4 text-green-500" />
                                                            : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button onClick={() => handleDelete(s)} className="admin-btn-icon text-red-500" title="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {!canEdit && !canDelete && <span className="text-xs text-muted-foreground">—</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paged.items.length === 0 && (
                                    <tr><td colSpan="5" className="text-center text-muted-foreground py-6">No schemes found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        page={paged.page}
                        totalPages={paged.totalPages}
                        totalItems={paged.totalItems}
                        limit={paged.limit}
                        onPageChange={setPage}
                        onLimitChange={(l) => { setLimit(l); setPage(1); }}
                    />
                </div>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="admin-modal" onClick={e => e.stopPropagation()}>
                            <h2 className="admin-modal-title">{editId ? 'Edit' : 'Add'} Scheme</h2>
                            <div className="space-y-4">
                                <div className="admin-field">
                                    <label>Name</label>
                                    <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="admin-input" placeholder="Scheme name" />
                                </div>
                                <div className="admin-field">
                                    <label>Description</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="admin-input" rows="3" placeholder="Scheme description" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="admin-field">
                                        <label>Category</label>
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="admin-select">
                                            {serviceCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.nameKey}</option>)}
                                        </select>
                                    </div>
                                    <div className="admin-field">
                                        <label>Status</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            className="admin-select">
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="admin-field">
                                    <label>Eligibility</label>
                                    <input value={formData.eligibility} onChange={e => setFormData({ ...formData, eligibility: e.target.value })}
                                        className="admin-input" placeholder="Eligibility criteria" />
                                </div>
                                <div className="admin-field">
                                    <label>Benefits</label>
                                    <input value={formData.benefits} onChange={e => setFormData({ ...formData, benefits: e.target.value })}
                                        className="admin-input" placeholder="Benefits" />
                                </div>
                            </div>
                            <div className="admin-modal-actions">
                                <button onClick={() => setShowModal(false)} className="admin-btn">Cancel</button>
                                <button onClick={handleSave} className="admin-btn admin-btn-primary">{editId ? 'Update' : 'Add'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminSchemes;
