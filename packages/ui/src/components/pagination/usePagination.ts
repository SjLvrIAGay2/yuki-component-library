import { useState } from 'react';

export interface PageStateProps {
  /** Total rows. Alternatively, supply totalPages when only the page count is known. */
  total?: number;
  totalPages?: number;
  /** One-based current page. */
  page?: number;
  defaultPage?: number;
  pageSize?: number;
  defaultPageSize?: number;
  /** Fires once for either a page or page-size change, with the effective pair. */
  onChange?: (page: number, pageSize: number) => void;
}

export const integer = (value: number | undefined, fallback: number, max = Number.MAX_SAFE_INTEGER) =>
  value !== undefined && Number.isFinite(value) ? Math.min(max, Math.max(0, Math.floor(value))) : fallback;

export function usePagination(config: PageStateProps) {
  const [internalPage, setPage] = useState(config.defaultPage ?? 1);
  const [internalSize, setSize] = useState(config.defaultPageSize ?? 10);
  const pageSize = Math.max(1, integer(config.pageSize ?? internalSize, 10));
  const total = integer(config.total, integer(config.totalPages, 0) * pageSize);
  const pagesAtSize = (size: number) => Math.max(1, integer(config.totalPages, Math.ceil(total / size)));
  const totalPages = pagesAtSize(pageSize);
  const page = Math.max(1, integer(config.page ?? internalPage, 1, totalPages));

  function changePage(requestedPage: number, nextSize = pageSize) {
    const nextPage = Math.max(1, integer(requestedPage, page, pagesAtSize(nextSize)));
    if (nextPage === page && nextSize === pageSize) return;
    if (config.page === undefined) setPage(nextPage);
    if (config.pageSize === undefined) setSize(nextSize);
    config.onChange?.(nextPage, nextSize);
  }

  return { total, pageSize, totalPages, page, changePage };
}
