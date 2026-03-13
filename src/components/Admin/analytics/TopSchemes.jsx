import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { paginate } from '@/lib/pagination';
import Pagination from '@/components/Pagination';

const columns = [
    { key: 'name', label: 'Scheme Name', sortable: true },
    { key: 'totalApplications', label: 'Applications', sortable: true },
    { key: 'approvalRate', label: 'Approval %', sortable: true },
    { key: 'rejectionRate', label: 'Rejection %', sortable: true },
    { key: 'avgProcessingDays', label: 'Avg Days', sortable: true },
];

const TopSchemes = ({ data }) => {
    const [sortKey, setSortKey] = useState('totalApplications');
    const [sortDir, setSortDir] = useState('desc');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const sorted = useMemo(() => {
        if (!data) return [];
        return [...data].sort((a, b) => {
            const av = a[sortKey] ?? 0;
            const bv = b[sortKey] ?? 0;
            if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
            return sortDir === 'asc' ? av - bv : bv - av;
        });
    }, [data, sortKey, sortDir]);

    const { items: pageItems, ...pagination } = paginate(sorted, page, pageSize);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
        setPage(1);
    };

    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border bg-card shadow-sm p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Schemes</h3>
                <p className="text-muted-foreground text-sm">No scheme data available</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card shadow-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Schemes</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className={`py-3 px-4 text-left font-medium text-muted-foreground ${col.sortable ? 'cursor-pointer hover:text-foreground select-none' : ''}`}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && sortKey === col.key && (
                                            sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pageItems.map((scheme, idx) => (
                            <tr key={scheme.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-4 font-medium text-foreground max-w-[220px] truncate">{scheme.name}</td>
                                <td className="py-3 px-4">{scheme.totalApplications}</td>
                                <td className="py-3 px-4">
                                    <span className="text-green-600 font-medium">{scheme.approvalRate}%</span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="text-red-600 font-medium">{scheme.rejectionRate}%</span>
                                </td>
                                <td className="py-3 px-4">
                                    {scheme.avgProcessingDays !== null ? `${scheme.avgProcessingDays}d` : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {pagination.totalPages > 1 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={page}
                        totalPages={pagination.totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
};

export default TopSchemes;
