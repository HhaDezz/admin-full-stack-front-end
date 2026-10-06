/**
 * Top products: best sellers with units, revenue and a 7-day trend.
 * Uses: Card, List, Sparkline.
 */
import { Sparkline } from '@/components/charts';
import { Card, List } from '@/components/kit';
import { PRODUCTS, money } from '../_data';

export default function TopProducts() {
  return (
    <Card headingLevel={2} title="Top products" description="By revenue this month" padding="sm">
      <List
        aria-label="Top products"
        variant="plain"
        items={PRODUCTS.map((p, i) => ({
          id: p.id,
          leading: (
            <span className="blk-rank" aria-hidden="true">
              {i + 1}
            </span>
          ),
          title: p.name,
          description: `${p.sku} · ${p.sold} sold`,
          meta: (
            <span className="blk-product-meta">
              <Sparkline data={p.trend} width={64} height={24} tone={p.trend[6] >= p.trend[0] ? 'brand' : 'danger'} />
              <b>{money(p.revenue)}</b>
            </span>
          ),
        }))}
      />
    </Card>
  );
}
