/**
 * Checkout funnel: how many shoppers reach each step, with the drop between steps.
 * Uses: Card, FunnelChart.
 */
import { FunnelChart } from '@/components/charts';
import { Card } from '@/components/kit';

export default function FunnelCard() {
  return (
    <Card headingLevel={2} title="Checkout funnel" description="Last 30 days">
      <FunnelChart
        aria-label="Checkout funnel, last 30 days"
        steps={[
          { label: 'Viewed a product', value: 48_210 },
          { label: 'Added to cart', value: 9_870 },
          { label: 'Started checkout', value: 4_320 },
          { label: 'Paid', value: 2_955 },
        ]}
        valueFormat={(n) => n.toLocaleString()}
      />
    </Card>
  );
}
