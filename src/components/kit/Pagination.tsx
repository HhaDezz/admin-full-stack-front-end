import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cx } from './utils';

/* ── Pagination ── */

/** Page numbers to show, with '…' gaps: 1 … 4 5 6 … 20. */
export function pageList(current: number, total: number, siblings = 1): (number | '…')[] {
  if (total <= 5 + siblings * 2) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total]);
  for (let p = current - siblings; p <= current + siblings; p++) set.add(p);
  const pages = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  pages.forEach((p, i) => {
    if (i && p - pages[i - 1] === 2) out.push(p - 1);
    else if (i && p - pages[i - 1] > 2) out.push('…');
    out.push(p);
  });
  return out;
}

export interface PaginationProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
  siblings?: number;
  /** First / last buttons. */
  showEdges?: boolean;
  size?: 'sm' | 'md';
  /** "Page 3 of 12" text instead of numbers (compact). */
  simple?: boolean;
  /** Default "Pagination"; name it after what it pages when there are several. */
  'aria-label'?: string;
}

export function Pagination({
  page,
  pages,
  onChange,
  siblings = 1,
  showEdges,
  size = 'sm',
  simple,
  'aria-label': label = 'Pagination',
}: PaginationProps) {
  const btn = cx('btn', 'btn-icon', size === 'sm' && 'btn-sm');
  const go = (p: number) => p >= 1 && p <= pages && p !== page && onChange(p);
  return (
    <nav className="pagination" aria-label={label}>
      {showEdges && (
        <button className={btn} disabled={page <= 1} onClick={() => go(1)} aria-label="First page">
          <ChevronsLeft size={16} className="flip-rtl" />
        </button>
      )}
      <button className={btn} disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Previous page">
        <ChevronLeft size={16} className="flip-rtl" />
      </button>
      {simple ? (
        <span className="pagination-simple" aria-live="polite">
          Page <b>{page}</b> of {pages}
        </span>
      ) : (
        pageList(page, pages, siblings).map((p, i) =>
          p === '…' ? (
            <span key={`g${i}`} className="pager-gap" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              className={cx(btn, 'page-btn', p === page && 'is-current')}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p}`}
              onClick={() => go(p)}
            >
              {p}
            </button>
          ),
        )
      )}
      <button className={btn} disabled={page >= pages} onClick={() => go(page + 1)} aria-label="Next page">
        <ChevronRight size={16} className="flip-rtl" />
      </button>
      {showEdges && (
        <button className={btn} disabled={page >= pages} onClick={() => go(pages)} aria-label="Last page">
          <ChevronsRight size={16} className="flip-rtl" />
        </button>
      )}
    </nav>
  );
}
