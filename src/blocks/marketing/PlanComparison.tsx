/**
 * Plan comparison: every feature against every plan, grouped, with ticks and limits.
 * Uses: plain table markup with the kit's table styles.
 */
import { Check, Minus } from 'lucide-react';
import { Card, useScrollFocus } from '@/components/kit';

const PLANS = ['Starter', 'Team', 'Business'];
const GROUPS: { name: string; rows: [string, ...(string | boolean)[]][] }[] = [
  {
    name: 'People and access',
    rows: [
      ['Users', '5', '50', 'Unlimited'],
      ['Custom roles', false, true, true],
      ['Two-step sign-in', true, true, true],
      ['Single sign-on (SAML)', false, false, true],
    ],
  },
  {
    name: 'History and data',
    rows: [
      ['Audit log', '30 days', '1 year', 'Unlimited'],
      ['CSV export', true, true, true],
      ['API access', false, true, true],
    ],
  },
  {
    name: 'Support',
    rows: [
      ['Email support', true, true, true],
      ['Response time', '2 days', '4 hours', '1 hour'],
      ['Account manager', false, false, true],
    ],
  },
];

export default function PlanComparison() {
  const scrollRef = useScrollFocus();
  return (
    <Card padding="none">
      <div className="table-wrap" ref={scrollRef}>
        <table className="table blk-compare">
          <caption className="sr-only">Features by plan</caption>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              {PLANS.map((p) => (
                <th key={p} scope="col">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          {GROUPS.map((g) => (
            <tbody key={g.name}>
              <tr className="blk-compare-group">
                <th scope="colgroup" colSpan={PLANS.length + 1}>
                  {g.name}
                </th>
              </tr>
              {g.rows.map(([feature, ...cells]) => (
                <tr key={feature}>
                  <th scope="row">{feature}</th>
                  {cells.map((c, i) => (
                    <td key={i}>
                      {c === true ? (
                        <Check size={17} className="blk-yes" aria-label="Included" />
                      ) : c === false ? (
                        <Minus size={17} className="blk-no" aria-label="Not included" />
                      ) : (
                        c
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </Card>
  );
}
