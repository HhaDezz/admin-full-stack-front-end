import { CalendarDays, Mail } from 'lucide-react';
import { Avatar, Badge, HoverCard } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './HoverCard.tsx?raw';

// #region profile
export function Profile() {
  return (
    <p>
      Approved by{' '}
      <HoverCard
        content={
          <div className="hc-profile">
            <Avatar name="Priya Shah" size={44} />
            <div>
              <b>Priya Shah</b> <Badge tone="info">Support</Badge>
              <div className="muted">priya@example.com</div>
              <div className="hc-meta">
                <span>
                  <CalendarDays size={13} aria-hidden="true" /> Joined Oct 2026
                </span>
                <span>
                  <Mail size={13} aria-hidden="true" /> Replies within a day
                </span>
              </div>
            </div>
          </div>
        }
      >
        <a href="#profile">Priya Shah</a>
      </HoverCard>{' '}
      on Tuesday.
    </p>
  );
}
// #endregion

// #region sides
export function Sides() {
  return (
    <div className="ex-row" style={{ flexWrap: 'wrap' }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <HoverCard key={side} side={side} width={200} openDelay={200} content={<span>Opens on the {side}.</span>}>
          <a href={`#${side}`}>{side}</a>
        </HoverCard>
      ))}
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'HoverCard',
  group: 'Overlays',
  status: 'new',
  description:
    'A preview card that appears when the pointer rests on a link, or the link gets focus: people, records, URLs. Richer than a Tooltip, but never the only way to the information.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'side', options: ['top', 'right', 'bottom', 'left'], default: 'bottom' },
      { type: 'select', name: 'align', options: ['start', 'center', 'end'], default: 'start' },
      { type: 'number', name: 'openDelay', default: 500, min: 0, max: 1000, step: 100 },
      { type: 'number', name: 'width', default: 300, min: 180, max: 400, step: 20 },
    ],
    render: (v) => (
      <HoverCard
        side={v.side as 'bottom'}
        align={v.align as 'start'}
        openDelay={Number(v.openDelay)}
        width={Number(v.width)}
        content={<span>Linen overshirt · 42 in stock · updated today</span>}
      >
        <a href="#sku">SKU-2041</a>
      </HoverCard>
    ),
    code: (p) =>
      jsx('HoverCard', p, { side: 'bottom', align: 'start', openDelay: 500, width: 300 }, '<a href="/products/2041">SKU-2041</a>', [
        'content={preview}',
      ]),
  },
  examples: [
    {
      id: 'profile',
      title: 'Person preview',
      description: 'The link still goes to the profile; the card just saves a click.',
      Component: Profile,
    },
    { id: 'sides', title: 'Placement', description: 'side and align; it flips when there isn’t room.', Component: Sides },
  ],
  keyboard: [
    ['Tab', 'Focusing the link opens the card'],
    ['Esc', 'Close'],
  ],
  a11y: [
    'Opens on hover and focus, never on touch: on phones the link simply works.',
    'The pointer can move into the card (to select text or click a link) without it closing.',
    'Content isn’t announced automatically, so keep anything essential on the linked page.',
  ],
  props: [
    { name: 'children', type: 'ReactElement', description: 'The link or button.' },
    { name: 'content', type: 'ReactNode', description: 'The card.' },
    { name: 'openDelay / closeDelay', type: 'number', defaultValue: '500 / 200', description: 'Milliseconds.' },
    { name: 'side', type: "'top' | 'right' | 'bottom' | 'left'", defaultValue: "'bottom'", description: 'Preferred side.' },
    { name: 'align', type: "'start' | 'center' | 'end'", defaultValue: "'start'", description: 'Alignment on that side.' },
    { name: 'width', type: 'number', defaultValue: '300', description: 'Card width in px.' },
  ],
});
