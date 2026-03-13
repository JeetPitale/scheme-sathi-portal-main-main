import { useMemo } from 'react';
import { Users, FileText, ClipboardList, TrendingUp } from 'lucide-react';
import AdminLayout from '@/components/Admin/AdminLayout';
import { useAuthStore, useApplicationStore } from '@/lib/store';
import { useSchemeStore } from '@/stores/schemeStore';

const AdminDashboard = () => {
    const users = useAuthStore(s => s.getAllUsers)();
    const applications = useApplicationStore(s => s.applications);
    const schemes = useSchemeStore(s => s.schemes);

    const stats = useMemo(() => {
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.status === 'active').length;
        const totalApps = applications.length;
        const approved = applications.filter(a => a.status === 'approved').length;
        const approvalRate = totalApps > 0 ? Math.round((approved / totalApps) * 100) : 0;
        return { totalUsers, activeUsers, totalApps, approvalRate, totalSchemes: schemes.length };
    }, [users, applications, schemes]);

    const recentApps = useMemo(() =>
        [...applications].sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied)).slice(0, 5),
        [applications]
    );

    return (
        <AdminLayout>
            <div className="admin-page">
                <h1 className="admin-page-title">Dashboard</h1>

                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon bg-blue-500/10 text-blue-500">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="admin-stat-label">Total Users</p>
                            <p className="admin-stat-value">{stats.totalUsers}</p>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon bg-green-500/10 text-green-500">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="admin-stat-label">Active Users</p>
                            <p className="admin-stat-value">{stats.activeUsers}</p>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon bg-orange-500/10 text-orange-500">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="admin-stat-label">Applications</p>
                            <p className="admin-stat-value">{stats.totalApps}</p>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon bg-emerald-500/10 text-emerald-500">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="admin-stat-label">Approval Rate</p>
                            <p className="admin-stat-value">{stats.approvalRate}%</p>
                        </div>
                    </div>
                </div>

                {/* Recent Applications */}
                <div className="admin-card mt-6">
                    <h2 className="admin-card-title">Recent Applications</h2>
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Applicant</th>
                                    <th>Scheme</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentApps.map(app => (
                                    <tr key={app.id}>
                                        <td className="font-mono text-xs">{app.id}</td>
                                        <td>{app.formData?.fullName || app.userId}</td>
                                        <td>{app.serviceName}</td>
                                        <td>{new Date(app.dateApplied).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`admin-badge ${app.status === 'approved' ? 'badge-success' : app.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {recentApps.length === 0 && (
                                    <tr><td colSpan="5" className="text-center text-muted-foreground py-6">No applications yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
