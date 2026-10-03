import { CalendarClock, CheckCircle2, CircleAlert, Flag, FolderKanban } from 'lucide-react';
import { BarChart, Gauge } from '../../components/charts';
import { AvatarGroup, Card, Grid, PageHeader, StatCard, Timeline } from '../../components/kit';
import ProjectsProgress from '../../blocks/lists/ProjectsProgress';
import ActivityFeed from '../../blocks/lists/ActivityFeed';
import { PROJECTS } from '../../blocks/_data';
import { DashFilters, useDailyRange } from './shared';

/* Projects dashboard: delivery status, workload and what's due next. */

const TASKS = [
  { project: 'Atlas', done: 64, inProgress: 14, todo: 11 },
  { project: 'Beacon', done: 31, inProgress: 18, todo: 27 },
  { project: 'Cobalt', done: 52, inProgress: 3, todo: 1 },
  { project: 'Delta', done: 9, inProgress: 12, todo: 38 },
];
const WORKLOAD = [
  { person: 'Ada Lovelace', hours: 38 },
  { person: 'Grace Hopper', hours: 44 },
  { person: 'Alan Turing', hours: 31 },
  { person: 'Katherine Johnson', hours: 36 },
  { person: 'Dennis Ritchie', hours: 27 },
];
const day = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};
const fmt = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

export default function Projects() {
  const { range, setRange } = useDailyRange();
  const deadlines = [
    { id: 1, title: 'Cobalt: data import sign-off', when: day(2), tone: 'warning' as const, team: ['Margaret Hamilton', 'Ada Lovelace'] },
    { id: 2, title: 'Atlas: design review', when: day(5), tone: 'brand' as const, team: ['Ada Lovelace', 'Grace Hopper'] },
    { id: 3, title: 'Beacon: beta to testers', when: day(11), tone: 'danger' as const, team: ['Katherine Johnson', 'Dennis Ritchie'] },
    { id: 4, title: 'Delta: pricing model agreed', when: day(19), tone: 'neutral' as const, team: ['Grace Hopper', 'Alan Turing'] },
  ];
  return (
    <>
      <PageHeader title="Projects" description="Delivery status, workload and what’s due next." />
      <DashFilters range={range} onRange={setRange} />
      <Grid columns={{ base: 1, sm: 2, xl: 4 }} gap={4} className="dash-row">
        <StatCard
          label="Active projects"
          value={PROJECTS.length}
          icon={<FolderKanban size={20} />}
          tone="green"
          footnote="1 finishing this week"
        />
        <StatCard
          label="Tasks done"
          value={156}
          icon={<CheckCircle2 size={20} />}
          tone="blue"
          delta={18}
          deltaLabel="vs previous period"
          trend={[18, 22, 19, 25, 28, 21, 23]}
        />
        <StatCard
          label="Overdue tasks"
          value={7}
          icon={<CircleAlert size={20} />}
          tone="red"
          delta={-22}
          invertDelta
          deltaLabel="vs previous period"
        />
        <StatCard label="Milestones this month" value={4} icon={<Flag size={20} />} tone="gold" footnote="2 at risk" />
      </Grid>
      <div className="dash-grid">
        <div className="span-7">
          <ProjectsProgress />
        </div>
        <div className="span-5">
          <Card headingLevel={2} title="Team capacity" description="Booked hours against a 40-hour week">
            <div className="dash-gauge">
              <Gauge
                label="Team capacity booked"
                value={88}
                valueFormat={(n) => `${Math.round(n)}%`}
                caption="booked this week"
                bands={[
                  { from: 0, tone: 'success' },
                  { from: 85, tone: 'warning' },
                  { from: 100, tone: 'danger' },
                ]}
                size={210}
              />
            </div>
            <BarChart
              aria-label="Booked hours per person this week"
              data={WORKLOAD}
              index="person"
              indexLabel="Person"
              horizontal
              height={200}
              valueFormat={(n) => `${n} h`}
              series={[{ key: 'hours', label: 'Hours' }]}
            />
          </Card>
        </div>
        <div className="span-12">
          <Card headingLevel={2} title="Tasks by project">
            <BarChart
              aria-label="Tasks by project and status"
              data={TASKS}
              index="project"
              indexLabel="Project"
              stacked
              height={240}
              series={[
                { key: 'done', label: 'Done' },
                { key: 'inProgress', label: 'In progress' },
                { key: 'todo', label: 'To do', color: 'var(--chart-5)' },
              ]}
            />
          </Card>
        </div>
        <div className="span-6">
          <Card headingLevel={2} title="Upcoming deadlines" description="Next three weeks">
            <Timeline
              aria-label="Upcoming deadlines"
              items={deadlines.map((d) => ({
                id: d.id,
                icon: <CalendarClock size={15} />,
                tone: d.tone,
                title: d.title,
                time: fmt(d.when),
                dateTime: d.when.toISOString().slice(0, 10),
                content: <AvatarGroup people={d.team.map((name) => ({ name }))} size="xs" />,
              }))}
            />
          </Card>
        </div>
        <div className="span-6">
          <ActivityFeed />
        </div>
      </div>
    </>
  );
}
