/**
 * Traffic sources: a donut with each channel's visits and share.
 * Uses: Card, DonutChart.
 */
import { DonutChart } from '@/components/charts';
import { Card } from '@/components/kit';
import { SOURCES } from '../_data';

export default function SourcesCard() {
  return (
    <Card headingLevel={2} title="Traffic sources" description="Visits in October">
      <DonutChart
        aria-label="Visits by source, October"
        data={SOURCES}
        size={180}
        centerCaption="visits"
        valueFormat={(n) => n.toLocaleString()}
      />
    </Card>
  );
}
