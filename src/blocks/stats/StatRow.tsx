/**
 * Stat row: four KPI cards with change and a 7-day trend.
 * Uses: StatCard, Grid. Replace the numbers with your own query.
 */
import { DollarSign, Percent, ShoppingBag, Users } from 'lucide-react';
import { Grid, StatCard } from '@/components/kit';

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default function StatRow() {
  return (
    <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
      <StatCard
        label="Revenue"
        value={48_210}
        format={money}
        icon={<DollarSign size={20} />}
        tone="green"
        delta={12.4}
        deltaLabel="vs last week"
        trend={[31, 34, 33, 38, 41, 44, 48]}
      />
      <StatCard
        label="Orders"
        value={712}
        icon={<ShoppingBag size={20} />}
        tone="blue"
        delta={6.1}
        deltaLabel="vs last week"
        trend={[88, 92, 95, 99, 104, 110, 124]}
      />
      <StatCard
        label="New customers"
        value={186}
        icon={<Users size={20} />}
        tone="gold"
        delta={-3.2}
        deltaLabel="vs last week"
        trend={[31, 29, 30, 27, 26, 25, 28]}
      />
      <StatCard
        label="Refund rate"
        value={1.8}
        format={(n) => `${n.toFixed(1)}%`}
        icon={<Percent size={20} />}
        tone="terra"
        delta={-0.4}
        invertDelta
        deltaLabel="vs last week"
        trend={[2.4, 2.2, 2.3, 2.0, 1.9, 1.9, 1.8]}
      />
    </Grid>
  );
}
