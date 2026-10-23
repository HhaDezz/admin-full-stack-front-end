import { Plus, Upload } from 'lucide-react';
import { Button, EmptyState, Grid } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './EmptyState.tsx?raw';

// #region illustrated
export function Illustrated() {
  return (
    <Grid columns={{ base: 1, md: 2 }} gap={4}>
      <div className="card">
        <EmptyState
          illustration="inbox"
          title="No orders yet"
          description="New orders appear here as soon as customers check out."
          actions={
            <Button variant="primary" iconStart={<Plus size={16} />}>
              Create an order
            </Button>
          }
        />
      </div>
      <div className="card">
        <EmptyState
          illustration="search"
          title="Nothing matches “zebra”"
          description="Check the spelling or clear the filters."
          actions={<Button>Clear filters</Button>}
        />
      </div>
      <div className="card">
        <EmptyState
          illustration="folder"
          title="This folder is empty"
          actions={<Button iconStart={<Upload size={16} />}>Upload files</Button>}
        />
      </div>
      <div className="card">
        <EmptyState illustration="lock" title="Private project" description="Ask the owner to share it with you." />
      </div>
    </Grid>
  );
}
// #endregion

export default defineDoc({
  name: 'EmptyState',
  group: 'Feedback',
  status: 'updated',
  imports: ['EmptyState', 'Illustration'],
  description:
    'What to show when there’s nothing to show: a line illustration (or icon), a title, a hint and the next action. Illustrations follow the theme colours.',
  raw,
  playground: {
    controls: [
      {
        type: 'select',
        name: 'illustration',
        options: ['search', 'inbox', 'folder', 'lock', 'error', 'success', 'tools', 'rocket', 'lost'],
        default: 'inbox',
      },
      { type: 'text', name: 'title', default: 'No invoices yet' },
      { type: 'text', name: 'description', default: 'Invoices you send will appear here.' },
      { type: 'boolean', name: 'actions', default: true },
      { type: 'boolean', name: 'compact', default: false },
    ],
    render: (v) => (
      <EmptyState
        illustration={v.illustration as 'inbox'}
        title={String(v.title)}
        description={String(v.description) || undefined}
        compact={!!v.compact}
        headingLevel={3}
        actions={v.actions ? <Button variant="primary">New invoice</Button> : undefined}
      />
    ),
    code: ({ actions, ...p }) =>
      jsx(
        'EmptyState',
        p,
        { compact: false, description: '' },
        undefined,
        actions ? ['actions={<Button variant="primary">New invoice</Button>}'] : [],
      ),
  },
  examples: [
    {
      id: 'illustrated',
      title: 'Illustrated',
      description: 'Nine illustrations: search, inbox, folder, lock, error, success, tools, rocket, lost.',
      Component: Illustrated,
    },
  ],
  props: [
    { name: 'title', type: 'ReactNode', description: 'What’s empty.' },
    { name: 'description', type: 'ReactNode', description: 'Why, and what to do.' },
    { name: 'illustration', type: 'IllustrationName', description: 'Line drawing…' },
    { name: 'icon', type: 'ReactNode', description: '…or a small icon tile.' },
    { name: 'actions', type: 'ReactNode', description: 'Buttons.' },
    { name: 'headingLevel', type: '2 | 3 | 4', defaultValue: '4', description: 'Heading level of the title, to fit the page outline.' },
    { name: 'compact', type: 'boolean', defaultValue: 'false', description: 'Less padding.' },
  ],
});
