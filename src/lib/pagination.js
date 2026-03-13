/**
 * Pagination utility — pure function, no side effects
 */

/**
 * Paginate an array of data items.
 * @param {Array} data - Full dataset
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page (default 10)
 * @returns {{ items: Array, page: number, limit: number, totalItems: number, totalPages: number }}
 */
export function paginate(data = [], page = 1, limit = 10) {
    const totalItems = data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.max(1, Math.min(page, totalPages));
    const start = (safePage - 1) * limit;
    const items = data.slice(start, start + limit);

    return {
        items,
        page: safePage,
        limit,
        totalItems,
        totalPages,
    };
}

/**
 * Generate page number array for pagination UI.
 * Shows at most 5 pages around current page.
 */
export function getPageNumbers(currentPage, totalPages) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
        start = 2;
        end = 4;
    } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
    }

    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');

    pages.push(totalPages);
    return pages;
}
