import { Grid } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Grid.tsx?raw';

// #region columns
export function Columns() {
  return (
    <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={3}>
      {['Revenue', 'Orders', 'Customers', 'Refunds'].map((t) => (
        <div key={t} className="demo-box-fill">
          {t}
        </div>
      ))}
    </Grid>
  );
}
// #endregion

// #region auto
export function AutoFit() {
  return (
    <Grid minChildWidth={160} gap={3}>
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="demo-box-fill">
          Card {i + 1}
        </div>
      ))}
    </Grid>
  );
}
// #endregion

export default defineDoc({
  name: 'Grid',
  group: 'Layout',
  status: 'new',
  description: 'CSS grid with a column count per breakpoint, or as many columns as fit a minimum width.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'mode', options: ['columns', 'minChildWidth'], default: 'columns' },
      { type: 'number', name: 'columns', default: 3, min: 1, max: 6 },
      { type: 'number', name: 'minChildWidth', default: 160, min: 80, max: 320, step: 20 },
      { type: 'number', name: 'gap', default: 4, min: 0, max: 10 },
      { type: 'number', name: 'items', default: 6, min: 1, max: 12 },
    ],
    render: (v) => (
      <div style={{ width: '100%' }}>
        <Grid
          columns={v.mode === 'columns' ? Number(v.columns) : undefined}
          minChildWidth={v.mode === 'minChildWidth' ? Number(v.minChildWidth) : undefined}
          gap={Number(v.gap)}
        >
          {Array.from({ length: Number(v.items) }, (_, i) => (
            <div key={i} className="demo-box-fill">
              {i + 1}
            </div>
          ))}
        </Grid>
      </div>
    ),
    code: ({ mode, columns, minChildWidth, gap }) =>
      jsx('Grid', mode === 'columns' ? { columns, gap } : { minChildWidth, gap }, { columns: 1, gap: 4 }, '\n  …\n'),
  },
  examples: [
    { id: 'columns', title: 'Columns per breakpoint', description: '1 on phones, 2 from 640 px, 4 from 1024 px.', Component: Columns },
    {
      id: 'auto',
      title: 'Auto-fit',
      description: 'minChildWidth fills each row with as many 160 px+ columns as fit; no media queries needed.',
      Component: AutoFit,
    },
  ],
  props: [
    { name: 'columns', type: 'Responsive<number>', defaultValue: '1', description: 'Column count, per breakpoint.' },
    { name: 'minChildWidth', type: 'number', description: 'Auto-fill columns at least this wide (px). Overrides columns.' },
    { name: 'gap', type: 'Responsive<number | string>', defaultValue: '4', description: 'Steps of 4 px, or any CSS length.' },
    { name: 'align', type: 'CSS', description: 'align-items.' },
    { name: 'as', type: 'ElementType', defaultValue: "'div'", description: 'Element to render.' },
  ],
});
