import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPageNumbers } from '@/lib/pagination';

/**
 * Reusable Pagination component
 * @param {{ page, totalPages, totalItems, limit, onPageChange, onLimitChange }} props
 */
const Pagination = ({ page, totalPages, totalItems, limit, onPageChange, onLimitChange }) => {
    if (totalPages <= 1 && !onLimitChange) return null;

    const pageNumbers = getPageNumbers(page, totalPages);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t mt-4">
            {/* Info + Page Size */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                    Showing {Math.min((page - 1) * limit + 1, totalItems)}–{Math.min(page * limit, totalItems)} of {totalItems}
                </span>
                {onLimitChange && (
                    <select
                        value={limit}
                        onChange={e => onLimitChange(Number(e.target.value))}
                        className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value={10}>10 / page</option>
                        <option value={25}>25 / page</option>
                        <option value={50}>50 / page</option>
                    </select>
                )}
            </div>

            {/* Page Numbers */}
            {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {pageNumbers.map((p, i) => (
                        p === '...' ? (
                            <span key={`dot-${i}`} className="h-8 w-8 flex items-center justify-center text-xs text-muted-foreground">…</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors
                                    ${p === page
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'border hover:bg-muted'
                                    }`}
                            >
                                {p}
                            </button>
                        )
                    ))}

                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
                        aria-label="Next page"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Pagination;
