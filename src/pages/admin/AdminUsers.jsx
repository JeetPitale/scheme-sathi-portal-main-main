import { useState, useMemo } from 'react';
import { Search, ShieldAlert, ShieldCheck, Eye } from 'lucide-react';
import AdminLayout from '@/components/Admin/AdminLayout';
import { useAuthStore, useApplicationStore, useActivityLogStore } from '@/lib/store';
import { paginate } from '@/lib/pagination';
import Pagination from '@/components/Pagination';
import { toast } from 'sonner';

const AdminUsers = () => {
    const getAllUsers = useAuthStore(s => s.getAllUsers);
    const toggleUserStatus = useAuthStore(s => s.toggleUserStatus);
    const applications = useApplicationStore(s => s.applications);
    const addLog = useActivityLogStore(s => s.addLog);

    const [search, setSearch] = useState('');
    const [filterState, setFilterState] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const users = getAllUsers();

    const filtered = useMemo(() => {
        return users.filter(u => {
            if (search && !(u.fullName || u.full_name || '').toLowerCase().includes(search.toLowerCase()) &&
                !(u.email || '').toLowerCase().includes(search.toLowerCase())) return false;
            if (filterState && u.status !== filterState) return false;
            return true;
        });
    }, [users, search, filterState]);

    const paged = useMemo(() => paginate(filtered, page, limit), [filtered, page, limit]);

    const handleToggle = (user) => {
        const result = toggleUserStatus(user.id);
        if (result.success) {
            const action = user.status === 'active' ? 'Blocked' : 'Unblocked';
            toast.success(`User ${action}: ${user.fullName || user.full_name || user.email}`);
            addLog(`User ${action}: ${user.fullName || user.full_name || user.email}`);
        }
    };

    const getAppCount = (userId) => applications.filter(a => a.userId === userId).length;

    return (
        <AdminLayout>
            <div className="admin-page">
                <h1 className="admin-page-title">Users ({users.length})</h1>

                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by name or email..." className="admin-input pl-10" />
                    </div>
                    <select value={filterState} onChange={e => { setFilterState(e.target.value); setPage(1); }} className="admin-select">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>

                <div className="admin-card">
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                    <th>State</th>
                                    <th>Applications</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.items.map(u => (
                                    <tr key={u.id}>
                                        <td className="font-medium">{u.fullName || u.full_name || u.email || '—'}</td>
                                        <td className="text-sm text-muted-foreground">{u.email}</td>
                                        <td>{u.mobile}</td>
                                        <td className="capitalize">{u.state?.replace(/-/g, ' ') || '—'}</td>
                                        <td>{getAppCount(u.id)}</td>
                                        <td>
                                            <span className={`admin-badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button onClick={() => setSelectedUser(u)} className="admin-btn-icon" title="View">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleToggle(u)} className="admin-btn-icon" title={u.status === 'active' ? 'Block' : 'Unblock'}>
                                                    {u.status === 'active'
                                                        ? <ShieldAlert className="h-4 w-4 text-red-500" />
                                                        : <ShieldCheck className="h-4 w-4 text-green-500" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paged.items.length === 0 && (
                                    <tr><td colSpan="7" className="text-center text-muted-foreground py-6">No users found</td></tr>
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

                {/* User Detail Modal */}
                {selectedUser && (
                    <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
                        <div className="admin-modal" onClick={e => e.stopPropagation()}>
                            <h2 className="admin-modal-title">User Profile</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{selectedUser.fullName || selectedUser.full_name || selectedUser.email || '—'}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selectedUser.email}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Mobile</span><span>{selectedUser.mobile}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">State</span><span className="capitalize">{selectedUser.state?.replace(/-/g, ' ')}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                                    <span className={`admin-badge ${selectedUser.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{selectedUser.status}</span>
                                </div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span>{selectedUser.joinedAt}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Applications</span><span>{getAppCount(selectedUser.id)}</span></div>
                            </div>
                            <div className="admin-modal-actions mt-4">
                                <button onClick={() => setSelectedUser(null)} className="admin-btn">Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
