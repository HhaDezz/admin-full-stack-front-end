import { Button, Divider } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Divider.tsx?raw';

// #region kinds
export function Kinds() {
  return (
    <div className="ex-col">
      <p>Above a plain divider.</p>
      <Divider />
      <Divider label="or continue with" />
      <Button fullWidth>Single sign-on</Button>
      <Divider dashed />
      <div className="ex-row">
        <span>Edit</span>
        <Divider orientation="vertical" />
        <span>Duplicate</span>
        <Divider orientation="vertical" />
        <span>Archive</span>
      </div>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Divider',
  group: 'Layout',
  status: 'new',
  description: 'Horizontal or vertical rule, with an optional label in the middle.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'orientation', options: ['horizontal', 'vertical'], default: 'horizontal' },
      { type: 'text', name: 'label', default: 'or' },
      { type: 'boolean', name: 'dashed', default: false },
    ],
    render: (v) =>
      v.orientation === 'vertical' ? (
        <div className="ex-row" style={{ height: 40 }}>
          <span>Edit</span>
          <Divider orientation="vertical" dashed={!!v.dashed} />
          <span>Share</span>
        </div>
      ) : (
        <div style={{ width: 'min(420px, 100%)' }}>
          <Divider label={String(v.label) || undefined} dashed={!!v.dashed} />
        </div>
      ),
    code: (p) => jsx('Divider', p, { orientation: 'horizontal', label: '', dashed: false }),
  },
  examples: [
    {
      id: 'kinds',
      title: 'Plain, labelled, dashed and vertical',
      description: 'Vertical dividers stretch to the height of their row.',
      Component: Kinds,
    },
  ],
  props: [
    { name: 'orientation', type: "'horizontal' | 'vertical'", defaultValue: "'horizontal'", description: 'Direction.' },
    { name: 'label', type: 'ReactNode', description: 'Text in the middle (horizontal only).' },
    { name: 'dashed', type: 'boolean', defaultValue: 'false', description: 'Dashed line.' },
  ],
});
