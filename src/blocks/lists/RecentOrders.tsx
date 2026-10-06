/**
 * Recent orders: a compact table with status badges and a link to every order.
 * Uses: Card, Badge, Button. Plain table markup, so it stays light on a dashboard.
 */
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Badge, Card, useScrollFocus, type BadgeTone } from '@/components/kit';
import { ORDERS } from '../_data';

const money = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });

const TONE: Record<string, BadgeTone> = { Paid: 'ok', Pending: 'warn', Refunded: 'danger', Shipped: 'info' };
const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function RecentOrders() {
  const scrollRef = useScrollFocus();
  return (
    <Card
      headingLevel={2}
      title="Recent orders"
      padding="none"
      actions={
        <Link className="btn btn-sm btn-ghost" to="#orders">
          View all <ArrowRight size={14} className="flip-rtl" />
        </Link>
      }
    >
      <div className="table-wrap" ref={scrollRef}>
        <table className="table blk-table">
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Customer</th>
              <th scope="col" className="hide-sm">
                Placed
              </th>
              <th scope="col">Status</th>
              <th scope="col" style={{ textAlign: 'right' }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link to={`#order-${o.id}`} className="blk-link">
                    #{o.id}
                  </Link>
                </td>
                <td>
                  {o.customer}
                  <div className="muted blk-sub">
                    {o.items} {o.items === 1 ? 'item' : 'items'}
                  </div>
                </td>
                <td className="hide-sm muted">{when(o.placed)}</td>
                <td>
                  <Badge tone={TONE[o.status]} dot>
                    {o.status}
                  </Badge>
                </td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{money(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
