import { Home } from 'lucide-react';
import { Breadcrumbs } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Breadcrumbs.tsx?raw';

// #region basic
export function Basic() {
  return (
    <div className="ex-col">
      <Breadcrumbs
        items={[{ label: 'Home', to: '/', icon: <Home size={14} /> }, { label: 'Users', to: '/users' }, { label: 'Ada Lovelace' }]}
        aria-label="Breadcrumb, short"
      />
      <Breadcrumbs
        aria-label="Breadcrumb, collapsed"
        maxItems={4}
        items={[
          { label: 'Workspace', to: '/' },
          { label: 'Projects', to: '/ui' },
          { label: 'Spring 2027', to: '/ui' },
          { label: 'Patterns', to: '/ui' },
          { label: 'Jackets', to: '/ui' },
          { label: 'Field jacket' },
        ]}
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Breadcrumbs',
  group: 'Navigation',
  status: 'new',
  description: 'Shows where a page sits. Long trails collapse their middle into “…”, which expands on click.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'depth', default: 5, min: 1, max: 7 },
      { type: 'number', name: 'maxItems', default: 4, min: 2, max: 7 },
      { type: 'select', name: 'separator', options: ['›', '/', '·'], default: '›' },
    ],
    render: (v) => (
      <Breadcrumbs
        maxItems={Number(v.maxItems)}
        separator={v.separator === '›' ? undefined : String(v.separator)}
        items={['Home', 'Settings', 'Team', 'Roles', 'Support', 'Permissions', 'Audit'].slice(0, Number(v.depth)).map((label, i, a) => ({
          label,
          to: i < a.length - 1 ? '#' : undefined,
        }))}
      />
    ),
    code: ({ depth: _d, ...p }) => jsx('Breadcrumbs', p, { maxItems: 4, separator: '›' }, undefined, ['items={crumbs}']),
  },
  examples: [{ id: 'basic', title: 'Short and collapsed', description: 'The last crumb is the current page.', Component: Basic }],
  a11y: [
    'A nav landmark labelled “Breadcrumb” with an ordered list; the current page has aria-current="page"; separators are hidden from screen readers.',
  ],
  props: [
    { name: 'items', type: 'Crumb[]', description: '{ label, to?, icon? }' },
    { name: 'maxItems', type: 'number', defaultValue: '4', description: 'Collapse beyond this.' },
    { name: 'separator', type: 'ReactNode', defaultValue: '›', description: 'Between crumbs.' },
  ],
});
