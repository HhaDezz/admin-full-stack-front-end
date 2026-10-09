import type { ReactNode } from 'react';
import { Spinner } from './Spinner';
import type { Tone } from './types';
import { cx } from './utils';

/* ── Timeline: events in order, for activity, history, order tracking and changelogs ── */

export interface TimelineItem {
  id: string | number;
  title: ReactNode;
  description?: ReactNode;
  /** Shown beside the title; a Date or ISO string is also put in a <time> element. */
  time?: ReactNode;
  /** Machine-readable time for the <time> element (ISO 8601). */
  dateTime?: string;
  /** A small icon in the dot; without one the dot is plain. */
  icon?: ReactNode;
  tone?: Tone;
  /** Anything under the description: a card, a quote, attachments. */
  content?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  /**
   * default: title, time and description stacked.
   * compact: one line per event with the time at the end (activity logs).
   */
  variant?: 'default' | 'compact';
  /** alternate puts the time on the other side of the line on wide screens (changelogs, histories). */
  align?: 'start' | 'alternate';
  /** A last, in-progress step with a spinner (e.g. "Waiting for approval"). */
  pending?: ReactNode;
  /** Newest first or oldest first is up to you; this only names the list. */
  'aria-label'?: string;
  className?: string;
}

export function Timeline({ items, variant = 'default', align = 'start', pending, 'aria-label': label, className }: TimelineProps) {
  return (
    <ol className={cx('tk', `tk-${variant}`, align === 'alternate' && 'tk-alternate', className)} aria-label={label}>
      {items.map((it) => (
        <li key={it.id} className={cx('tk-item', it.tone && `tone-${it.tone}`)}>
          <span className={cx('tk-dot', !!it.icon && 'has-icon')} aria-hidden="true">
            {it.icon}
          </span>
          {align === 'alternate' && it.time != null && (
            <span className="tk-side">
              <Time item={it} />
            </span>
          )}
          <div className="tk-body">
            <div className="tk-head">
              <span className="tk-title">{it.title}</span>
              {align !== 'alternate' && it.time != null && <Time item={it} />}
            </div>
            {it.description && <div className="tk-desc">{it.description}</div>}
            {it.content && <div className="tk-content">{it.content}</div>}
          </div>
        </li>
      ))}
      {pending && (
        <li className="tk-item is-pending">
          <span className="tk-dot has-icon" aria-hidden="true">
            <Spinner size={14} label="" />
          </span>
          <div className="tk-body">
            <div className="tk-head">
              <span className="tk-title">{pending}</span>
            </div>
          </div>
        </li>
      )}
    </ol>
  );
}

function Time({ item }: { item: TimelineItem }) {
  return item.dateTime ? (
    <time className="tk-time" dateTime={item.dateTime}>
      {item.time}
    </time>
  ) : (
    <span className="tk-time">{item.time}</span>
  );
}
