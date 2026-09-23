import type { ReactNode } from 'react';
import { cx } from './utils';

/* ── DescriptionList: label / value pairs ── */

export interface DescriptionItem {
  term: ReactNode;
  details: ReactNode;
  /** Span every column (long text). */
  full?: boolean;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /** Columns on wide screens; always one on phones. */
  columns?: 1 | 2 | 3;
  /** Term beside the value, or above it. */
  layout?: 'stacked' | 'inline';
  bordered?: boolean;
}

export function DescriptionList({ items, columns = 2, layout = 'stacked', bordered }: DescriptionListProps) {
  return (
    <dl className={cx('dlist', `cols-${columns}`, `is-${layout}`, bordered && 'is-bordered')}>
      {items.map((it, i) => (
        <div key={i} className={cx('dlist-row', it.full && 'is-full')}>
          <dt>{it.term}</dt>
          <dd>{it.details ?? <span className="muted">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}
