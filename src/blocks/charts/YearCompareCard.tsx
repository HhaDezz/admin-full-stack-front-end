/**
 * This year vs last year: monthly bars side by side, or sales by channel stacked.
 * Uses: Card, ToggleGroup, BarChart.
 */
import { useState } from 'react';
import { BarChart } from '@/components/charts';
import { Card, ToggleGroup } from '@/components/kit';
import { MONTHLY, moneyK } from '../_data';

export default function YearCompareCard() {
  const [view, setView] = useState<'years' | 'channels'>('years');
  return (
    <Card
      headingLevel={2}
      title="Sales by month"
      description={view === 'years' ? '2026 against 2025' : 'Online, retail and wholesale, 2026'}
      actions={
        <ToggleGroup
          size="sm"
          aria-label="View"
          value={view}
          onChange={setView}
          items={[
            { value: 'years', label: 'Years' },
            { value: 'channels', label: 'Channels' },
          ]}
        />
      }
    >
      {view === 'years' ? (
        <BarChart
          aria-label="Monthly sales, 2026 against 2025"
          data={MONTHLY}
          index="month"
          indexLabel="Month"
          valueFormat={moneyK}
          series={[
            { key: 'thisYear', label: '2026' },
            { key: 'lastYear', label: '2025', color: 'var(--chart-2)' },
          ]}
        />
      ) : (
        <BarChart
          aria-label="Monthly sales by channel, 2026"
          data={MONTHLY}
          index="month"
          indexLabel="Month"
          stacked
          valueFormat={moneyK}
          series={[
            { key: 'online', label: 'Online' },
            { key: 'retail', label: 'Retail' },
            { key: 'wholesale', label: 'Wholesale' },
          ]}
        />
      )}
    </Card>
  );
}
