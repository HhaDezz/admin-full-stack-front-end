import { useMemo } from 'react';
import { Clock, Eye, MousePointerClick, Users } from 'lucide-react';
import { AreaChart, BarChart, DonutChart, FunnelChart, Sparkline } from '../../components/charts';
import { Card, Grid, PageHeader, StatCard, useScrollFocus } from '../../components/kit';
import BusyHoursCard from '../../blocks/charts/BusyHoursCard';
import { SOURCES, shortDate } from '../../blocks/_data';
import { DashFilters, change, sum, useDailyRange } from './shared';

/* Analytics dashboard: traffic, sources, devices, pages and conversion for the chosen range. */

const PAGES = [
  { path: '/', views: 48_210, avg: 42, trend: [31, 34, 33, 38, 41, 44, 48] },
  { path: '/pricing', views: 21_380, avg: 96, trend: [18, 17, 19, 22, 21, 23, 21] },
  { path: '/features/permissions', views: 14_920, avg: 128, trend: [9, 11, 12, 13, 14, 14, 15] },
  { path: '/blog/audit-logs-explained', views: 11_070, avg: 214, trend: [16, 14, 13, 12, 11, 11, 11] },
  { path: '/docs/getting-started', views: 8_640, avg: 182, trend: [5, 6, 6, 7, 8, 8, 9] },
];
const DEVICES = [
  { device: 'Desktop', visitors: 58 },
  { device: 'Mobile', visitors: 36 },
  { device: 'Tablet', visitors: 6 },
];
const mmss = (s: number) => `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, '0')}s`;

export default function Analytics() {
  const scrollRef = useScrollFocus();
  const { range, setRange, rows, prev, days } = useDailyRange();
  const k = useMemo(() => {
    const visitors = sum(rows, 'visitors');
    const sessions = sum(rows, 'sessions');
    const orders = sum(rows, 'orders');
    const pv = sum(prev, 'visitors');
    const conv = visitors ? (orders / visitors) * 100 : 0;
    const pconv = pv ? (sum(prev, 'orders') / pv) * 100 : 0;
    return {
      visitors,
      sessions,
      conv,
      dVisitors: change(visitors, pv),
      dSessions: change(sessions, sum(prev, 'sessions')),
      dConv: pconv ? conv - pconv : undefined,
      spark: rows.slice(-14).map((r) => r.visitors),
      sparkS: rows.slice(-14).map((r) => r.sessions),
    };
  }, [rows, prev]);
  const scale = days / 30;

  return (
    <>
      <PageHeader title="Analytics" description="Who visits, where they come from and what they do." />
      <DashFilters range={range} onRange={setRange} />
      <Grid columns={{ base: 1, sm: 2, xl: 4 }} gap={4} className="dash-row">
        <StatCard
          label="Visitors"
          value={k.visitors}
          icon={<Users size={20} />}
          tone="green"
          delta={k.dVisitors}
          deltaLabel="vs previous period"
          trend={k.spark}
        />
        <StatCard
          label="Sessions"
          value={k.sessions}
          icon={<MousePointerClick size={20} />}
          tone="blue"
          delta={k.dSessions}
          deltaLabel="vs previous period"
          trend={k.sparkS}
        />
        <StatCard
          label="Conversion rate"
          value={k.conv}
          format={(n) => `${n.toFixed(2)}%`}
          icon={<Eye size={20} />}
          tone="gold"
          delta={k.dConv}
          deltaLabel="points vs previous"
        />
        <StatCard
          label="Avg. time on site"
          value={194}
          format={mmss}
          icon={<Clock size={20} />}
          tone="terra"
          delta={4.2}
          deltaLabel="vs previous period"
        />
      </Grid>
      <div className="dash-grid">
        <div className="span-8">
          <Card headingLevel={2} title="Traffic" description="Visitors and sessions per day">
            <AreaChart
              aria-label="Visitors and sessions per day"
              data={rows}
              index="date"
              indexLabel="Date"
              indexFormat={shortDate}
              height={280}
              series={[
                { key: 'sessions', label: 'Sessions', color: 'var(--chart-2)' },
                { key: 'visitors', label: 'Visitors', color: 'var(--chart-1)' },
              ]}
            />
          </Card>
        </div>
        <div className="span-4">
          <Card headingLevel={2} title="Sources" description="Where visitors came from">
            <DonutChart
              aria-label="Visitors by source"
              data={SOURCES.map((s) => ({ ...s, value: Math.round(s.value * scale) }))}
              size={170}
              legend="bottom"
              centerCaption="visitors"
              valueFormat={(n) => n.toLocaleString()}
            />
          </Card>
        </div>
        <div className="span-7">
          <Card headingLevel={2} title="Top pages" padding="none">
            <div className="table-wrap" ref={scrollRef}>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Page</th>
                    <th scope="col" style={{ textAlign: 'right' }}>
                      Views
                    </th>
                    <th scope="col" className="hide-sm" style={{ textAlign: 'right' }}>
                      Avg. time
                    </th>
                    <th scope="col" className="hide-sm">
                      <span className="sr-only">Trend</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PAGES.map((p) => (
                    <tr key={p.path}>
                      <td className="mono" style={{ fontSize: 13 }}>
                        {p.path}
                      </td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {Math.round(p.views * scale).toLocaleString()}
                      </td>
                      <td className="hide-sm muted" style={{ textAlign: 'right' }}>
                        {mmss(p.avg)}
                      </td>
                      <td className="hide-sm" style={{ textAlign: 'right' }}>
                        <Sparkline data={p.trend} width={72} height={24} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        <div className="span-5">
          <Card headingLevel={2} title="Devices" description="Share of visitors">
            <BarChart
              aria-label="Share of visitors by device"
              data={DEVICES}
              index="device"
              indexLabel="Device"
              horizontal
              height={170}
              valueFormat={(n) => `${n}%`}
              series={[{ key: 'visitors', label: 'Visitors' }]}
            />
          </Card>
        </div>
        <div className="span-8">
          <BusyHoursCard />
        </div>
        <div className="span-4">
          <Card headingLevel={2} title="Sign-up funnel">
            <FunnelChart
              aria-label="Sign-up funnel"
              valueFormat={(n) => n.toLocaleString()}
              steps={[
                { label: 'Visited', value: k.visitors },
                { label: 'Viewed pricing', value: Math.round(k.visitors * 0.31) },
                { label: 'Started sign-up', value: Math.round(k.visitors * 0.094) },
                { label: 'Activated', value: Math.round(k.visitors * 0.041) },
              ]}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
