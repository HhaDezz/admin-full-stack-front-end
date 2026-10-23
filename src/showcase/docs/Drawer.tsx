import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button, Checkbox, Drawer, Field, RadioGroup, Stack } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Drawer.tsx?raw';

// #region filters
export function Filters() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(true);
  const [invited, setInvited] = useState(false);
  return (
    <>
      <Button iconStart={<SlidersHorizontal size={16} />} onClick={() => setOpen(true)}>
        Filters
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filter users"
        subtitle="Narrow the list without leaving the page."
        size="sm"
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Reset</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Apply
            </Button>
          </>
        }
      >
        <Field label="Status">
          <Stack gap={3}>
            <Checkbox label="Active" checked={active} onChange={setActive} />
            <Checkbox label="Invited" checked={invited} onChange={setInvited} />
          </Stack>
        </Field>
        <RadioGroup
          label="Joined"
          defaultValue="any"
          options={[
            { value: 'any', label: 'Any time' },
            { value: '30', label: 'Last 30 days' },
            { value: '365', label: 'Last year' },
          ]}
        />
      </Drawer>
    </>
  );
}
// #endregion

// #region sides
export function Sides() {
  const [side, setSide] = useState<'left' | 'right' | 'bottom' | null>(null);
  return (
    <div className="ex-row">
      {(['left', 'right', 'bottom'] as const).map((s) => (
        <Button key={s} onClick={() => setSide(s)}>
          From {s}
        </Button>
      ))}
      <Drawer open={side !== null} side={side ?? 'right'} title={`From the ${side ?? ''}`} onClose={() => setSide(null)}>
        <p className="muted">Bottom drawers suit phones: they rise like a sheet.</p>
      </Drawer>
    </div>
  );
}
// #endregion

function DrawerPlayground(v: Record<string, string | number | boolean>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={String(v.title)}
        side={v.side as 'right'}
        size={v.size as 'md'}
        locked={!!v.locked}
        footer={
          v.footer ? (
            <Button variant="primary" onClick={() => setOpen(false)}>
              Apply
            </Button>
          ) : undefined
        }
      >
        <p className="muted">{v.locked ? 'Locked: Esc and the backdrop don’t close it.' : 'Press Esc or click outside to close.'}</p>
      </Drawer>
    </>
  );
}

export default defineDoc({
  name: 'Drawer',
  group: 'Overlays',
  status: 'new',
  description: 'A panel that slides in from the edge for filters, details or quick edits, keeping the page in view behind it.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'side', options: ['right', 'left', 'bottom'], default: 'right' },
      { type: 'select', name: 'size', options: ['sm', 'md', 'lg'], default: 'md' },
      { type: 'text', name: 'title', default: 'Filters' },
      { type: 'boolean', name: 'footer', default: true },
      { type: 'boolean', name: 'locked', default: false },
    ],
    render: (v) => <DrawerPlayground {...v} />,
    code: ({ footer, ...p }) =>
      jsx('Drawer', p, { side: 'right', size: 'md', locked: false }, '\n  …\n', [
        'open={open}',
        'onClose={() => setOpen(false)}',
        ...(footer ? ['footer={<Button variant="primary">Apply</Button>}'] : []),
      ]),
  },
  examples: [
    { id: 'filters', title: 'Filter panel', description: 'Header, scrolling body and sticky footer.', Component: Filters },
    { id: 'sides', title: 'Left, right or bottom', description: 'Sizes sm (360), md (480), lg (720).', Component: Sides },
  ],
  keyboard: [['Esc', 'Close']],
  a11y: [
    'Same dialog behaviour as Modal: aria-modal, focus trap, focus returned on close, scroll lock.',
    'In right-to-left layouts the right drawer opens from the left edge.',
  ],
  props: [
    { name: 'open / onClose', type: 'boolean / () => void', description: 'State.' },
    { name: 'title / subtitle', type: 'string / ReactNode', description: 'Header.' },
    { name: 'side', type: "'right' | 'left' | 'bottom'", defaultValue: "'right'", description: 'Edge.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", description: 'Width.' },
    { name: 'footer / locked', type: 'ReactNode / boolean', description: 'As Modal.' },
  ],
});
