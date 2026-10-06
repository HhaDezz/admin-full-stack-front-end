/**
 * Upgrade prompt: a usage meter that explains the limit and offers the next plan.
 * Uses: Progress, Button. Shown when a workspace is near a plan limit.
 */
import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Button, IconButton, Progress } from '@/components/kit';

export default function UpgradeBanner() {
  const [shown, setShown] = useState(true);
  if (!shown) return <Button onClick={() => setShown(true)}>Show again</Button>;
  return (
    <section className="blk-upgrade" aria-labelledby="upgrade-title">
      <span className="blk-upgrade-icon" aria-hidden="true">
        <Sparkles size={20} />
      </span>
      <div className="blk-upgrade-text">
        <h2 id="upgrade-title">You’re using 46 of 50 seats</h2>
        <p>Team plans stop at 50 people. Business has unlimited seats, single sign-on and unlimited audit history.</p>
        <Progress value={92} tone="warning" size="sm" aria-label="46 of 50 seats used" />
      </div>
      <div className="blk-upgrade-actions">
        <Button variant="primary">See Business</Button>
        <IconButton label="Dismiss" icon={<X size={16} />} variant="ghost" onClick={() => setShown(false)} />
      </div>
    </section>
  );
}
