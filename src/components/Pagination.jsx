import React from 'react';
import { cn } from '../utils/cn';

/**
 * Page number strip with ellipsis for large page counts.
 * @param {number} currentPage - 1-based
 * @param {number} totalPages
 * @param {number} maxPagesToShow - max numeric page buttons (excluding prev/next)
 */
const getPageNumbers = (currentPage, totalPages, maxPagesToShow) => {
  const pages = [];

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  pages.push(1);

  if (currentPage > 3) {
    pages.push('ellipsis-start');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis-end');
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  variant = 'default',
  /** Max page number buttons when totalPages is large */
  maxPagesToShow = 7,
}) => {
  const pages = getPageNumbers(currentPage, totalPages, maxPagesToShow);

  const navBtn =
    variant === 'admin'
      ? 'px-3 py-2 border border-border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors'
      : 'px-3 py-1 rounded border hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed';

  const pageBtn = (isActive) =>
    cn(
      variant === 'admin'
        ? 'min-w-[2.5rem] px-3 py-2 border rounded-lg text-sm font-medium transition-colors'
        : 'min-w-[2.25rem] px-3 py-1 rounded border',
      isActive
        ? variant === 'admin'
          ? 'bg-primary text-white border-primary'
          : 'bg-primary text-white'
        : variant === 'admin'
          ? 'border-border hover:bg-slate-50'
          : 'hover:bg-gray-50',
      variant === 'admin' && !isActive ? 'text-dark' : ''
    );

  const ellipsisClass =
    variant === 'admin'
      ? 'px-2 py-2 text-sm text-text select-none'
      : 'px-2 py-1 cursor-default text-gray-500';

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-2',
        className
      )}
      role="navigation"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={navBtn}
        aria-label="Previous page"
      >
        ← Previous
      </button>

      {pages.map((item) => {
        if (item === 'ellipsis-start' || item === 'ellipsis-end') {
          return (
            <span
              key={item}
              className={ellipsisClass}
              aria-hidden
            >
              …
            </span>
          );
        }

        const isActive = item === currentPage;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={pageBtn(isActive)}
            aria-label={`Page ${item}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={navBtn}
        aria-label="Next page"
      >
        Next →
      </button>

      <span className="text-sm text-text whitespace-nowrap ml-1">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
};

export default Pagination;
