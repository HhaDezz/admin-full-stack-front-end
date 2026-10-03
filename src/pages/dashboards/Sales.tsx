import { useMemo, useState } from 'react';
import { DollarSign, Percent, ReceiptText, ShoppingBag } from 'lucide-react';
import { AreaChart, BarChart } from '../../components/charts';
import { Card, Grid, PageHeader, SearchSelect, StatCard } from '../../components/kit';
import YearCompareCard from '../../blocks/charts/YearCompareCard';
import TopProducts from '../../blocks/lists/TopProducts';
import RecentOrders from '../../blocks/lists/RecentOrders';
import GoalProgress from '../../blocks/stats/GoalProgress';
import { money, moneyK, shortDate } from '../../blocks/_data';
import { DashFilters, change, sum, useDailyRange } from './shared';

/* Sales dashboard: revenue, orders, products and regions for the chosen range. */

const COUNTRIES = [
  { country: 'United States', revenue: 182_400 },
  { country: 'United Kingdom', revenue: 96_100 },
  { country: 'Germany', revenue: 71_800 },
  { country: 'Japan', revenue: 54_300 },
  { country: 'Australia', revenue: 38_900 },
  { country: 'Sri Lanka', revenue: 21_600 },
];
const CHANNELS = [
  { value: 'all', label: 'All channels' },
  { value: 'online', label: 'Online' },
  { value: 'retail', label: 'Retail' },
];

export default function Sales() {
  const { range, setRange, rows, prev, days } = useDailyRange();
  const [channel, setChannel] = useState<string>('all');
  const share = channel === 'all' ? 1 : channel === 'online' ? 0.68 : 0.32;
  const k = useMemo(() => {
    const revenue = sum(rows, 'revenue') * share;
    const orders = sum(rows, 'orders') * share;
    const pRevenue = sum(prev, 'revenue') * share;
    const pOrders = sum(prev, 'orders') * share;
    const refunds = sum(rows, 'refunds');
    return {
      revenue,
      orders,
      aov: orders ? revenue / orders : 0,
      refundRate: orders ? (refunds / (orders / share)) * 100 : 0,
      dRevenue: change(revenue, pRevenue),
      dOrders: change(orders, pOrders),
      dAov: change(orders ? revenue / orders : 0, pOrders ? pRevenue / pOrders : 0),
      chart: rows.map((r) => ({ date: r.date, revenue: Math.round(r.revenue * share), orders: Math.round(r.orders * share) })),
    };
  }, [rows, prev, share]);

  return (
    <>
      <PageHeader title="Sales" description="Revenue, orders and what’s selling." />
      <DashFilters range={range} onRange={setRange}>
        <SearchSelect
          aria-label="Channel"
          options={CHANNELS}
          value={channel}
          onChange={(v) => setChannel(v ?? 'all')}
          searchable={false}
          minWidth={160}
        />
      </DashFilters>
      <Grid columns={{ base: 1, sm: 2, xl: 4 }} gap={4} className="dash-row">
        <StatCard
          label="Revenue"
          value={k.revenue}
          format={money}
          icon={<DollarSign size={20} />}
          tone="green"
          delta={k.dRevenue}
          deltaLabel="vs previous period"
          trend={k.chart.slice(-14).map((r) => r.revenue)}
        />
        <StatCard
          label="Orders"
          value={k.orders}
          format={(n) => Math.round(n).toLocaleString()}
          icon={<ShoppingBag size={20} />}
          tone="blue"
          delta={k.dOrders}
          deltaLabel="vs previous period"
          trend={k.chart.slice(-14).map((r) => r.orders)}
        />
        <StatCard
          label="Average order"
          value={k.aov}
          format={(n) => `$${n.toFixed(2)}`}
          icon={<ReceiptText size={20} />}
          tone="gold"
          delta={k.dAov}
          deltaLabel="vs previous period"
        />
        <StatCard
          label="Refund rate"
          value={k.refundRate}
          format={(n) => `${n.toFixed(1)}%`}
          icon={<Percent size={20} />}
          tone="terra"
          delta={-0.3}
          invertDelta
          deltaLabel="points vs previous"
        />
      </Grid>
      <div className="dash-grid">
        <div className="span-8">
          <Card headingLevel={2} title="Revenue" description={`${money(k.revenue)} over ${days} days`}>
            <AreaChart
              aria-label="Revenue per day"
              data={k.chart}
              index="date"
              indexLabel="Date"
              indexFormat={shortDate}
              valueFormat={money}
              height={280}
              series={[{ key: 'revenue', label: 'Revenue' }]}
            />
          </Card>
        </div>
        <div className="span-4">
          <GoalProgress />
        </div>
        <div className="span-12">
          <YearCompareCard />
        </div>
        <div className="span-7">
          <RecentOrders />
        </div>
        <div className="span-5">
          <TopProducts />
        </div>
        <div className="span-12">
          <Card headingLevel={2} title="Revenue by country" description="Top six markets this year">
            <BarChart
              aria-label="Revenue by country"
              data={COUNTRIES}
              index="country"
              indexLabel="Country"
              horizontal
              height={250}
              valueFormat={moneyK}
              series={[{ key: 'revenue', label: 'Revenue' }]}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
