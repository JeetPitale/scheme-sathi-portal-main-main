import { useState, useMemo } from 'react';
import { Search, CheckCircle, XCircle, Eye, ArrowRight } from 'lucide-react';
import AdminLayout from '@/components/Admin/AdminLayout';
import { useApplicationStore, useAuthStore, useActivityLogStore } from '@/lib/store';
import { hasPermission, ACTIONS } from '@/lib/rbac';
import { paginate } from '@/lib/pagination';
import Pagination from '@/components/Pagination';
import StatusTimeline from '@/components/StatusTimeline';
import { toast } from 'sonner';

const AdminApplications = () => {
    const { applications, updateApplicationStatus, moveToReview } = useApplicationStore();
    const { user } = useAuthStore();
    const addLog = useActivityLogStore(s => s.addLog);

    const canReview = hasPermission(user?.role, ACTIONS.APPROVE_APPLICATION);

    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('all');
    const [actionApp, setActionApp] = useState(null);
    const [actionType, setActionType] = useState('');
    const [remarks, setRemarks] = useState('');
    const [viewApp, setViewApp] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const filtered = useMemo(() => {
        return applications.filter(a => {
            if (tab !== 'all' && a.status !== tab) return false;
            if (search && !a.serviceName.toLowerCase().includes(search.toLowerCase()) &&
                !a.id.toLowerCase().includes(search.toLowerCase()) &&
                !(a.formData?.fullName || '').toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [applications, tab, search]);

    const paged = useMemo(() => paginate(filtered, page, limit), [filtered, page, limit]);

    const counts = useMemo(() => ({
        all: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        under_review: applications.filter(a => a.status === 'under_review').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
    }), [applications]);

    const handleAction = (app, type) => {
        setActionApp(app);
        setActionType(type);
        setRemarks('');
    };

    const confirmAction = () => {
        if (!actionApp) return;

        if (actionType === 'under_review') {
            const result = moveToReview(actionApp.id);
            if (result.success) {
                toast.success('Application moved to review');
                addLog(`Application review started: ${actionApp.id}`);
            } else {
                toast.error(result.error);
            }
        } else {
            if (actionType === 'rejected' && (!remarks || !remarks.trim())) {
                toast.error('Please provide a reason for rejection');
                return;
            }
            const result = updateApplicationStatus(actionApp.id, actionType, remarks);
            if (result.success) {
                toast.success(`Application ${actionType}`);
                addLog(`Application ${actionType}: ${actionApp.id} (${actionApp.serviceName})`);
            } else {
                toast.error(result.error);
            }
        }
        setActionApp(null);
    };

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'under_review', label: 'Under Review' },
        { key: 'approved', label: 'Approved' },
        { key: 'rejected', label: 'Rejected' },
    ];

    const getStatusBadge = (status) => {
        const classes = {
            pending: 'badge-warning',
            under_review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            approved: 'badge-success',
            rejected: 'badge-danger',
        };
        const labels = {
            pending: 'Pending',
            under_review: 'Under Review',
            approved: 'Approved',
            rejected: 'Rejected',
        };
        return (
            <span className={`admin-badge ${classes[status] || 'badge-warning'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="admin-page">
                <h1 className="admin-page-title">Applications ({applications.length})</h1>

                {/* Tabs */}
                <div className="admin-tabs mb-4">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }}
                            className={`admin-tab ${tab === t.key ? 'active' : ''}`}>
                            {t.label} ({counts[t.key]})
                        </button>
                    ))}
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by name, ID, or scheme..." className="admin-input pl-10" />
                </div>

                <div className="admin-card">
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Applicant</th>
                                    <th>Scheme</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.items.map(app => (
                                    <tr key={app.id}>
                                        <td className="font-mono text-xs">{app.id}</td>
                                        <td>{app.formData?.fullName || app.userId}</td>
                                        <td className="max-w-[200px] truncate">{app.serviceName}</td>
                                        <td>{new Date(app.dateApplied).toLocaleDateString()}</td>
                                        <td>{getStatusBadge(app.status)}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button onClick={() => setViewApp(app)} className="admin-btn-icon" title="View Timeline">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                {canReview && app.status === 'pending' && (
                                                    <button onClick={() => handleAction(app, 'under_review')}
                                                        className="admin-btn-icon text-blue-500" title="Move to Review">
                                                        <ArrowRight className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {canReview && app.status === 'under_review' && (
                                                    <>
                                                        <button onClick={() => handleAction(app, 'approved')}
                                                            className="admin-btn-icon text-green-500" title="Approve">
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleAction(app, 'rejected')}
                                                            className="admin-btn-icon text-red-500" title="Reject">
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {!canReview && <span className="text-xs text-muted-foreground">—</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paged.items.length === 0 && (
                                    <tr><td colSpan="6" className="text-center text-muted-foreground py-6">No applications found</td></tr>
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

                {/* Action Confirm Modal */}
                {actionApp && (
                    <div className="admin-modal-overlay" onClick={() => setActionApp(null)}>
                        <div className="admin-modal" onClick={e => e.stopPropagation()}>
                            <h2 className="admin-modal-title">
                                {actionType === 'approved' ? 'Approve' : actionType === 'rejected' ? 'Reject' : 'Move to Review'} Application
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                {actionApp.serviceName} — {actionApp.formData?.fullName || actionApp.userId}
                            </p>
                            {actionType !== 'under_review' && (
                                <div className="admin-field">
                                    <label>Remarks {actionType === 'rejected' && <span className="text-red-500">*</span>}</label>
                                    <textarea value={remarks} onChange={e => setRemarks(e.target.value)}
                                        className="admin-input" rows="3"
                                        placeholder={actionType === 'rejected' ? 'Reason for rejection (required)...' : 'Add remarks...'} />
                                </div>
                            )}
                            <div className="admin-modal-actions">
                                <button onClick={() => setActionApp(null)} className="admin-btn">Cancel</button>
                                <button onClick={confirmAction}
                                    className={`admin-btn ${actionType === 'approved' ? 'admin-btn-primary' : actionType === 'rejected' ? 'admin-btn-danger' : 'admin-btn-primary'}`}>
                                    {actionType === 'approved' ? 'Approve' : actionType === 'rejected' ? 'Reject' : 'Move to Review'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Timeline Modal */}
                {viewApp && (
                    <div className="admin-modal-overlay" onClick={() => setViewApp(null)}>
                        <div className="admin-modal max-w-lg" onClick={e => e.stopPropagation()}>
                            <h2 className="admin-modal-title">Application Timeline</h2>
                            <p className="text-sm text-muted-foreground mb-2">
                                {viewApp.serviceName} — {viewApp.formData?.fullName || viewApp.userId}
                            </p>
                            <p className="text-xs text-muted-foreground mb-4">ID: {viewApp.id}</p>
                            <StatusTimeline statusHistory={viewApp.statusHistory || []} />
                            <div className="admin-modal-actions mt-4">
                                <button onClick={() => setViewApp(null)} className="admin-btn">Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminApplications;
