import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchSelect } from '../search-select';

function pageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  pages.forEach((p, i) => {
    if (i && p - pages[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

export function Pagination({
  page,
  pages,
  total,
  pageSize,
  pageSizes,
  onPage,
  onPageSize,
  label,
}: {
  label?: string;
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  pageSizes: number[];
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
}) {
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="pager">
      <div className="pager-info">
        <span>
          {from}–{to} of {total}
        </span>
        <span className="pager-size">
          Rows
          <SearchSelect
            aria-label="Rows per page"
            size="sm"
            searchable={false}
            minWidth={84}
            value={pageSize}
            onChange={(v) => v != null && onPageSize(v)}
            options={pageSizes.map((n) => ({ value: n, label: String(n) }))}
          />
        </span>
      </div>
      <nav className="btns" aria-label={label ? `${label} pages` : 'Pagination'}>
        <button className="btn btn-sm btn-icon" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        {pageList(page, pages).map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="pager-gap">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`btn btn-sm btn-icon page-btn ${p === page ? 'is-current' : ''}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onPage(p)}
            >
              {p}
            </button>
          ),
        )}
        <button className="btn btn-sm btn-icon" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
