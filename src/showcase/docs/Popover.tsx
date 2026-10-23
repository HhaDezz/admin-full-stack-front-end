import { useState } from 'react';
import { CalendarDays, Share2 } from 'lucide-react';
import { Button, CopyButton, Input, Popover, Stack, ToggleGroup } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Popover.tsx?raw';

// #region basic
export function Basic() {
  const [range, setRange] = useState<'7' | '30' | '90'>('30');
  return (
    <div className="ex-row">
      <Popover title="Date range" trigger={<Button iconStart={<CalendarDays size={16} />}>Last {range} days</Button>}>
        {(close) => (
          <Stack gap={3}>
            <ToggleGroup
              aria-label="Range"
              size="sm"
              value={range}
              onChange={(v) => {
                setRange(v);
                close();
              }}
              items={[
                { value: '7', label: '7 days' },
                { value: '30', label: '30 days' },
                { value: '90', label: '90 days' },
              ]}
            />
          </Stack>
        )}
      </Popover>
      <Popover
        side="top"
        width={320}
        title="Share this report"
        trigger={
          <Button variant="soft" iconStart={<Share2 size={16} />}>
            Share
          </Button>
        }
      >
        <Input
          readOnly
          aria-label="Link"
          value="https://atelier.app/r/q3-sales"
          suffix={<CopyButton value="https://atelier.app/r/q3-sales" />}
        />
      </Popover>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Popover',
  group: 'Overlays',
  status: 'new',
  description:
    'A small floating panel anchored to a button, for quick settings and sharing. Flips to stay on screen and follows the page as it scrolls.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'side', options: ['top', 'right', 'bottom', 'left'], default: 'bottom' },
      { type: 'select', name: 'align', options: ['start', 'center', 'end'], default: 'start' },
      { type: 'number', name: 'width', default: 280, min: 180, max: 420, step: 20 },
      { type: 'text', name: 'title', default: 'Share link' },
    ],
    render: (v) => (
      <Popover
        side={v.side as 'bottom'}
        align={v.align as 'start'}
        width={Number(v.width)}
        title={String(v.title) || undefined}
        label={String(v.title) || 'Popover'}
        trigger={<Button iconStart={<Share2 size={16} />}>Share</Button>}
      >
        <CopyButton value="https://example.com/r/7Q2K">Copy link</CopyButton>
      </Popover>
    ),
    code: (p) =>
      jsx('Popover', p, { side: 'bottom', align: 'start', width: 280, title: '' }, '\n  …\n', ['trigger={<Button>Share</Button>}']),
  },
  examples: [{ id: 'basic', title: 'Anchored panels', description: 'Children can be a function that receives close().', Component: Basic }],
  keyboard: [
    ['Enter', 'Open from the trigger'],
    ['Esc', 'Close and return focus to the trigger'],
    ['Tab', 'Move inside the panel (focus is kept inside)'],
  ],
  a11y: [
    'The trigger gets aria-expanded, aria-haspopup="dialog" and aria-controls; the panel is a labelled dialog.',
    'Clicking outside closes it.',
  ],
  props: [
    { name: 'trigger', type: 'ReactElement', description: 'The element that toggles it.' },
    { name: 'children', type: 'ReactNode | (close) => ReactNode', description: 'Panel content.' },
    { name: 'title / label', type: 'ReactNode / string', description: 'Heading and accessible name.' },
    {
      name: 'side / align',
      type: "Side / 'start' | 'center' | 'end'",
      defaultValue: "'bottom' / 'start'",
      description: 'Placement (flips when needed).',
    },
    { name: 'open / defaultOpen / onOpenChange', type: '…', description: 'Controlled or uncontrolled.' },
    { name: 'width', type: 'number', description: 'Panel width in px.' },
  ],
});
