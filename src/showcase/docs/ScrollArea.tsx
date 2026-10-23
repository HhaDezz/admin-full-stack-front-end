import { Avatar, ScrollArea } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './ScrollArea.tsx?raw';

const people = [
  'Amara Perera',
  'Ben Cohen',
  'Chen Wei',
  'Dilan Silva',
  'Elena García',
  'Farah Khan',
  'Gus Müller',
  'Hana Sato',
  'Ivan Petrov',
  'Jade Okafor',
  'Kofi Mensah',
  'Lena Novak',
];

// #region basic
export function Basic() {
  return (
    <div className="card ex-col" style={{ padding: 0 }}>
      <ScrollArea maxHeight={240} aria-label="Team members">
        {people.map((p) => (
          <div key={p} className="list-row">
            <Avatar name={p} size="sm" />
            <span className="t">{p}</span>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'ScrollArea',
  group: 'Layout',
  status: 'new',
  description: 'A scroll box with a slim scrollbar and soft shadows that show there is more above or below.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'maxHeight', default: 200, min: 100, max: 400, step: 20 },
      { type: 'boolean', name: 'shadows', default: true },
      { type: 'number', name: 'rows', default: 12, min: 2, max: 30 },
    ],
    render: (v) => (
      <div style={{ width: 'min(320px, 100%)' }} className="card">
        <ScrollArea maxHeight={Number(v.maxHeight)} shadows={!!v.shadows} aria-label="Playground list">
          {Array.from({ length: Number(v.rows) }, (_, i) => (
            <div key={i} style={{ padding: '8px 14px', borderBottom: '1px solid var(--line)' }}>
              Row {i + 1}
            </div>
          ))}
        </ScrollArea>
      </div>
    ),
    code: ({ rows: _r, ...p }) => jsx('ScrollArea', p, { maxHeight: 0, shadows: true }, '\n  …\n', ['aria-label="Members"']),
  },
  examples: [
    {
      id: 'basic',
      title: 'List with edge shadows',
      description: 'Scroll it: the top shadow appears once you leave the top, the bottom one disappears at the end.',
      Component: Basic,
    },
  ],
  a11y: ['With an aria-label it becomes a focusable region, so keyboard users can scroll it with the arrow keys.'],
  props: [
    { name: 'maxHeight', type: 'number | string', defaultValue: '320', description: 'Height before scrolling.' },
    { name: 'shadows', type: 'boolean', defaultValue: 'true', description: 'Edge shadows.' },
    { name: 'aria-label', type: 'string', description: 'Name; makes it keyboard-scrollable.' },
  ],
});
