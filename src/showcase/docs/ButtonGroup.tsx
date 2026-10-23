import { AlignCenter, AlignLeft, AlignRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, ButtonGroup, IconButton } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './ButtonGroup.tsx?raw';

// #region attached
export function Attached() {
  return (
    <div className="ex-row">
      <ButtonGroup aria-label="Period">
        <Button>Day</Button>
        <Button>Week</Button>
        <Button>Month</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Alignment">
        <IconButton variant="secondary" label="Align left" icon={<AlignLeft size={17} />} />
        <IconButton variant="secondary" label="Align centre" icon={<AlignCenter size={17} />} />
        <IconButton variant="secondary" label="Align right" icon={<AlignRight size={17} />} />
      </ButtonGroup>
      <ButtonGroup aria-label="Navigate">
        <Button iconStart={<ChevronLeft size={16} className="flip-rtl" />}>Previous</Button>
        <Button iconEnd={<ChevronRight size={16} className="flip-rtl" />}>Next</Button>
      </ButtonGroup>
    </div>
  );
}
// #endregion

// #region spaced
export function Spaced() {
  return (
    <div className="ex-row">
      <ButtonGroup attached={false} aria-label="Form actions">
        <Button>Cancel</Button>
        <Button variant="primary">Save</Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical" aria-label="Sort">
        <Button>Newest first</Button>
        <Button>Oldest first</Button>
        <Button>A – Z</Button>
      </ButtonGroup>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'ButtonGroup',
  group: 'Buttons & actions',
  status: 'new',
  description: 'Joins related buttons into one control, horizontally or vertically, or lays them out with a gap.',
  raw,
  playground: {
    controls: [
      { type: 'boolean', name: 'attached', default: true },
      { type: 'select', name: 'orientation', options: ['horizontal', 'vertical'], default: 'horizontal' },
      { type: 'select', name: 'size', label: 'button size', options: ['sm', 'md', 'lg'], default: 'md' },
    ],
    render: (v) => (
      <ButtonGroup attached={!!v.attached} orientation={v.orientation as 'horizontal'} aria-label="Text alignment">
        <Button size={v.size as 'md'}>Left</Button>
        <Button size={v.size as 'md'}>Center</Button>
        <Button size={v.size as 'md'}>Right</Button>
      </ButtonGroup>
    ),
    code: ({ size, ...p }) =>
      jsx(
        'ButtonGroup',
        p,
        { attached: true, orientation: 'horizontal' },
        `\n  <Button${size === 'md' ? '' : ` size="${size}"`}>Left</Button>\n  …\n`,
        ['aria-label="Text alignment"'],
      ),
  },
  examples: [
    {
      id: 'attached',
      title: 'Attached',
      description: 'Shared borders and rounded outer corners. Works with Button and IconButton.',
      Component: Attached,
    },
    {
      id: 'spaced',
      title: 'Spaced and vertical',
      description: 'attached={false} keeps a gap; orientation="vertical" stacks them.',
      Component: Spaced,
    },
  ],
  a11y: [
    'Renders role="group"; give it an aria-label that names the set.',
    'For a choice between options (only one active), use ToggleGroup instead.',
  ],
  props: [
    { name: 'attached', type: 'boolean', defaultValue: 'true', description: 'Join the edges.' },
    { name: 'orientation', type: "'horizontal' | 'vertical'", defaultValue: "'horizontal'", description: 'Direction.' },
    { name: 'aria-label', type: 'string', description: 'Name of the group.' },
  ],
});
