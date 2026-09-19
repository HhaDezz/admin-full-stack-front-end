import './account.css';
import { useState } from 'react';
import { History, Search } from 'lucide-react';
import { Card, EmptyState, Input, PageHeader, Skeleton, Timeline, ToggleGroup } from '../../components/kit';
import { activityLook, groupByDay } from '../../lib/activityMeta';
import { relativeTime, dateTime } from '../../lib/format';
import { useActivity } from '../../lib/queries';

type Kind = 'all' | 'signin' | 'security' | 'change';

/** The signed-in user's own sign-ins, security changes and edits from the last 90 days. */
export default function Activity() {
  const activity = useActivity();
  const [kind, setKind] = useState<Kind>('all');
  const [q, setQ] = useState('');
  const rows = (activity.data ?? [])
    .map((a) => ({ ...a, look: activityLook(a.action, a.details) }))
    .filter(
      (a) =>
        (kind === 'all' || a.look.kind === kind) &&
        (!q.trim() ||
          `${a.look.label} ${a.details ?? ''} ${a.ipAddress ?? ''} ${a.browser ?? ''}`.toLowerCase().includes(q.trim().toLowerCase())),
    );

  return (
    <>
      <PageHeader
        title="My activity"
        description="Your sign-ins, security changes and edits from the last 90 days. Anything you don’t recognise? Change your password and sign out other devices."
      />
      <div className="activity-tools">
        <ToggleGroup<Kind>
          aria-label="Show"
          value={kind}
          onChange={setKind}
          items={[
            { value: 'all', label: 'All' },
            { value: 'signin', label: 'Sign-ins' },
            { value: 'security', label: 'Security' },
            { value: 'change', label: 'Changes' },
          ]}
        />
        <div style={{ width: 'min(320px, 100%)' }}>
          <Input
            aria-label="Search activity"
            placeholder="Search activity"
            prefix={<Search size={16} />}
            clearable
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      {activity.isLoading ? (
        <Card padding="lg">
          <Skeleton h={48} />
          <Skeleton h={48} />
          <Skeleton h={48} />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<History size={22} />}
            title="Nothing to show"
            description={q || kind !== 'all' ? 'Try another filter.' : 'Your activity will appear here.'}
          />
        </Card>
      ) : (
        groupByDay(rows, (r) => r.at).map(([day, list]) => (
          <section key={day} className="notif-day" aria-labelledby={`ad-${day}`}>
            <h2 id={`ad-${day}`}>{day}</h2>
            <Card padding="md">
              <Timeline
                variant="compact"
                aria-label={day}
                items={list.map((r) => ({
                  id: r.id,
                  icon: r.look.icon,
                  tone:
                    r.action === 'LOGIN_FAILED'
                      ? 'danger'
                      : r.look.kind === 'signin'
                        ? 'info'
                        : r.look.kind === 'security'
                          ? 'success'
                          : 'neutral',
                  title: r.look.label,
                  description: [r.browser && r.os ? `${r.browser} on ${r.os}` : null, r.ipAddress].filter(Boolean).join(' · ') || undefined,
                  time: <span title={dateTime(r.at)}>{relativeTime(r.at)}</span>,
                  dateTime: r.at,
                }))}
              />
            </Card>
          </section>
        ))
      )}
    </>
  );
}
