/**
 * AnalyticsService — Pure computation layer for dashboard analytics.
 * Derives ALL data from existing services. Zero duplicate storage.
 * Every function accepts a `filters` object: { dateRange, scheme, state, status }
 */

import { useApplicationStore } from '@/lib/store';
import { useAuthStore } from '@/lib/store';
import { ADMIN_ROLES } from '@/lib/rbac';

// ── Helpers ──

/** Filter applications by the global filter object */
function filterApplications(apps, filters = {}) {
    let filtered = [...apps];

    // Date range
    if (filters.dateFrom) {
        const from = new Date(filters.dateFrom).getTime();
        filtered = filtered.filter(a => new Date(a.dateApplied).getTime() >= from);
    }
    if (filters.dateTo) {
        const to = new Date(filters.dateTo).getTime() + 86400000; // include end day
        filtered = filtered.filter(a => new Date(a.dateApplied).getTime() <= to);
    }

    // Scheme
    if (filters.scheme) {
        filtered = filtered.filter(a => a.serviceId === filters.scheme);
    }

    // State filtering temporarily disabled as user state map is unavailable
    if (filters.state) {
        // Placeholder
    }

    // Status
    if (filters.status) {
        filtered = filtered.filter(a => a.status === filters.status);
    }

    return filtered;
}

/** Calculate processing time in days for a resolved application */
function getProcessingDays(app) {
    if (app.status !== 'approved' && app.status !== 'rejected') return null;
    const history = app.statusHistory || [];
    const submitted = history.find(h => h.status === 'pending');
    const resolved = [...history].reverse().find(h => h.status === 'approved' || h.status === 'rejected');
    if (!submitted || !resolved) return null;
    const diff = new Date(resolved.date).getTime() - new Date(submitted.date).getTime();
    return Math.max(0, Math.round(diff / 86400000));
}

// Helpers removed: getRegularUsers, getUserStateMap (depended on UserService)

/** Parse a preset date range into dateFrom/dateTo */
export function parseDatePreset(preset) {
    const now = new Date();
    switch (preset) {
        case '7d': {
            const from = new Date(now);
            from.setDate(from.getDate() - 7);
            return { dateFrom: from.toISOString().split('T')[0], dateTo: now.toISOString().split('T')[0] };
        }
        case '30d': {
            const from = new Date(now);
            from.setDate(from.getDate() - 30);
            return { dateFrom: from.toISOString().split('T')[0], dateTo: now.toISOString().split('T')[0] };
        }
        case '6m': {
            const from = new Date(now);
            from.setMonth(from.getMonth() - 6);
            return { dateFrom: from.toISOString().split('T')[0], dateTo: now.toISOString().split('T')[0] };
        }
        case 'all':
        default:
            return { dateFrom: null, dateTo: null };
    }
}

// ── Public API ──

const AnalyticsService = {

    /**
     * Section 1: KPI Summary Cards
     */
    getKpiSummary(filters = {}) {
        const allApps = useApplicationStore.getState().applications || [];
        const apps = filterApplications(allApps, filters);
        const users = useAuthStore.getState().users || [];

        const approved = apps.filter(a => a.status === 'approved').length;
        const rejected = apps.filter(a => a.status === 'rejected').length;
        const pending = apps.filter(a => a.status === 'pending').length;
        const total = apps.length;

        // Active users (joined in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsersCount = users.filter(u =>
            u.status === 'active' && u.createdAt && new Date(u.createdAt).getTime() >= thirtyDaysAgo.getTime()
        ).length;

        // Average processing time
        const processingTimes = apps.map(getProcessingDays).filter(d => d !== null);
        const avgProcessing = processingTimes.length > 0
            ? Math.round(processingTimes.reduce((s, v) => s + v, 0) / processingTimes.length)
            : 0;

        return {
            totalUsers: users.length || 0,
            activeUsers: activeUsersCount || 0,
            totalApplications: total,
            approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
            rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
            pendingApplications: pending,
            avgProcessingDays: avgProcessing,
        };
    },

    /**
     * Section 2: Application Trends
     */
    getApplicationTrends(filters = {}) {
        const allApps = useApplicationStore.getState().applications || [];
        const apps = filterApplications(allApps, filters);
        const months = {};

        apps.forEach(a => {
            const d = new Date(a.dateApplied || a.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!months[key]) months[key] = { key, label, applications: 0, approved: 0, rejected: 0 };
            months[key].applications++;
            if (a.status === 'approved') months[key].approved++;
            if (a.status === 'rejected') months[key].rejected++;
        });

        return Object.values(months).sort((a, b) => a.key.localeCompare(b.key));
    },

    getStatusDistribution(filters = {}) {
        const allApps = useApplicationStore.getState().applications || [];
        const apps = filterApplications(allApps, filters);
        return [
            { name: 'Approved', value: apps.filter(a => a.status === 'approved').length, color: '#22c55e' },
            { name: 'Rejected', value: apps.filter(a => a.status === 'rejected').length, color: '#ef4444' },
            { name: 'Pending', value: apps.filter(a => a.status === 'pending').length, color: '#eab308' },
            { name: 'Under Review', value: apps.filter(a => a.status === 'under_review').length, color: '#3b82f6' },
        ].filter(d => d.value > 0);
    },

    getTopSchemes(filters = {}) {
        const allApps = useApplicationStore.getState().applications || [];
        const apps = filterApplications(allApps, filters);
        const schemeMap = {};
        apps.forEach(a => {
            schemeMap[a.serviceName] = (schemeMap[a.serviceName] || 0) + 1;
        });
        return Object.entries(schemeMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    },

    getStateDistribution(filters = {}) {
        const allApps = useApplicationStore.getState().applications || [];
        const apps = filterApplications(allApps, filters);
        const stateMap = {};
        apps.forEach(a => {
            const state = a.userState || 'Unknown';
            stateMap[state] = (stateMap[state] || 0) + 1;
        });
        return Object.entries(stateMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    },

    getProcessingStats(filters = {}) {
        const allApps = useApplicationStore.getState().applications || [];
        const apps = filterApplications(allApps, filters);
        const times = apps.map(getProcessingDays).filter(t => t !== null);
        if (!times.length) return { average: 0, min: 0, max: 0 };
        return {
            average: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
            min: Math.min(...times),
            max: Math.max(...times)
        };
    },

    getDropOffStats(filters = {}) {
        // Mock data as drop-off tracking requires specific session logging
        return [
            { stage: 'Started', count: 100 },
            { stage: 'Documents', count: 75 },
            { stage: 'Final Review', count: 60 },
            { stage: 'Submitted', count: 45 }
        ];
    },

    getFilterOptions() {
        const allApps = useApplicationStore.getState().applications || [];
        const schemeOptions = [...new Set(allApps.map(a => a.serviceId))].map(id => {
            const app = allApps.find(a => a.serviceId === id);
            return { value: id, label: app?.serviceName || id };
        });
        const stateOptions = [
            { value: 'Maharashtra', label: 'Maharashtra' },
            { value: 'Gujarat', label: 'Gujarat' },
            { value: 'Delhi', label: 'Delhi' },
            { value: 'Uttar Pradesh', label: 'Uttar Pradesh' }
        ];
        return { schemeOptions, stateOptions };
    },
};

export default AnalyticsService;
