import { useMemo, useState, type ReactElement, type ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { Bell, BellOff, Check, CheckCheck, X } from 'lucide-react';
import { relativeTime } from '../../lib/format';
import { duration, easing, useShouldReduceMotion } from '../../lib/motion';
import { Popover } from './Popover';
import { cx } from './utils';

/* ── NotificationCenter: a bell with a count that opens a panel of notifications ── */

export type NotificationTone = 'neutral' | 'brand' | 'ok' | 'warn' | 'danger' | 'info';

export interface NotificationItem {
  id: string;
  title: ReactNode;
  /** Second line. */
  body?: ReactNode;
  /** ISO date-time. */
  at: string;
  read?: boolean;
  icon?: ReactNode;
  tone?: NotificationTone;
  /** Buttons under the text, e.g. Accept / Decline. */
  actions?: ReactNode;
}

export interface NotificationCenterProps {
  items: NotificationItem[];
  onItemClick?: (item: NotificationItem) => void;
  /** Mark one read or unread. */
  onRead?: (id: string, read: boolean) => void;
  onReadAll?: () => void;
  onDismiss?: (id: string) => void;
  /** Footer links, e.g. "See all" and "Settings". */
  footer?: ReactNode;
  title?: string;
  /** Panel width in px. */
  width?: number;
  loading?: boolean;
  /** Replace the bell button (it still gets the count). */
  trigger?: (unread: number) => ReactElement;
  className?: string;
}

const TONE: Record<NotificationTone, string> = {
  neutral: '',
  brand: 'tone-green',
  ok: 'tone-green',
  warn: 'tone-gold',
  danger: 'tone-red',
  info: 'tone-blue',
};
const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

export function NotificationCenter({
  items,
  onItemClick,
  onRead,
  onReadAll,
  onDismiss,
  footer,
  title = 'Notifications',
  width = 380,
  loading,
  trigger,
  className,
}: NotificationCenterProps) {
  const unread = items.filter((i) => !i.read).length;
  return (
    <Popover
      label={title}
      align="end"
      width={width}
      className={cx('nc-pop', className)}
      trigger={
        trigger?.(unread) ?? (
          <button type="button" className="btn btn-ghost btn-icon bell-btn" aria-label={unread ? `${title}, ${unread} unread` : title}>
            <Bell size={18} />
            {unread > 0 && (
              <span className="bell-count" aria-hidden="true">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        )
      }
    >
      {(close) => (
        <NotificationPanel
          items={items}
          title={title}
          loading={loading}
          footer={footer}
          onRead={onRead}
          onReadAll={onReadAll}
          onDismiss={onDismiss}
          onItemClick={(it) => {
            onItemClick?.(it);
            close();
          }}
        />
      )}
    </Popover>
  );
}

/** The panel on its own, for a page or a drawer. */
export function NotificationPanel({
  items,
  title = 'Notifications',
  loading,
  footer,
  onRead,
  onReadAll,
  onDismiss,
  onItemClick,
}: Omit<NotificationCenterProps, 'width' | 'trigger' | 'className'>) {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const reduce = useShouldReduceMotion();
  const unread = items.filter((i) => !i.read).length;
  const shown = tab === 'unread' ? items.filter((i) => !i.read) : items;
  const groups = useMemo(() => {
    const sorted = [...shown].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
    return [
      { label: 'Today', list: sorted.filter((i) => isToday(i.at)) },
      { label: 'Earlier', list: sorted.filter((i) => !isToday(i.at)) },
    ].filter((g) => g.list.length);
  }, [shown]);

  return (
    <div className="nc">
      <div className="nc-head">
        <h3>{title}</h3>
        {onReadAll && (
          <button type="button" className="link link-sm" disabled={!unread} onClick={onReadAll}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>
      <div className="nc-tabs" role="group" aria-label="Show">
        {(['all', 'unread'] as const).map((t) => (
          <button key={t} type="button" className={cx('nc-tab', tab === t && 'is-on')} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t === 'all' ? 'All' : 'Unread'}
            {t === 'unread' && unread > 0 && <span className="nc-num">{unread}</span>}
          </button>
        ))}
      </div>
      <div className="nc-body">
        {loading ? (
          <div className="nc-loading">
            <span className="skeleton" style={{ height: 48 }} />
            <span className="skeleton" style={{ height: 48 }} />
            <span className="skeleton" style={{ height: 48 }} />
          </div>
        ) : groups.length === 0 ? (
          <div className="bell-empty">
            <BellOff size={20} aria-hidden="true" />
            <span>{tab === 'unread' ? 'No unread notifications.' : 'You’re all caught up.'}</span>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.label} className="nc-group" aria-label={g.label}>
              <h4 className="nc-group-label">{g.label}</h4>
              <ul className="nc-list">
                <AnimatePresence initial={false}>
                  {g.list.map((n) => (
                    <m.li
                      key={n.id}
                      layout={!reduce}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0, transition: { duration: duration.base, ease: easing.exit } }}
                      className={cx('nc-item', !n.read && 'is-unread')}
                    >
                      <span className={cx('notif-ico', TONE[n.tone ?? 'neutral'])} aria-hidden="true">
                        {n.icon ?? <Bell size={16} />}
                      </span>
                      <div className="nc-text">
                        {onItemClick ? (
                          <button type="button" className="nc-title" onClick={() => onItemClick(n)}>
                            {!n.read && <span className="sr-only">Unread: </span>}
                            {n.title}
                          </button>
                        ) : (
                          <span className="nc-title">
                            {!n.read && <span className="sr-only">Unread: </span>}
                            {n.title}
                          </span>
                        )}
                        {n.body && <span className="nc-sub">{n.body}</span>}
                        <time className="notif-time" dateTime={n.at}>
                          {relativeTime(n.at)}
                        </time>
                        {n.actions && <div className="nc-actions">{n.actions}</div>}
                      </div>
                      <span className="nc-tools">
                        {onRead && (
                          <button
                            type="button"
                            className="nc-tool"
                            aria-label={n.read ? 'Mark as unread' : 'Mark as read'}
                            title={n.read ? 'Mark as unread' : 'Mark as read'}
                            onClick={() => onRead(n.id, !n.read)}
                          >
                            {n.read ? <span className="nc-dot-ring" /> : <Check size={14} />}
                          </button>
                        )}
                        {onDismiss && (
                          <button type="button" className="nc-tool" aria-label="Dismiss" title="Dismiss" onClick={() => onDismiss(n.id)}>
                            <X size={14} />
                          </button>
                        )}
                      </span>
                    </m.li>
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          ))
        )}
      </div>
      {footer && <div className="bell-foot">{footer}</div>}
    </div>
  );
}
