import { Badge, CopyButton, DescriptionList } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './DescriptionList.tsx?raw';

// #region stacked
export function Stacked() {
  return (
    <div className="ex-wide" style={{ maxWidth: 680 }}>
      <DescriptionList
        columns={3}
        items={[
          { term: 'Name', details: 'Grace Hopper' },
          { term: 'Email', details: 'grace@example.com' },
          {
            term: 'Status',
            details: (
              <Badge tone="ok" dot>
                Active
              </Badge>
            ),
          },
          { term: 'Roles', details: 'Admin, Support' },
          { term: 'Last sign-in', details: 'Today, 09:42' },
          { term: 'Phone', details: null },
          { term: 'Address', details: '1 Navy Yard, Arlington, VA', full: true },
        ]}
      />
    </div>
  );
}
// #endregion

// #region bordered
export function Bordered() {
  return (
    <div className="ex-wide" style={{ maxWidth: 680 }}>
      <DescriptionList
        bordered
        layout="inline"
        items={[
          { term: 'Request ID', details: <span className="mono">a91f-22c0</span> },
          { term: 'Method', details: 'PUT' },
          { term: 'Path', details: <span className="mono">/roles/4/permissions</span> },
          { term: 'Status', details: <Badge tone="ok">200</Badge> },
          {
            term: 'Token',
            full: true,
            details: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="mono">sk_live_••••••••3f9a</span> <CopyButton value="sk_live_example_3f9a" label="Copy token" />
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'DescriptionList',
  group: 'Data display',
  status: 'new',
  description: 'Label and value pairs for detail views (a user, an order, an audit entry) in one to three columns.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'columns', options: ['1', '2', '3'], default: '2' },
      { type: 'select', name: 'layout', options: ['stacked', 'inline'], default: 'stacked' },
      { type: 'boolean', name: 'bordered', default: false },
    ],
    render: (v) => (
      <div style={{ width: '100%' }}>
        <DescriptionList
          columns={Number(v.columns) as 2}
          layout={v.layout as 'stacked'}
          bordered={!!v.bordered}
          items={[
            { term: 'Name', details: 'Grace Hopper' },
            { term: 'Email', details: 'grace@example.com' },
            { term: 'Role', details: <Badge tone="brand">Admin</Badge> },
            { term: 'Joined', details: 'Oct 2, 2026' },
            { term: 'Notes', details: 'Leads the platform team. Prefers email.', full: true },
          ]}
        />
      </div>
    ),
    code: ({ columns, ...p }) =>
      jsx('DescriptionList', { ...p, columns: Number(columns) }, { columns: 1, layout: 'stacked', bordered: false }, undefined, [
        'items={items}',
      ]),
  },
  examples: [
    {
      id: 'stacked',
      title: 'Stacked, three columns',
      description: 'Empty values show a dash; full spans the row. Phones always get one column.',
      Component: Stacked,
    },
    {
      id: 'bordered',
      title: 'Bordered, inline',
      description: 'Label beside value, the style the audit log entry uses.',
      Component: Bordered,
    },
  ],
  a11y: ['Renders a real <dl> with <dt> and <dd>, so screen readers announce each pair together.'],
  props: [
    { name: 'items', type: '{ term, details, full? }[]', description: 'The pairs.' },
    { name: 'columns', type: '1 | 2 | 3', defaultValue: '2', description: 'Columns on wide screens.' },
    { name: 'layout', type: "'stacked' | 'inline'", defaultValue: "'stacked'", description: 'Label above or beside.' },
    { name: 'bordered', type: 'boolean', defaultValue: 'false', description: 'Boxed cells.' },
  ],
});
