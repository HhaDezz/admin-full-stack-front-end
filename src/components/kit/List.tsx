import type { ReactNode } from 'react';
import { cx } from './utils';

/* ── List: rows with a leading visual, text, meta and actions ── */

export interface ListItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** Icon, avatar or image at the start. */
  leading?: ReactNode;
  /** Small text or a badge at the end (time, status). */
  meta?: ReactNode;
  /** Buttons at the end; they stay clickable inside an interactive row. */
  actions?: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  selected?: boolean;
}

export interface ListProps {
  items: ListItem[];
  variant?: 'divided' | 'cards' | 'plain';
  size?: 'sm' | 'md';
  'aria-label'?: string;
  /** Shown when items is empty. */
  empty?: ReactNode;
}

export function List({ items, variant = 'divided', size = 'md', 'aria-label': label, empty }: ListProps) {
  if (!items.length && empty) return <>{empty}</>;
  return (
    <ul className={cx('list', `is-${variant}`, `list-${size}`)} aria-label={label}>
      {items.map((it) => {
        const inner = (
          <>
            {it.leading && <span className="list-lead">{it.leading}</span>}
            <span className="list-text">
              <span className="list-title">{it.title}</span>
              {it.description && <span className="list-desc">{it.description}</span>}
            </span>
            {it.meta && <span className="list-meta">{it.meta}</span>}
          </>
        );
        const cls = cx('list-main', (it.onClick || it.href) && 'is-interactive');
        return (
          <li
            key={it.id}
            className={cx('list-item', it.selected && 'is-selected', it.disabled && 'is-disabled')}
            aria-current={it.selected || undefined}
          >
            {it.href ? (
              <a className={cls} href={it.disabled ? undefined : it.href} aria-disabled={it.disabled || undefined}>
                {inner}
              </a>
            ) : it.onClick ? (
              <button type="button" className={cls} onClick={it.onClick} disabled={it.disabled}>
                {inner}
              </button>
            ) : (
              <div className={cls}>{inner}</div>
            )}
            {it.actions && <span className="list-actions">{it.actions}</span>}
          </li>
        );
      })}
    </ul>
  );
}
