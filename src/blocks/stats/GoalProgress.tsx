/**
 * Goal progress: quarterly targets with how far along each one is.
 * Uses: Card, Progress. Tone turns amber when a goal is behind the pace of the quarter.
 */
import { Card, Progress } from '@/components/kit';

const GOALS = [
  { label: 'Revenue', value: 612_000, target: 800_000, format: (n: number) => `$${Math.round(n / 1000)}K` },
  { label: 'New customers', value: 2_140, target: 2_500, format: (n: number) => n.toLocaleString() },
  { label: 'Net promoter score', value: 41, target: 60, format: (n: number) => String(n) },
  { label: 'Support replies under 2 h', value: 88, target: 95, format: (n: number) => `${n}%` },
];
const PACE = 0.72; // share of the quarter gone

export default function GoalProgress() {
  return (
    <Card headingLevel={2} title="Q4 goals" description="72% of the quarter has passed">
      <div className="blk-goals">
        {GOALS.map((g) => {
          const share = g.value / g.target;
          return (
            <div key={g.label} className="blk-goal">
              <div className="blk-goal-head">
                <span>{g.label}</span>
                <span className="muted">
                  <b>{g.format(g.value)}</b> of {g.format(g.target)}
                </span>
              </div>
              <Progress
                value={Math.min(100, share * 100)}
                tone={share >= PACE ? 'success' : 'warning'}
                aria-label={`${g.label}: ${Math.round(share * 100)}% of target`}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
