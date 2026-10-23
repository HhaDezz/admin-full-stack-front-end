import { Info } from 'lucide-react';
import { Button, Kbd, Tooltip } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Tooltip.tsx?raw';

// #region sides
export function Sides() {
  return (
    <div className="ex-row">
      {(['top', 'right', 'bottom', 'left'] as const).map((s) => (
        <Tooltip key={s} content={`On the ${s}`} side={s}>
          <Button>{s}</Button>
        </Tooltip>
      ))}
    </div>
  );
}
// #endregion

// #region rich
export function Rich() {
  return (
    <div className="ex-row">
      <Tooltip
        content={
          <>
            Search everything <Kbd keys={['mod', 'K']} />
          </>
        }
      >
        <Button>Search</Button>
      </Tooltip>
      <Tooltip content="Billed on the 1st of each month. Prices exclude VAT.">
        <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label="About billing">
          <Info size={16} />
        </button>
      </Tooltip>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Tooltip',
  group: 'Overlays',
  status: 'new',
  description: 'Short help that appears on hover and keyboard focus. Positions itself on any side and flips at the screen edge.',
  raw,
  playground: {
    controls: [
      { type: 'text', name: 'content', default: 'Copy invite link' },
      { type: 'select', name: 'side', options: ['top', 'bottom', 'left', 'right'], default: 'top' },
      { type: 'select', name: 'align', options: ['start', 'center', 'end'], default: 'center' },
      { type: 'number', name: 'delay', default: 350, min: 0, max: 1000, step: 50 },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <Tooltip
        content={String(v.content)}
        side={v.side as 'top'}
        align={v.align as 'center'}
        delay={Number(v.delay)}
        disabled={!!v.disabled}
      >
        <Button>Hover or focus me</Button>
      </Tooltip>
    ),
    code: (p) =>
      jsx('Tooltip', p, { side: 'top', align: 'center', delay: 350, disabled: false }, '\n  <Button>Hover or focus me</Button>\n'),
  },
  examples: [
    { id: 'sides', title: 'Sides', description: 'Hover, or Tab to focus — focus shows it straight away.', Component: Sides },
    { id: 'rich', title: 'With shortcuts', description: 'Content can include Kbd and short text.', Component: Rich },
  ],
  keyboard: [['Esc', 'Hide the tooltip']],
  a11y: [
    'The trigger is linked to the tooltip with aria-describedby; the tooltip has role="tooltip".',
    'Not shown on touch — don’t put essential information only in a tooltip.',
  ],
  props: [
    { name: 'content', type: 'ReactNode', description: 'What to show.' },
    { name: 'children', type: 'ReactElement', description: 'A focusable element.' },
    { name: 'side / align', type: 'Side / Align', defaultValue: "'top' / 'center'", description: 'Placement.' },
    { name: 'delay', type: 'number', defaultValue: '350', description: 'Hover delay in ms.' },
    { name: 'disabled', type: 'boolean', description: 'Turn it off.' },
  ],
});
