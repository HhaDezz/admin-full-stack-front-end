/**
 * Busy hours: orders by weekday and hour, to plan staffing and campaigns.
 * Uses: Card, Heatmap.
 */
import { Heatmap } from '@/components/charts';
import { Card } from '@/components/kit';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);
const ORDERS = DAYS.map((_, d) =>
  HOURS.map((_, h) => {
    const lunch = Math.exp(-((h - 12.5) ** 2) / 4);
    const evening = Math.exp(-((h - 20.5) ** 2) / 5) * (d >= 4 ? 1.4 : 1);
    return Math.round(60 * (lunch + evening) + (h > 7 ? 4 : 0) + ((d + h) % 3));
  }),
);

export default function BusyHoursCard() {
  return (
    <Card headingLevel={2} title="Busy hours" description="Orders by weekday and hour, last 4 weeks">
      <Heatmap
        aria-label="Orders by weekday and hour"
        rows={DAYS}
        columns={HOURS}
        values={ORDERS}
        columnLabelEvery={3}
        cellHeight={22}
        valueFormat={(n) => `${n} orders`}
      />
    </Card>
  );
}
