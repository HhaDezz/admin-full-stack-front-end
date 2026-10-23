import { MoreHorizontal, Settings } from 'lucide-react';
import { AvatarGroup, Badge, Button, Card, IconButton, Progress } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Card.tsx?raw';

// #region basic
export function Basic() {
  return (
    <div className="ex-col">
      <Card
        title="Storage"
        description="Shared across your workspace."
        actions={<IconButton label="Storage settings" icon={<Settings size={16} />} size="sm" />}
      >
        <Progress value={68} label="34 GB of 50 GB" showValue />
      </Card>
    </div>
  );
}
// #endregion

// #region footer
export function WithFooter() {
  return (
    <div className="ex-col">
      <Card
        title="Website redesign"
        description="Due 14 November"
        actions={
          <Badge tone="warn" dot>
            At risk
          </Badge>
        }
        footer={
          <>
            <AvatarGroup
              people={[
                { name: 'Ada Lovelace' },
                { name: 'Grace Hopper' },
                { name: 'Alan Turing' },
                { name: 'Katherine Johnson' },
                { name: 'Linus Torvalds' },
              ]}
              max={3}
            />
            <span style={{ flex: 1 }} />
            <Button size="sm" variant="soft">
              Open
            </Button>
          </>
        }
      >
        <p className="muted">12 of 20 tasks done. Two are blocked on design review.</p>
      </Card>
    </div>
  );
}
// #endregion

// #region interactive
export function Interactive() {
  return (
    <div className="ex-row" style={{ alignItems: 'stretch' }}>
      {['Starter', 'Team', 'Enterprise'].map((plan, i) => (
        <div key={plan} style={{ width: 200 }}>
          <Card
            interactive
            title={plan}
            description={['Up to 3 users', 'Up to 25 users', 'Unlimited users'][i]}
            actions={<IconButton label={`${plan} options`} icon={<MoreHorizontal size={16} />} size="sm" />}
          >
            <div className="display" style={{ fontSize: 28 }}>
              {['$0', '$49', 'Talk to us'][i]}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Card',
  group: 'Data display',
  status: 'new',
  description: 'The surface most content sits on: a title row with actions, a body, an optional footer and edge-to-edge media.',
  raw,
  playground: {
    controls: [
      { type: 'text', name: 'title', default: 'Storage' },
      { type: 'text', name: 'description', default: '7.2 GB of 10 GB used' },
      { type: 'select', name: 'padding', options: ['none', 'sm', 'md', 'lg'], default: 'md' },
      { type: 'boolean', name: 'interactive', default: false },
      { type: 'boolean', name: 'actions', default: true },
      { type: 'boolean', name: 'footer', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(380px, 100%)' }}>
        <Card
          title={String(v.title) || undefined}
          description={String(v.description) || undefined}
          padding={v.padding as 'md'}
          interactive={!!v.interactive}
          actions={v.actions ? <Button size="sm">Upgrade</Button> : undefined}
          footer={v.footer ? <span className="muted">Updated a minute ago</span> : undefined}
        >
          <Progress value={72} label="Used" />
        </Card>
      </div>
    ),
    code: ({ actions, footer, ...p }) =>
      jsx('Card', p, { title: '', description: '', padding: 'md', interactive: false }, '\n  …\n', [
        ...(actions ? ['actions={<Button size="sm">Upgrade</Button>}'] : []),
        ...(footer ? ['footer={…}'] : []),
      ]),
  },
  examples: [
    {
      id: 'basic',
      title: 'Title and actions',
      description: 'Actions sit at the top right and wrap below the title on narrow screens.',
      Component: Basic,
    },
    {
      id: 'footer',
      title: 'With a footer',
      description: 'The footer is a flex row, so a spacer pushes buttons to the end.',
      Component: WithFooter,
    },
    {
      id: 'interactive',
      title: 'Interactive',
      description: 'Lifts on hover. Use it for cards that open something.',
      Component: Interactive,
    },
  ],
  props: [
    { name: 'title / description', type: 'ReactNode', description: 'Heading and subtext.' },
    { name: 'actions', type: 'ReactNode', description: 'Top-right buttons or a badge.' },
    { name: 'footer', type: 'ReactNode', description: 'Bottom row, separated by a line.' },
    { name: 'media', type: 'ReactNode', description: 'Image or chart across the top edge.' },
    { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", defaultValue: "'md'", description: 'Body padding; none for tables and lists.' },
    { name: 'interactive', type: 'boolean', defaultValue: 'false', description: 'Hover lift.' },
  ],
});
