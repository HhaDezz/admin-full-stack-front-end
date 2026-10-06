/**
 * Projects: progress, due date, status and team for each active project.
 * Uses: Card, Progress, Badge, AvatarGroup.
 */
import { AvatarGroup, Badge, Card, Progress, type BadgeTone } from '@/components/kit';
import { PROJECTS } from '../_data';

const TONE: Record<string, BadgeTone> = { 'On track': 'ok', 'At risk': 'warn', Behind: 'danger' };
const due = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function ProjectsProgress() {
  return (
    <Card headingLevel={2} title="Active projects" description={`${PROJECTS.length} in progress`} padding="none">
      <ul className="blk-projects">
        {PROJECTS.map((p) => (
          <li key={p.id}>
            <div className="blk-project-main">
              <div>
                <b>{p.name}</b>
                <div className="muted blk-sub">
                  {p.client} · due {due(p.due)}
                </div>
              </div>
              <Badge tone={TONE[p.status]} dot>
                {p.status}
              </Badge>
            </div>
            <div className="blk-project-foot">
              <Progress
                value={p.progress}
                size="sm"
                tone={p.status === 'On track' ? 'brand' : p.status === 'At risk' ? 'warning' : 'danger'}
                aria-label={`${p.name}: ${p.progress}% done`}
              />
              <span className="blk-project-pct">{p.progress}%</span>
              <AvatarGroup people={p.team.map((name) => ({ name }))} size="xs" max={3} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
