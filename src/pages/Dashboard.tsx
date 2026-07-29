import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  Clock3,
  KeyRound,
  Lock,
  LogIn,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserPlus,
  Users as UsersIcon,
  UserX,
} from 'lucide-react';
import { AreaChart, DonutChart } from '../components/charts';
import { Avatar, Badge, Empty, Notice, Skeleton } from '../components/ui';
import { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { compact, greeting, relativeTime, shortDate, titleCase } from '../lib/format';
import { useCountUp } from '../lib/motion';
import { useDashboard } from '../lib/queries';
import type { AuditEntry } from '../lib/types';

function Kpi({
  icon,
  tone,
  value,
  label,
  note,
  loading,
}: {
  icon: ReactNode;
  tone: string;
  value: number;
  label: string;
  note?: ReactNode;
  loading: boolean;
}) {
  const shown = useCountUp(loading ? 0 : value);
  return (
    <div className={`card kpi tone-${tone}`}>
      <div className="ico">{icon}</div>
      {loading ? (
        <Skeleton h={30} w="60%" />
      ) : (
        <div className="v" aria-label={String(value)}>
          {compact(Math.round(shown))}
        </div>
      )}
      <div className="l">{label}</div>
      {note && !loading && <div className="kpi-note">{note}</div>}
    </div>
  );
}

function activityIcon(a: AuditEntry) {
  if (a.action === 'LOGIN') return <LogIn size={15} />;
  if (a.action === 'LOGIN_FAILED') return <ShieldX size={15} />;
  if (a.action === 'PASSWORD_CHANGED') return <KeyRound size={15} />;
  return <Activity size={15} />;
}

export default function Dashboard() {
  const { session, can } = useAuth();
  const q = useDashboard();
  const d = q.data;
  const loading = q.isLoading;

  const chart = useMemo(
    () =>
      (d?.signInsByDay ?? []).map((x) => ({
        day: new Date(x.date + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        success: x.success,
        failed: x.failed,
      })),
    [d],
  );
  const roleTotal = (d?.usersByRole ?? []).reduce((s, r) => s + r.count, 0);
  const firstName = (session?.name ?? '').split(' ')[0] || 'there';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  if (!can('dashboard-view')) {
    return (
      <>
        <section className="hero">
          <h1>
            {greeting()}, {firstName}.
          </h1>
          <p>You’re signed in. Your role doesn’t include the dashboard yet.</p>
        </section>
        <div className="card">
          <Empty icon={<Lock size={22} />} title="Dashboard hidden">
            Ask an administrator for the <span className="mono">dashboard-view</span> permission.
          </Empty>
        </div>
      </>
    );
  }

  return (
    <>
      <section className="hero">
        <h1>
          {greeting()}, {firstName}.
        </h1>
        <p>
          {d
            ? `${d.activeUsers} active account${d.activeUsers === 1 ? '' : 's'} and ${d.signInsLast7Days} sign-in${d.signInsLast7Days === 1 ? '' : 's'} this week.${d.failedSignInsLast7Days ? ` ${d.failedSignInsLast7Days} failed attempt${d.failedSignInsLast7Days === 1 ? '' : 's'} to keep an eye on.` : ''}`
            : 'Here’s a summary of your workspace.'}
        </p>
        <div className="meta">
          <span className="pill">
            <Clock3 size={14} /> {today}
          </span>
          {session?.role && (
            <span className="pill">
              <ShieldCheck size={14} /> {titleCase(session.role)}
            </span>
          )}
        </div>
      </section>

      {q.isError && (
        <div style={{ marginBottom: 14 }}>
          <Notice danger>Couldn’t load the dashboard. {errorMessage(q.error)}</Notice>
        </div>
      )}

      <div className="kpis">
        <Kpi loading={loading} tone="green" icon={<UsersIcon size={20} />} value={d?.totalUsers ?? 0} label="Total users" />
        <Kpi
          loading={loading}
          tone="blue"
          icon={<UserCheck size={20} />}
          value={d?.activeUsers ?? 0}
          label="Active accounts"
          note={d && d.disabledUsers > 0 ? `${d.disabledUsers} disabled` : 'All enabled'}
        />
        <Kpi loading={loading} tone="gold" icon={<UserPlus size={20} />} value={d?.newUsersLast30Days ?? 0} label="New in 30 days" />
        <Kpi
          loading={loading}
          tone="terra"
          icon={<LogIn size={20} />}
          value={d?.signInsLast7Days ?? 0}
          label="Sign-ins, 7 days"
          note={d ? d.failedSignInsLast7Days ? <span className="txt-danger">{d.failedSignInsLast7Days} failed</span> : 'No failures' : null}
        />
        <Kpi
          loading={loading}
          tone="red"
          icon={<ShieldCheck size={20} />}
          value={d?.totalRoles ?? 0}
          label="Roles"
          note={d ? `${d.totalPermissions} permissions` : null}
        />
      </div>

      <div className="dash-grid">
        <div className="card span-8">
          <div className="card-head">
            <div>
              <h2>Sign-ins</h2>
              <div className="sub">Successful and failed sign-ins over the last 14 days</div>
            </div>
          </div>
          <div className="card-pad" style={{ paddingTop: 0 }}>
            <AreaChart
              aria-label="Successful and failed sign-ins, last 14 days"
              data={chart}
              index="day"
              indexLabel="Day"
              height={290}
              loading={loading}
              series={[
                { key: 'success', label: 'Successful' },
                { key: 'failed', label: 'Failed', color: 'var(--chart-3)' },
              ]}
            />
          </div>
        </div>

        <div className="card span-4">
          <div className="card-head">
            <div>
              <h2>Team by role</h2>
              <div className="sub">Role assignments across {d?.totalUsers ?? 0} people</div>
            </div>
          </div>
          <div className="card-pad" style={{ paddingTop: 0 }}>
            {!loading && !d?.usersByRole.length ? (
              <Empty icon={<UsersIcon size={22} />} title="No roles assigned yet" />
            ) : (
              <DonutChart
                aria-label="Role assignments"
                loading={loading}
                size={180}
                legend="bottom"
                centerLabel={roleTotal}
                centerCaption="assignments"
                data={(d?.usersByRole ?? []).map((r) => ({ label: titleCase(r.role), value: r.count }))}
              />
            )}
          </div>
        </div>

        {d?.recentUsers && (
          <div className="card span-7">
            <div className="card-head">
              <div>
                <h2>Newest members</h2>
                <div className="sub">Most recently added accounts</div>
              </div>
              <Link to="/users" className="btn btn-sm">
                View all
              </Link>
            </div>
            <div className="list" style={{ marginTop: 10 }}>
              {d.recentUsers.map((u) => (
                <div className="list-row" key={u.id}>
                  <Avatar name={u.name} />
                  <div className="grow">
                    <div className="t">
                      {u.name} {!u.enabled && <Badge tone="danger">Disabled</Badge>}
                    </div>
                    <div className="s">{u.email}</div>
                  </div>
                  <div className="chips" style={{ justifyContent: 'flex-end' }}>
                    {u.roles.slice(0, 2).map((r) => (
                      <Badge key={r.id} seed={r.roleName}>
                        {titleCase(r.roleName)}
                      </Badge>
                    ))}
                  </div>
                  <span className="muted desktop-only" style={{ fontSize: 12.5, width: 96, textAlign: 'right' }}>
                    {shortDate(u.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {d?.recentActivity ? (
          <div className={`card ${d.recentUsers ? 'span-5' : 'span-12'}`}>
            <div className="card-head">
              <div>
                <h2>Recent activity</h2>
                <div className="sub">Sign-ins and account events</div>
              </div>
              <Link to="/audit" className="btn btn-sm">
                Audit log
              </Link>
            </div>
            <div className="list" style={{ marginTop: 10 }}>
              {d.recentActivity.length === 0 ? (
                <Empty icon={<Activity size={22} />} title="Nothing yet" />
              ) : (
                d.recentActivity.map((a) => (
                  <div className="list-row" key={a.id}>
                    <span className={`act-ico ${a.action === 'LOGIN_FAILED' ? 'is-bad' : ''}`}>{activityIcon(a)}</span>
                    <div className="grow">
                      <div className="t" style={{ fontWeight: 550, fontSize: 13.5 }}>
                        {a.details || titleCase(a.action)}
                      </div>
                      <div className="s">{a.userName}</div>
                    </div>
                    <span className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                      {relativeTime(a.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          d && (
            <div className={`card ${d.recentUsers ? 'span-5' : 'span-12'}`}>
              <div className="card-head">
                <div>
                  <h2>Account status</h2>
                  <div className="sub">Enabled and disabled accounts</div>
                </div>
              </div>
              <div style={{ padding: '14px 0 18px' }}>
                {[
                  ['Enabled', d.activeUsers, <CheckCircle2 size={14} key="a" />],
                  ['Disabled', d.disabledUsers, <UserX size={14} key="b" />],
                ].map(([label, n, icon]) => (
                  <div className="bar-row" key={label as string}>
                    <div className="top">
                      <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                        {icon}
                        {label}
                      </span>
                      <b>{n as number}</b>
                    </div>
                    <div className="bar">
                      <i style={{ width: `${d.totalUsers ? ((n as number) / d.totalUsers) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}
