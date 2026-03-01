/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { useEffect, useState } from 'react'
import { Pagination } from 'react-bootstrap'

export const PAGE_SIZE = 5

export function usePagination<T>(data: T[], resetKey?: unknown) {
  const [page, setPage] = useState(1)

  // reset to page 1 when data or resetKey changes
  useEffect(() => { setPage(1) }, [resetKey])
  useEffect(() => { setPage(1) }, [data.length])

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const pageData   = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const show       = data.length > PAGE_SIZE

  return { page, setPage, totalPages, pageData, show }
}

export function PageBar({
  page,
  total,
  onChange,
}: {
  page: number
  total: number
  onChange: (p: number) => void
}) {
  if (total <= 1) return null

  // Build visible page numbers with ellipsis
  function pages(): (number | '…')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const result: (number | '…')[] = [1]
    if (page > 3) result.push('…')
    for (let p = Math.max(2, page - 1); p <= Math.min(total - 1, page + 1); p++) result.push(p)
    if (page < total - 2) result.push('…')
    result.push(total)
    return result
  }

  return (
    <div className="d-flex justify-content-center align-items-center gap-2 py-2 border-top">
      <Pagination size="sm" className="mb-0">
        <Pagination.Prev disabled={page === 1} onClick={() => onChange(page - 1)} />
        {pages().map((p, i) =>
          p === '…'
            ? <Pagination.Ellipsis key={`e${i}`} disabled />
            : <Pagination.Item key={p} active={p === page} onClick={() => onChange(p as number)}>{p}</Pagination.Item>
        )}
        <Pagination.Next disabled={page === total} onClick={() => onChange(page + 1)} />
      </Pagination>
      <span className="text-muted small">Page {page} / {total}</span>
    </div>
  )
}
