import { Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalyticsStore } from '@/stores/analyticsStore';

const DATE_PRESETS = [
    { value: 'all', label: 'All Time' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '6m', label: '6 Months' },
];

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

const FilterPanel = () => {
    const { filters, setFilter, resetFilters, filterOptions } = useAnalyticsStore();

    return (
        <div className="rounded-xl border bg-card shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Filter className="h-4 w-4" />
                    Filters
                </div>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 text-xs h-7">
                    <RotateCcw className="h-3 w-3" />
                    Reset
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Date Range */}
                <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Date Range</label>
                    <select
                        value={filters.datePreset}
                        onChange={e => setFilter('datePreset', e.target.value)}
                        className="w-full h-9 px-3 text-sm rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        {DATE_PRESETS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>

                {/* Scheme */}
                <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Scheme</label>
                    <select
                        value={filters.scheme}
                        onChange={e => setFilter('scheme', e.target.value)}
                        className="w-full h-9 px-3 text-sm rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All Schemes</option>
                        {filterOptions?.schemeOptions?.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>

                {/* State */}
                <div>
                    <label className="text-xs text-muted-foreground mb-1 block">State</label>
                    <select
                        value={filters.state}
                        onChange={e => setFilter('state', e.target.value)}
                        className="w-full h-9 px-3 text-sm rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All States</option>
                        {filterOptions?.stateOptions?.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>

                {/* Status */}
                <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                    <select
                        value={filters.status}
                        onChange={e => setFilter('status', e.target.value)}
                        className="w-full h-9 px-3 text-sm rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
