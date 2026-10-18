import './apps.css';
import { Info } from 'lucide-react';
import { Badge, Tooltip } from '../../components/kit';

/** "Sample data" chip shown on every app page, with a pointer to where to plug in the API. */
export function SampleBadge({ file = 'src/pages/apps/data.ts' }: { file?: string }) {
  return (
    <Tooltip content={`Generated sample data. Replace ${file} with calls to your API.`}>
      <span tabIndex={0} className="dash-sample">
        <Badge tone="gold">
          <Info size={12} aria-hidden="true" /> Sample data
        </Badge>
      </span>
    </Tooltip>
  );
}
