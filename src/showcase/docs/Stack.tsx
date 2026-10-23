import { Button, Stack } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Stack.tsx?raw';

// #region basic
export function Basic() {
  return (
    <Stack gap={2}>
      <div className="demo-box-fill">One</div>
      <div className="demo-box-fill">Two</div>
      <div className="demo-box-fill">Three</div>
    </Stack>
  );
}
// #endregion

// #region responsive
export function Responsive() {
  return (
    <Stack direction={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 4 }} align="stretch">
      <div className="demo-box-fill" style={{ flex: 1 }}>
        Column on phones
      </div>
      <div className="demo-box-fill" style={{ flex: 1 }}>
        Row from 768 px
      </div>
      <div className="demo-box-fill" style={{ flex: 1 }}>
        Gap grows too
      </div>
    </Stack>
  );
}
// #endregion

// #region toolbar
export function Toolbar() {
  return (
    <Stack direction="row" gap={2} justify="space-between" align="center" wrap>
      <strong>3 selected</strong>
      <Stack direction="row" gap={2}>
        <Button size="sm">Export</Button>
        <Button size="sm" variant="danger">
          Delete
        </Button>
      </Stack>
    </Stack>
  );
}
// #endregion

export default defineDoc({
  name: 'Stack',
  group: 'Layout',
  status: 'new',
  description: 'Flexbox row or column with gaps from the spacing scale. Direction and gap can change at each breakpoint.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'direction', options: ['row', 'column'], default: 'row' },
      { type: 'number', name: 'gap', default: 3, min: 0, max: 10 },
      { type: 'select', name: 'align', options: ['stretch', 'flex-start', 'center', 'flex-end'], default: 'center' },
      { type: 'select', name: 'justify', options: ['flex-start', 'center', 'space-between', 'flex-end'], default: 'flex-start' },
      { type: 'boolean', name: 'wrap', default: false },
    ],
    render: (v) => (
      <div style={{ width: '100%' }}>
        <Stack direction={v.direction as 'row'} gap={Number(v.gap)} align={String(v.align)} justify={String(v.justify)} wrap={!!v.wrap}>
          <Button>One</Button>
          <Button>Two</Button>
          <Button variant="primary">Three</Button>
        </Stack>
      </div>
    ),
    code: (p) => jsx('Stack', p, { direction: 'column', gap: 3, align: 'stretch', justify: 'flex-start', wrap: false }, '\n  …\n'),
  },
  examples: [
    { id: 'basic', title: 'Vertical', description: 'gap={2} is 8 px (steps of 4 px).', Component: Basic },
    {
      id: 'responsive',
      title: 'Responsive',
      description: 'Resize the window: column on small screens, row from md (768 px).',
      Component: Responsive,
    },
    { id: 'toolbar', title: 'Toolbar row', description: 'justify, align and wrap pass straight to flexbox.', Component: Toolbar },
  ],
  props: [
    {
      name: 'direction',
      type: "Responsive<'row' | 'column'>",
      defaultValue: "'column'",
      description: 'One value or { base, sm, md, lg, xl }.',
    },
    { name: 'gap', type: 'Responsive<number | string>', defaultValue: '3', description: 'Steps of 4 px, or any CSS length.' },
    { name: 'align / justify', type: 'CSS', description: 'align-items and justify-content.' },
    { name: 'wrap', type: 'boolean', defaultValue: 'false', description: 'Allow wrapping.' },
    { name: 'as', type: 'ElementType', defaultValue: "'div'", description: 'Render as ul, section, form…' },
  ],
});
