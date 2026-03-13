import { useState, useMemo } from 'react';
import { Lock, Activity, WrenchIcon, Shield } from 'lucide-react';
import AdminLayout from '@/components/Admin/AdminLayout';
import { useAuthStore, useActivityLogStore } from '@/lib/store';
import { useAuditStore, AUDIT_ACTIONS } from '@/stores/auditStore';
import { hasPermission, ACTIONS, ROLES } from '@/lib/rbac';
import { paginate } from '@/lib/pagination';
import Pagination from '@/components/Pagination';
import { toast } from 'sonner';

const AdminSettings = () => {
    const changePassword = useAuthStore(s => s.changePassword);
    const user = useAuthStore(s => s.user);
    const { maintenanceMode, toggleMaintenance, addLog } = useActivityLogStore();

    // Audit logs (SUPER_ADMIN only)
    const { logs: auditLogs, loadLogs, loaded: auditLoaded } = useAuditStore();
    const canViewAudit = hasPermission(user?.role, ACTIONS.VIEW_AUDIT_LOGS);

    const [oldPw, setOldPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [auditPage, setAuditPage] = useState(1);
    const [auditLimit, setAuditLimit] = useState(10);
    const [auditFilter, setAuditFilter] = useState('');

    // Load audit logs on first render if allowed
    if (canViewAudit && !auditLoaded) {
        loadLogs();
    }

    const filteredAuditLogs = useMemo(() => {
        if (!canViewAudit) return [];
        let logs = auditLogs;
        if (auditFilter) {
            logs = logs.filter(l => l.actionType === auditFilter);
        }
        return logs;
    }, [auditLogs, auditFilter, canViewAudit]);

    const pagedAudit = useMemo(
        () => paginate(filteredAuditLogs, auditPage, auditLimit),
        [filteredAuditLogs, auditPage, auditLimit]
    );

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (!oldPw || !newPw || !confirmPw) {
            toast.error('All fields are required');
            return;
        }
        if (newPw !== confirmPw) {
            toast.error('New passwords do not match');
            return;
        }
        if (newPw.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        const result = changePassword(oldPw, newPw);
        if (result.success) {
            toast.success('Password changed successfully');
            addLog('Admin password changed');
            setOldPw('');
            setNewPw('');
            setConfirmPw('');
        } else {
            toast.error(result.error);
        }
    };

    const handleMaintenanceToggle = () => {
        toggleMaintenance();
        addLog(`Maintenance mode ${maintenanceMode ? 'disabled' : 'enabled'}`);
        toast.success(`Maintenance mode ${maintenanceMode ? 'disabled' : 'enabled'}`);
    };

    const formatActionType = (type) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const actionTypes = Object.values(AUDIT_ACTIONS);

    return (
        <AdminLayout>
            <div className="admin-page">
                <h1 className="admin-page-title">Settings</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Change Password */}
                    <div className="admin-card">
                        <div className="flex items-center gap-2 mb-4">
                            <Lock className="h-5 w-5 text-primary" />
                            <h2 className="admin-card-title mb-0">Change Password</h2>
                        </div>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="admin-field">
                                <label>Current Password</label>
                                <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)}
                                    className="admin-input" placeholder="••••••••" />
                            </div>
                            <div className="admin-field">
                                <label>New Password</label>
                                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                                    className="admin-input" placeholder="••••••••" />
                            </div>
                            <div className="admin-field">
                                <label>Confirm New Password</label>
                                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                                    className="admin-input" placeholder="••••••••" />
                            </div>
                            <button type="submit" className="admin-btn admin-btn-primary">
                                Update Password
                            </button>
                        </form>
                    </div>

                    {/* Maintenance Mode */}
                    <div className="admin-card">
                        <div className="flex items-center gap-2 mb-4">
                            <WrenchIcon className="h-5 w-5 text-primary" />
                            <h2 className="admin-card-title mb-0">Maintenance Mode</h2>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            When enabled, users will see a maintenance message instead of the portal.
                        </p>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                            <span className="font-medium text-sm">Portal Status</span>
                            <button onClick={handleMaintenanceToggle} className={`admin-toggle ${maintenanceMode ? 'active' : ''}`}>
                                <span className="admin-toggle-knob" />
                            </button>
                        </div>
                        <p className={`text-sm mt-2 font-medium ${maintenanceMode ? 'text-orange-500' : 'text-green-500'}`}>
                            {maintenanceMode ? '⚠ Portal is in maintenance mode' : '✓ Portal is live'}
                        </p>
                    </div>
                </div>

                {/* Audit Log (SUPER_ADMIN only) */}
                {canViewAudit && (
                    <div className="admin-card mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <h2 className="admin-card-title mb-0">Audit Log</h2>
                            </div>
                            <select
                                value={auditFilter}
                                onChange={e => { setAuditFilter(e.target.value); setAuditPage(1); }}
                                className="admin-select text-sm"
                            >
                                <option value="">All Actions</option>
                                {actionTypes.map(t => (
                                    <option key={t} value={t}>{formatActionType(t)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>Performed By</th>
                                        <th>Target</th>
                                        <th>Timestamp</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedAudit.items.map(log => (
                                        <tr key={log.id}>
                                            <td>
                                                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-muted">
                                                    {formatActionType(log.actionType)}
                                                </span>
                                            </td>
                                            <td className="text-sm">{log.performedBy}</td>
                                            <td className="text-sm font-mono text-xs">{log.targetId}</td>
                                            <td className="text-sm text-muted-foreground">
                                                {new Date(log.timestamp).toLocaleString('en-IN', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="text-xs text-muted-foreground max-w-[150px] truncate">
                                                {log.metadata?.schemeName || log.metadata?.userName || log.metadata?.remarks || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    {pagedAudit.items.length === 0 && (
                                        <tr><td colSpan="5" className="text-center text-muted-foreground py-6">No audit logs found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            page={pagedAudit.page}
                            totalPages={pagedAudit.totalPages}
                            totalItems={pagedAudit.totalItems}
                            limit={pagedAudit.limit}
                            onPageChange={setAuditPage}
                            onLimitChange={(l) => { setAuditLimit(l); setAuditPage(1); }}
                        />
                    </div>
                )}

                {/* Legacy Activity Log (for non-SUPER_ADMIN) */}
                {!canViewAudit && (
                    <div className="admin-card mt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="h-5 w-5 text-primary" />
                            <h2 className="admin-card-title mb-0">Activity Log</h2>
                        </div>
                        <p className="text-sm text-muted-foreground py-6 text-center">
                            Detailed audit logs are only available to Super Admins.
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
