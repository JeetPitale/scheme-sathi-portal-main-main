import { useState, useMemo, useEffect } from 'react';
import { Shield } from 'lucide-react';
import AdminLayout from '@/components/Admin/AdminLayout';
import { useAuthStore } from '@/lib/store';
import { useAuditStore } from '@/stores/auditStore';
import { ROLES, ADMIN_ROLES, getRoleLabel, getRoleBadgeClass, hasPermission, ACTIONS } from '@/lib/rbac';
import { paginate } from '@/lib/pagination';
import Pagination from '@/components/Pagination';
import { toast } from 'sonner';

const AdminRoles = () => {
    const { user, getAdminUsers, loadAdminUsers, updateUserRole } = useAuthStore();
    const { logAction } = useAuditStore();
    const admins = getAdminUsers();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [editingId, setEditingId] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [isLoading, setIsLoading] = useState(!admins.length);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            await loadAdminUsers();
            setIsLoading(false);
        };
        load();
    }, []);

    const paged = useMemo(() => paginate(admins || [], page, limit), [admins, page, limit]);

    // Check permission
    if (!hasPermission(user?.role, ACTIONS.MANAGE_ROLES)) {
        return (
            <AdminLayout>
                <div className="admin-page flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
                        <p className="text-muted-foreground">Only Super Admins can manage roles.</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const handleRoleChange = (adminUser) => {
        if (!newRole || newRole === adminUser.role) {
            setEditingId(null);
            return;
        }
        // Prevent self-demotion
        if (adminUser.id === user.id) {
            toast.error('You cannot change your own role');
            setEditingId(null);
            return;
        }
        const result = updateUserRole(adminUser.id, newRole);
        if (result.success) {
            toast.success(`Role updated: ${adminUser.fullName} → ${getRoleLabel(newRole)}`);
        } else {
            toast.error(result.error);
        }
        setEditingId(null);
    };

    const startEdit = (adminUser) => {
        setEditingId(adminUser.id);
        setNewRole(adminUser.role);
    };

    return (
        <AdminLayout>
            <div className="admin-page">
                <h1 className="admin-page-title">Role Management</h1>
                <p className="text-sm text-muted-foreground mb-6">
                    Manage admin roles and permissions. Only Super Admins can access this page.
                </p>

                {/* Permission Matrix */}
                <div className="admin-card mb-6">
                    <h2 className="admin-card-title mb-4">Permission Matrix</h2>
                    <div className="admin-table-wrap">
                        <table className="admin-table text-sm">
                            <thead>
                                <tr>
                                    <th>Permission</th>
                                    <th className="text-center">Super Admin</th>
                                    <th className="text-center">Content Admin</th>
                                    <th className="text-center">Review Admin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Add / Edit Schemes', ACTIONS.ADD_SCHEME],
                                    ['Delete Schemes', ACTIONS.DELETE_SCHEME],
                                    ['Approve / Reject Apps', ACTIONS.APPROVE_APPLICATION],
                                    ['View Users', ACTIONS.VIEW_USERS],
                                    ['View Audit Logs', ACTIONS.VIEW_AUDIT_LOGS],
                                    ['Manage Roles', ACTIONS.MANAGE_ROLES],
                                    ['Send Notifications', ACTIONS.SEND_NOTIFICATIONS],
                                ].map(([label, action]) => (
                                    <tr key={action}>
                                        <td>{label}</td>
                                        <td className="text-center">{hasPermission(ROLES.SUPER_ADMIN, action) ? '✅' : '❌'}</td>
                                        <td className="text-center">{hasPermission(ROLES.CONTENT_ADMIN, action) ? '✅' : '❌'}</td>
                                        <td className="text-center">{hasPermission(ROLES.REVIEW_ADMIN, action) ? '✅' : '❌'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Admin Users Table */}
                <div className="admin-card">
                    <h2 className="admin-card-title mb-4">Admin Users ({admins?.length || 0})</h2>
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Current Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paged.items.map(a => (
                                        <tr key={a.id}>
                                            <td className="font-medium">{a.fullName}</td>
                                            <td className="text-sm text-muted-foreground">{a.email}</td>
                                            <td>
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(a.role)}`}>
                                                    {getRoleLabel(a.role)}
                                                </span>
                                            </td>
                                            <td>
                                                {editingId === a.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={newRole}
                                                            onChange={e => setNewRole(e.target.value)}
                                                            className="admin-select text-sm"
                                                        >
                                                            {ADMIN_ROLES.map(r => (
                                                                <option key={r} value={r}>{getRoleLabel(r)}</option>
                                                            ))}
                                                        </select>
                                                        <button onClick={() => handleRoleChange(a)} className="admin-btn admin-btn-primary text-xs">Save</button>
                                                        <button onClick={() => setEditingId(null)} className="admin-btn text-xs">Cancel</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startEdit(a)}
                                                        disabled={a.id === user.id}
                                                        className="admin-btn text-xs disabled:opacity-40"
                                                    >
                                                        {a.id === user.id ? 'Current User' : 'Change Role'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!isLoading && (
                        <Pagination
                            page={paged.page}
                            totalPages={paged.totalPages}
                            totalItems={paged.totalItems}
                            limit={paged.limit}
                            onPageChange={(p) => setPage(p)}
                            onLimitChange={(l) => { setLimit(l); setPage(1); }}
                        />
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminRoles;
