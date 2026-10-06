/**
 * System health: three gauges that turn amber and red past their limits.
 * Uses: Card, Gauge, Grid.
 */
import { Gauge } from '@/components/charts';
import { Card, Grid } from '@/components/kit';

const BANDS = [
  { from: 0, tone: 'success' as const },
  { from: 70, tone: 'warning' as const },
  { from: 90, tone: 'danger' as const },
];
const pct = (n: number) => `${Math.round(n)}%`;

export default function HealthGauges() {
  return (
    <Card headingLevel={2} title="Server health" description="eu-west-1 · updated a minute ago">
      <Grid columns={{ base: 1, sm: 3 }} gap={4} align="center">
        <div className="blk-gauge">
          <Gauge label="CPU" value={46} caption="CPU" valueFormat={pct} bands={BANDS} size={180} />
        </div>
        <div className="blk-gauge">
          <Gauge label="Memory" value={78} caption="Memory" valueFormat={pct} bands={BANDS} size={180} />
        </div>
        <div className="blk-gauge">
          <Gauge label="Disk" value={93} caption="Disk" valueFormat={pct} bands={BANDS} size={180} />
        </div>
      </Grid>
    </Card>
  );
}
