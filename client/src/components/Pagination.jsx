import React from "react";

/**
 * Reusable Pagination Component
 *
 * @param {Object} props
 * @param {number} props.currentPage - Current active page (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {function} props.onPageChange - Callback when page changes: (pageNumber) => void
 * @param {number} [props.totalItems] - Total count of items
 * @param {number} [props.limit] - Number of items per page
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  limit,
}) {
  if (totalPages <= 1) {
    return null;
  }

  // Calculate start and end indices for display
  const startItem = limit ? (currentPage - 1) * limit + 1 : null;
  const endItem = limit && totalItems ? Math.min(currentPage * limit, totalItems) : null;

  // Build page numbers with ellipsis windowing
  const getPageNumbers = () => {
    const delta = 1; // Number of pages to show around current
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "dots-left");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("dots-right", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-slate-200/80 dark:border-slate-800 mt-10"
    >
      {/* Information text */}
      <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
        {totalItems !== undefined && startItem !== null && endItem !== null ? (
          <span>
            Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{startItem}</span> to{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{endItem}</span> of{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{totalItems}</span> articles
          </span>
        ) : (
          <span>
            Page <span className="font-semibold text-slate-900 dark:text-slate-100">{currentPage}</span> of{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{totalPages}</span>
          </span>
        )}
      </div>

      {/* Page navigation controls */}
      <ul className="inline-flex items-center gap-1.5 list-none m-0 p-0">
        {/* Previous Button */}
        <li>
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Go to previous page"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Prev</span>
          </button>
        </li>

        {/* Numbered Page Buttons */}
        {pages.map((item, index) => {
          if (typeof item === "string") {
            return (
              <li key={`dots-${index}`}>
                <span className="px-2 py-1.5 text-xs text-slate-400 dark:text-slate-500 font-bold select-none">
                  •••
                </span>
              </li>
            );
          }

          const isActive = item === currentPage;

          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Go to page ${item}`}
                className={`min-w-9 h-9 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center ${
                  isActive
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 ring-2 ring-indigo-600/20"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {item}
              </button>
            </li>
          );
        })}

        {/* Next Button */}
        <li>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Go to next page"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
          >
            <span className="hidden sm:inline">Next</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
}
