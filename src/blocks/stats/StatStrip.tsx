/**
 * Stat strip: five compact numbers in one card, split by dividers. Fits above a table.
 * Uses: Card, Badge.
 */
import { Badge, Card } from '@/components/kit';

const STATS = [
  { label: 'Open tickets', value: '128', change: -8, goodWhenDown: true },
  { label: 'First reply', value: '1 h 12 m', change: -14, goodWhenDown: true },
  { label: 'Resolved today', value: '64', change: 9 },
  { label: 'Satisfaction', value: '94%', change: 2 },
  { label: 'Escalations', value: '3', change: 50, goodWhenDown: true },
];

export default function StatStrip() {
  return (
    <Card padding="none">
      <dl className="blk-strip">
        {STATS.map((s) => {
          const good = s.goodWhenDown ? s.change < 0 : s.change > 0;
          return (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>
                <b>{s.value}</b>
                <Badge tone={good ? 'ok' : 'danger'} size="sm">
                  {s.change > 0 ? '+' : ''}
                  {s.change}%
                </Badge>
              </dd>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}
