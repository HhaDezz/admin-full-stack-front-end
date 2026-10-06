/**
 * Revenue card: an area chart with a 7 / 30 / 90-day switch, the total and its change.
 * Uses: Card, ToggleGroup, AreaChart.
 */
import { useMemo, useState } from 'react';
import { AreaChart } from '@/components/charts';
import { Badge, Card, ToggleGroup } from '@/components/kit';
import { DAILY, money, shortDate } from '../_data';

type Range = '7' | '30' | '90';

export default function RevenueCard() {
  const [range, setRange] = useState<Range>('30');
  const { rows, total, change } = useMemo(() => {
    const n = Number(range);
    const rows = DAILY.slice(-n);
    const total = rows.reduce((a, d) => a + d.revenue, 0);
    const prev = DAILY.slice(-2 * n, -n).reduce((a, d) => a + d.revenue, 0) || total;
    return { rows, total, change: ((total - prev) / prev) * 100 };
  }, [range]);
  return (
    <Card
      headingLevel={2}
      title="Revenue"
      description={
        <>
          <b className="blk-card-figure">{money(total)}</b>{' '}
          <Badge tone={change >= 0 ? 'ok' : 'danger'} size="sm">
            {change >= 0 ? '+' : ''}
            {change.toFixed(1)}%
          </Badge>
        </>
      }
      actions={
        <ToggleGroup
          size="sm"
          aria-label="Period"
          value={range}
          onChange={setRange}
          items={[
            { value: '7', label: '7d' },
            { value: '30', label: '30d' },
            { value: '90', label: '90d' },
          ]}
        />
      }
    >
      <AreaChart
        aria-label={`Revenue per day, last ${range} days`}
        data={rows}
        index="date"
        indexLabel="Date"
        indexFormat={shortDate}
        valueFormat={money}
        height={260}
        series={[{ key: 'revenue', label: 'Revenue' }]}
      />
    </Card>
  );
}
