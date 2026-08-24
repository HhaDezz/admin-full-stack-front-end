import { type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { cx } from './utils';

/* ── Breadcrumbs ── */

export interface Crumb {
  label: ReactNode;
  /** Route path. The last crumb is the current page and isn't a link. */
  to?: string;
  icon?: ReactNode;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  /** Collapse the middle crumbs into "…" beyond this many (default 4). */
  maxItems?: number;
  separator?: ReactNode;
  /** Default "Breadcrumb". */
  'aria-label'?: string;
}

export function Breadcrumbs({ items, maxItems = 4, separator, 'aria-label': label = 'Breadcrumb' }: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false);
  const collapse = !expanded && items.length > maxItems;
  const shown: (Crumb | 'more')[] = collapse ? [items[0], 'more', ...items.slice(items.length - (maxItems - 2))] : items;
  const sep = separator ?? <ChevronRight size={14} />;
  return (
    <nav aria-label={label} className="crumbs">
      <ol>
        {shown.map((c, i) => {
          const last = i === shown.length - 1;
          return (
            <li key={i}>
              {c === 'more' ? (
                <button
                  type="button"
                  className="crumb-more"
                  aria-label={`Show ${items.length - maxItems + 1} more`}
                  onClick={() => setExpanded(true)}
                >
                  <MoreHorizontal size={15} />
                </button>
              ) : last || !c.to ? (
                <span className={cx('crumb', last && 'is-current')} aria-current={last ? 'page' : undefined}>
                  {c.icon}
                  {c.label}
                </span>
              ) : (
                <Link to={c.to} className="crumb">
                  {c.icon}
                  {c.label}
                </Link>
              )}
              {!last && (
                <span className="crumb-sep" aria-hidden="true">
                  {sep}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
