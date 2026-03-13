import { useEffect } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import { useAuthStore } from '@/lib/store';
import { hasPermission, ACTIONS } from '@/lib/rbac';
import { useAnalyticsStore } from '@/stores/analyticsStore';

// Analytics sections
import KpiCards from '@/components/Admin/analytics/KpiCards';
import FilterPanel from '@/components/Admin/analytics/FilterPanel';
import ApplicationTrends from '@/components/Admin/analytics/ApplicationTrends';
import StatusDistribution from '@/components/Admin/analytics/StatusDistribution';
import TopSchemes from '@/components/Admin/analytics/TopSchemes';
import StateDistribution from '@/components/Admin/analytics/StateDistribution';
import ProcessingTime from '@/components/Admin/analytics/ProcessingTime';
import DropOffAnalysis from '@/components/Admin/analytics/DropOffAnalysis';

const AdminAnalytics = () => {
    const user = useAuthStore(s => s.user);
    const {
        loadAnalytics,
        kpiSummary,
        applicationTrends,
        statusDistribution,
        topSchemes,
        stateDistribution,
        processingStats,
        dropOffStats,
        isLoading,
    } = useAnalyticsStore();

    // Load on mount
    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    // RBAC guard
    if (!user || !hasPermission(user.role, ACTIONS.VIEW_ANALYTICS)) {
        return (
            <AdminLayout>
                <div className="admin-page">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center p-8">
                            <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
                            <p className="text-muted-foreground">You do not have permission to view analytics.</p>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">Real-time insights derived from system data</p>
                </div>

                {/* Loading state */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                )}

                {!isLoading && (
                    <div className="space-y-6">
                        {/* Section 8: Global Filters */}
                        <FilterPanel />

                        {/* Section 1: KPI Cards */}
                        <KpiCards data={kpiSummary} />

                        {/* Charts row: Trends + Status */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                {/* Section 2: Application Trends */}
                                <ApplicationTrends data={applicationTrends} />
                            </div>
                            <div>
                                {/* Section 3: Status Distribution */}
                                <StatusDistribution data={statusDistribution} />
                            </div>
                        </div>

                        {/* Section 4: Top Schemes */}
                        <TopSchemes data={topSchemes} />

                        {/* Charts row: State + Processing */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Section 5: State Distribution */}
                            <StateDistribution data={stateDistribution} />

                            {/* Section 6: Processing Time */}
                            <ProcessingTime data={processingStats} />
                        </div>

                        {/* Section 7: Drop-off Analysis */}
                        <div className="max-w-lg">
                            <DropOffAnalysis data={dropOffStats} />
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminAnalytics;
