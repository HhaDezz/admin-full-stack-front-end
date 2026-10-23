import { Badge } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Badge.tsx?raw';

// #region tones
export function Tones() {
  return (
    <div className="ex-row">
      <Badge>Neutral</Badge>
      <Badge tone="brand">Brand</Badge>
      <Badge tone="ok">Active</Badge>
      <Badge tone="warn">Pending</Badge>
      <Badge tone="danger">Disabled</Badge>
      <Badge tone="info">Invited</Badge>
      <Badge tone="gold">Pro</Badge>
    </div>
  );
}
// #endregion

// #region variants
export function Variants() {
  return (
    <div className="ex-col" style={{ alignItems: 'center' }}>
      <div className="ex-row">
        <Badge tone="ok" variant="soft">
          Soft
        </Badge>
        <Badge tone="ok" variant="solid">
          Solid
        </Badge>
        <Badge tone="ok" variant="outline">
          Outline
        </Badge>
      </div>
      <div className="ex-row">
        <Badge tone="ok" dot>
          Online
        </Badge>
        <Badge tone="warn" dot>
          Away
        </Badge>
        <Badge tone="danger" dot size="sm">
          Offline
        </Badge>
      </div>
    </div>
  );
}
// #endregion

// #region seed
export function Seeded() {
  return (
    <div className="ex-row">
      {['Super Admin', 'Admin', 'Support', 'Finance', 'Editor', 'Viewer'].map((r) => (
        <Badge key={r} seed={r}>
          {r}
        </Badge>
      ))}
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Badge',
  group: 'Data display',
  status: 'updated',
  description: 'Short status labels in seven tones and three styles, with an optional dot. A seed gives any string its own stable colour.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'tone', options: ['neutral', 'brand', 'ok', 'warn', 'danger', 'info', 'gold'], default: 'ok' },
      { type: 'select', name: 'variant', options: ['soft', 'solid', 'outline'], default: 'soft' },
      { type: 'select', name: 'size', options: ['sm', 'md'], default: 'md' },
      { type: 'boolean', name: 'dot', default: true },
      { type: 'text', name: 'children', label: 'text', default: 'Active' },
    ],
    render: (v) => (
      <Badge tone={v.tone as 'ok'} variant={v.variant as 'soft'} size={v.size as 'md'} dot={!!v.dot}>
        {String(v.children)}
      </Badge>
    ),
    code: ({ children, ...p }) => jsx('Badge', p, { tone: 'neutral', variant: 'soft', size: 'md', dot: false }, String(children)),
  },
  examples: [
    { id: 'tones', title: 'Tones', description: 'Pick by meaning, not by colour.', Component: Tones },
    { id: 'variants', title: 'Styles and dots', description: 'Solid for the one badge that must stand out.', Component: Variants },
    {
      id: 'seed',
      title: 'Colour from a seed',
      description: 'Roles in the Users table use this: the same name always gets the same colour.',
      Component: Seeded,
    },
  ],
  props: [
    {
      name: 'tone',
      type: "'neutral' | 'brand' | 'ok' | 'warn' | 'danger' | 'info' | 'gold'",
      defaultValue: "'neutral'",
      description: 'Meaning and colour.',
    },
    { name: 'variant', type: "'soft' | 'solid' | 'outline'", defaultValue: "'soft'", description: 'Style.' },
    { name: 'size', type: "'sm' | 'md'", defaultValue: "'md'", description: 'Height.' },
    { name: 'dot', type: 'boolean', defaultValue: 'false', description: 'Leading status dot.' },
    { name: 'seed', type: 'string', description: 'Stable hue from a string; overrides tone.' },
  ],
});
