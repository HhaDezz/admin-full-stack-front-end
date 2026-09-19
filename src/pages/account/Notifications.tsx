import './account.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOff, CheckCheck, Circle, CircleDot, Settings2, Trash2 } from 'lucide-react';
import { Button, Card, EmptyState, IconButton, PageHeader, Skeleton, Tabs } from '../../components/kit';
import { groupByDay, notificationLook } from '../../lib/activityMeta';
import { useNotificationActions } from '../../lib/notificationActions';
import { relativeTime } from '../../lib/format';
import { useNotifications } from '../../lib/queries';
import type { AppNotification } from '../../lib/types';

/** The notification centre: everything the bell has shown, filterable, with read state. */
export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [size, setSize] = useState(20);
  const page = useNotifications(filter === 'unread', size);
  const navigate = useNavigate();
  const { mutateRead, mutateDelete, readAll } = useNotificationActions();
  const items = page.data?.items ?? [];

  const open = (n: AppNotification) => {
    if (!n.read) mutateRead.mutate({ id: n.id, read: true });
    if (n.link) navigate(n.link);
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Security alerts, changes to your account and news. Choose what you get in Settings."
        actions={
          <>
            <Button iconStart={<Settings2 size={15} />} onClick={() => navigate('/settings/notifications')}>
              Settings
            </Button>
            <Button
              variant="primary"
              iconStart={<CheckCheck size={15} />}
              disabled={!page.data?.unreadCount}
              loading={readAll.isPending}
              onClick={() => readAll.mutate()}
            >
              Mark all as read
            </Button>
          </>
        }
      />
      <Tabs
        variant="pill"
        aria-label="Show"
        value={filter}
        onChange={(v) => {
          setFilter(v);
          setSize(20);
        }}
        items={[
          { value: 'all', label: 'All' },
          { value: 'unread', label: 'Unread', badge: page.data?.unreadCount || undefined },
        ]}
      />
      <div className="notif-page">
        {page.isLoading ? (
          <Card padding="lg">
            <Skeleton h={56} />
            <Skeleton h={56} />
            <Skeleton h={56} />
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <EmptyState
              icon={<BellOff size={22} />}
              title={filter === 'unread' ? 'You’re all caught up' : 'No notifications yet'}
              description={
                filter === 'unread'
                  ? 'Nothing unread. New alerts appear here and on the bell.'
                  : 'Security alerts and account changes will appear here.'
              }
            />
          </Card>
        ) : (
          groupByDay(items, (n) => n.createdAt).map(([day, list]) => (
            <section key={day} className="notif-day" aria-labelledby={`nd-${day}`}>
              <h2 id={`nd-${day}`}>{day}</h2>
              <ul className="notif-list card">
                {list.map((n) => {
                  const look = notificationLook(n);
                  return (
                    <li key={n.id} className={`notif-item ${n.read ? '' : 'is-unread'}`}>
                      <button type="button" className="notif-main" onClick={() => open(n)}>
                        <span className={`notif-ico tone-${look.tone}`} aria-hidden="true">
                          {look.icon}
                        </span>
                        <span className="notif-text">
                          <span className="notif-title">
                            {!n.read && <span className="sr-only">Unread: </span>}
                            {n.title}
                          </span>
                          {n.body && <span className="notif-body">{n.body}</span>}
                          <span className="notif-time">{relativeTime(n.createdAt)}</span>
                        </span>
                      </button>
                      <span className="notif-actions">
                        <IconButton
                          size="sm"
                          label={n.read ? `Mark “${n.title}” as unread` : `Mark “${n.title}” as read`}
                          tooltip={false}
                          icon={n.read ? <Circle size={14} /> : <CircleDot size={14} />}
                          onClick={() => mutateRead.mutate({ id: n.id, read: !n.read })}
                        />
                        <IconButton
                          size="sm"
                          label={`Delete “${n.title}”`}
                          tooltip={false}
                          icon={<Trash2 size={14} />}
                          onClick={() => mutateDelete.mutate(n.id)}
                        />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
        {page.data && page.data.total > items.length && (
          <div className="notif-more">
            <Button onClick={() => setSize((s) => s + 20)} loading={page.isFetching}>
              Show more
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
