/**
 * Pricing tiers: three plans with a monthly / yearly switch and the popular plan raised.
 * Uses: ToggleGroup, Badge, Button. Prices and features live in PLANS.
 */
import { useState } from 'react';
import { Check } from 'lucide-react';
import { Badge, Button, ToggleGroup } from '@/components/kit';

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    blurb: 'For a small team getting organised.',
    monthly: 0,
    yearly: 0,
    cta: 'Start free',
    features: ['Up to 5 users', 'Roles and permissions', '30 days of audit history', 'Email support'],
  },
  {
    id: 'team',
    name: 'Team',
    blurb: 'For growing teams that need control.',
    monthly: 29,
    yearly: 24,
    cta: 'Start 14-day trial',
    popular: true,
    features: ['Up to 50 users', 'Two-step sign-in for everyone', '1 year of audit history', 'Dashboards and exports', 'Priority support'],
  },
  {
    id: 'business',
    name: 'Business',
    blurb: 'For companies with compliance needs.',
    monthly: 79,
    yearly: 66,
    cta: 'Talk to us',
    features: [
      'Unlimited users',
      'Single sign-on (SAML)',
      'Unlimited audit history',
      'Custom roles per department',
      'A named account manager',
    ],
  },
];

export default function PricingTiers() {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('yearly');
  return (
    <div className="blk-pricing">
      <div className="blk-pricing-switch">
        <ToggleGroup
          aria-label="Billing period"
          value={period}
          onChange={setPeriod}
          items={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
          ]}
        />
        <Badge tone="ok">2 months free yearly</Badge>
      </div>
      <div className="blk-tiers">
        {PLANS.map((p) => {
          const price = p[period];
          return (
            <section key={p.id} className={`card blk-tier ${p.popular ? 'is-popular' : ''}`} aria-labelledby={`tier-${p.id}`}>
              <div className="blk-tier-head">
                <h2 id={`tier-${p.id}`}>{p.name}</h2>
                {p.popular && <Badge tone="brand">Most popular</Badge>}
              </div>
              <p className="muted">{p.blurb}</p>
              <p className="blk-price">
                <b>${price}</b>
                <span>{price ? 'per user / month' : 'forever'}</span>
              </p>
              <p className="blk-price-note muted">
                {price ? (period === 'yearly' ? `Billed $${price * 12} per user yearly` : 'Billed monthly') : 'No card needed'}
              </p>
              <Button variant={p.popular ? 'primary' : 'secondary'} fullWidth>
                {p.cta}
              </Button>
              <ul className="blk-features">
                {p.features.map((f) => (
                  <li key={f}>
                    <Check size={16} aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
