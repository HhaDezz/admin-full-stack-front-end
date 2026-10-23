import { Button, Divider, Section, Switch } from '@/components/kit';
import { useState } from 'react';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Section.tsx?raw';

// #region basic
export function Basic() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <div className="ex-wide">
      <Section
        id="email-demo"
        title="Email preferences"
        description="Choose what we email you about."
        actions={<Button size="sm">Reset</Button>}
        card
      >
        <Switch labelFirst checked={a} onChange={setA} label="Security alerts" description="New sign-ins and password changes." />
        <Divider />
        <Switch labelFirst checked={b} onChange={setB} label="Weekly summary" description="Every Monday at 9:00." />
      </Section>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Section',
  group: 'Layout',
  status: 'new',
  description: 'A titled block within a page, optionally in a card. Ideal for settings screens.',
  raw,
  playground: {
    controls: [
      { type: 'text', name: 'title', default: 'Notifications' },
      { type: 'text', name: 'description', default: 'Choose what you hear about.' },
      { type: 'boolean', name: 'card', default: true },
      { type: 'boolean', name: 'actions', default: false },
    ],
    render: (v) => (
      <div style={{ width: '100%' }}>
        <Section
          title={String(v.title) || undefined}
          description={String(v.description) || undefined}
          card={!!v.card}
          actions={v.actions ? <Button size="sm">Reset</Button> : undefined}
        >
          <p className="muted" style={{ margin: 0 }}>
            Section content.
          </p>
        </Section>
      </div>
    ),
    code: ({ actions, ...p }) =>
      jsx(
        'Section',
        p,
        { title: '', description: '', card: false },
        '\n  …\n',
        actions ? ['actions={<Button size="sm">Reset</Button>}'] : [],
      ),
  },
  examples: [
    {
      id: 'basic',
      title: 'Settings section',
      description: 'Title, help text and an action, with the content in a card.',
      Component: Basic,
    },
  ],
  a11y: ['Renders <section> labelled by its <h2> when you give it an id.'],
  props: [
    { name: 'title / description', type: 'ReactNode', description: 'Heading (h2) and help text.' },
    { name: 'actions', type: 'ReactNode', description: 'Buttons on the right.' },
    { name: 'card', type: 'boolean', defaultValue: 'false', description: 'Wrap the content in a padded card.' },
    { name: 'id', type: 'string', description: 'Anchor id; also links the heading.' },
  ],
});
