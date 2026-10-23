import { Download, Plus } from 'lucide-react';
import { Badge, Breadcrumbs, Button, PageHeader } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './PageHeader.tsx?raw';

// #region basic
export function Basic() {
  return (
    <div className="ex-wide">
      <PageHeader
        headingLevel={3}
        eyebrow={<Breadcrumbs items={[{ label: 'Settings', to: '/ui' }, { label: 'Team' }]} />}
        title="Team members"
        description="Invite people, change their roles and remove access."
        actions={
          <>
            <Button iconStart={<Download size={16} />}>Export</Button>
            <Button variant="primary" iconStart={<Plus size={16} />}>
              Invite
            </Button>
          </>
        }
      />
    </div>
  );
}
// #endregion

// #region back
export function WithBack() {
  return (
    <div className="ex-wide">
      <PageHeader
        headingLevel={3}
        back={{ to: '/ui', label: 'All invoices' }}
        title={
          <>
            Invoice #1042 <Badge tone="warn">Overdue</Badge>
          </>
        }
        description="Due 12 October · Acme Ltd"
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'PageHeader',
  group: 'Layout',
  status: 'new',
  description:
    'Title, description, breadcrumbs and actions for the top of a page. Can stick under the top bar with a shadow once the page scrolls.',
  raw,
  playground: {
    controls: [
      { type: 'text', name: 'title', default: 'Customers' },
      { type: 'text', name: 'description', default: 'Everyone who has ordered in the last two years.' },
      { type: 'text', name: 'eyebrow', default: '' },
      { type: 'boolean', name: 'back', default: false },
      { type: 'boolean', name: 'actions', default: true },
      { type: 'select', name: 'headingLevel', options: ['1', '2', '3'], default: '2' },
    ],
    render: (v) => (
      <div style={{ width: '100%' }}>
        <PageHeader
          title={String(v.title)}
          description={String(v.description) || undefined}
          eyebrow={String(v.eyebrow) || undefined}
          back={v.back ? { to: '/ui', label: 'UI Kit' } : undefined}
          headingLevel={Number(v.headingLevel) as 2}
          actions={
            v.actions ? (
              <Button variant="primary" iconStart={<Plus size={16} />}>
                New customer
              </Button>
            ) : undefined
          }
        />
      </div>
    ),
    code: ({ back, actions, headingLevel, ...p }) =>
      jsx('PageHeader', { ...p, headingLevel: Number(headingLevel) }, { description: '', eyebrow: '', headingLevel: 1 }, undefined, [
        ...(back ? ["back={{ to: '/customers', label: 'Customers' }}"] : []),
        ...(actions ? ['actions={<Button variant="primary">New customer</Button>}'] : []),
      ]),
  },
  examples: [
    {
      id: 'basic',
      title: 'With breadcrumbs and actions',
      description: 'Actions wrap under the title on narrow screens.',
      Component: Basic,
    },
    { id: 'back', title: 'With a back link', description: 'For detail pages.', Component: WithBack },
  ],
  a11y: ['The title is the page’s only <h1>.', 'Breadcrumbs render as a labelled nav landmark.'],
  props: [
    { name: 'title', type: 'ReactNode', description: 'Page title (h1).' },
    { name: 'description', type: 'ReactNode', description: 'Line under the title.' },
    { name: 'actions', type: 'ReactNode', description: 'Buttons on the right.' },
    { name: 'eyebrow', type: 'ReactNode', description: 'Above the title, e.g. Breadcrumbs.' },
    { name: 'back', type: '{ to, label }', description: 'Back link.' },
    { name: 'sticky', type: 'boolean', defaultValue: 'false', description: 'Stick under the top bar while scrolling.' },
  ],
});
