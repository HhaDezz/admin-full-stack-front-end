import { Link, useNavigate } from 'react-router-dom';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { notificationLook } from '../lib/activityMeta';
import { relativeTime } from '../lib/format';
import { useNotifications, useUnreadCount } from '../lib/queries';
import { useNotificationActions } from '../lib/notificationActions';
import { Popover, Skeleton } from './kit';

/** The bell in the top bar: unread count, the latest few, mark all read. */
export function NotificationBell() {
  const unread = useUnreadCount().data ?? 0;
  return (
    <Popover
      label="Notifications"
      align="end"
      width={360}
      className="bell-pop"
      trigger={
        <button
          type="button"
          className="btn btn-ghost btn-icon bell-btn"
          aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="bell-count" aria-hidden="true">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      }
    >
      {(close) => <Panel close={close} unread={unread} />}
    </Popover>
  );
}

function Panel({ close, unread }: { close: () => void; unread: number }) {
  const list = useNotifications(false, 6);
  const { mutateRead, readAll } = useNotificationActions();
  const navigate = useNavigate();
  const items = list.data?.items ?? [];
  return (
    <div className="bell-panel">
      <div className="bell-head">
        <h3>Notifications</h3>
        <button type="button" className="link link-sm" disabled={!unread || readAll.isPending} onClick={() => readAll.mutate()}>
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>
      {list.isLoading ? (
        <div className="bell-loading">
          <Skeleton h={44} />
          <Skeleton h={44} />
        </div>
      ) : items.length === 0 ? (
        <div className="bell-empty">
          <BellOff size={20} />
          <span>You’re all caught up.</span>
        </div>
      ) : (
        <ul className="bell-list">
          {items.map((n) => {
            const look = notificationLook(n);
            return (
              <li key={n.id}>
                <button
                  type="button"
                  className={`bell-item ${n.read ? '' : 'is-unread'}`}
                  onClick={() => {
                    if (!n.read) mutateRead.mutate({ id: n.id, read: true });
                    close();
                    if (n.link) navigate(n.link);
                  }}
                >
                  <span className={`notif-ico tone-${look.tone}`} aria-hidden="true">
                    {look.icon}
                  </span>
                  <span className="notif-text">
                    <span className="notif-title">
                      {!n.read && <span className="sr-only">Unread: </span>}
                      {n.title}
                    </span>
                    <span className="notif-time">{relativeTime(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="bell-foot">
        <Link to="/notifications" onClick={close}>
          See all notifications
        </Link>
        <Link to="/settings/notifications" onClick={close} className="muted">
          Settings
        </Link>
      </div>
    </div>
  );
}
