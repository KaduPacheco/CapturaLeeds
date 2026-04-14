export type LeadPageSize = 10 | 25 | 50;

export function paginateCollection<T>(items: T[], page: number, pageSize: number) {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / safePageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * safePageSize;
  const endIndex = startIndex + safePageSize;

  return {
    currentPage,
    pageSize: safePageSize,
    totalItems: items.length,
    totalPages,
    startIndex,
    endIndex: Math.min(endIndex, items.length),
    items: items.slice(startIndex, endIndex),
  };
}
