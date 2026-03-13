/**
 * analyticsStore — Zustand store for analytics filters + computed data.
 * Filters persist across navigation. Data recomputed on filter change.
 */

import { create } from 'zustand';
import AnalyticsService, { parseDatePreset } from '@/services/analyticsService';

export const useAnalyticsStore = create((set, get) => ({
    // ── Filter state ──
    filters: {
        datePreset: 'all',   // '7d' | '30d' | '6m' | 'all' | 'custom'
        dateFrom: null,
        dateTo: null,
        scheme: '',
        state: '',
        status: '',
    },

    // ── Computed analytics data (recalculated on demand) ──
    kpiSummary: null,
    applicationTrends: [],
    statusDistribution: [],
    topSchemes: [],
    stateDistribution: [],
    processingStats: null,
    dropOffStats: null,
    filterOptions: null,
    isLoading: false,

    // ── Set a single filter and recompute ──
    setFilter: (key, value) => {
        const filters = { ...get().filters, [key]: value };

        // If changing date preset, auto-resolve dateFrom/dateTo
        if (key === 'datePreset' && value !== 'custom') {
            const { dateFrom, dateTo } = parseDatePreset(value);
            filters.dateFrom = dateFrom;
            filters.dateTo = dateTo;
        }

        set({ filters });
        get().recompute();
    },

    // ── Set custom date range ──
    setCustomDateRange: (dateFrom, dateTo) => {
        set({
            filters: {
                ...get().filters,
                datePreset: 'custom',
                dateFrom,
                dateTo,
            },
        });
        get().recompute();
    },

    // ── Reset all filters ──
    resetFilters: () => {
        set({
            filters: {
                datePreset: 'all',
                dateFrom: null,
                dateTo: null,
                scheme: '',
                state: '',
                status: '',
            },
        });
        get().recompute();
    },

    // ── Recompute all analytics from current filters ──
    recompute: () => {
        set({ isLoading: true });
        const { filters } = get();

        // Build the filter object for the service
        const serviceFilters = {
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            scheme: filters.scheme || undefined,
            state: filters.state || undefined,
            status: filters.status || undefined,
        };

        const kpiSummary = AnalyticsService.getKpiSummary(serviceFilters);
        const applicationTrends = AnalyticsService.getApplicationTrends(serviceFilters);
        const statusDistribution = AnalyticsService.getStatusDistribution(serviceFilters);
        const topSchemes = AnalyticsService.getTopSchemes(serviceFilters);
        const stateDistribution = AnalyticsService.getStateDistribution(serviceFilters);
        const processingStats = AnalyticsService.getProcessingStats(serviceFilters);
        const dropOffStats = AnalyticsService.getDropOffStats(serviceFilters);
        const filterOptions = AnalyticsService.getFilterOptions();

        set({
            kpiSummary,
            applicationTrends,
            statusDistribution,
            topSchemes,
            stateDistribution,
            processingStats,
            dropOffStats,
            filterOptions,
            isLoading: false,
        });
    },

    // ── Initial load ──
    loadAnalytics: () => {
        get().recompute();
    },
}));
