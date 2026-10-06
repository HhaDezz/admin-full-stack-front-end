/**
 * Hero metric: one big number with its change and a 30-day area chart.
 * Uses: Card, Badge, AreaChart. For the one number a page leads with.
 */
import { TrendingUp } from 'lucide-react';
import { AreaChart } from '@/components/charts';
import { Badge, Card } from '@/components/kit';
import { DAILY, money, shortDate } from '../_data';

const last30 = DAILY.slice(-30);
const total = last30.reduce((a, d) => a + d.revenue, 0);
const before = DAILY.slice(-60, -30).reduce((a, d) => a + d.revenue, 0);
const change = ((total - before) / before) * 100;

export default function StatHero() {
  return (
    <Card padding="lg">
      <div className="blk-hero">
        <div>
          <p className="blk-eyebrow">Revenue, last 30 days</p>
          <p className="blk-hero-value">{money(total)}</p>
          <p className="blk-hero-meta">
            <Badge tone={change >= 0 ? 'ok' : 'danger'}>
              <TrendingUp size={13} aria-hidden="true" /> {change >= 0 ? '+' : ''}
              {change.toFixed(1)}%
            </Badge>{' '}
            vs the 30 days before ({money(before)})
          </p>
        </div>
        <div className="blk-hero-chart">
          <AreaChart
            aria-label="Daily revenue, last 30 days"
            data={last30}
            index="date"
            indexLabel="Date"
            indexFormat={shortDate}
            valueFormat={money}
            height={150}
            series={[{ key: 'revenue', label: 'Revenue' }]}
          />
        </div>
      </div>
    </Card>
  );
}
