import { Bell, Pencil, Search, Settings, Trash2 } from 'lucide-react';
import { IconButton } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './IconButton.tsx?raw';

// #region basic
export function Basic() {
  return (
    <div className="ex-row">
      <IconButton label="Search" icon={<Search size={18} />} />
      <IconButton label="Notifications" icon={<Bell size={18} />} variant="secondary" />
      <IconButton label="Settings" icon={<Settings size={18} />} variant="soft" round />
      <IconButton label="Edit" icon={<Pencil size={18} />} variant="primary" />
      <IconButton label="Delete" icon={<Trash2 size={18} />} variant="danger" />
    </div>
  );
}
// #endregion

// #region sizes
export function Sizes() {
  return (
    <div className="ex-row">
      <IconButton label="Small" size="sm" variant="secondary" icon={<Settings size={15} />} />
      <IconButton label="Medium" variant="secondary" icon={<Settings size={18} />} />
      <IconButton label="Large" size="lg" variant="secondary" icon={<Settings size={20} />} />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'IconButton',
  group: 'Buttons & actions',
  status: 'new',
  description:
    'A square button for a single icon. The label is required: it names the button for screen readers and doubles as its tooltip.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'variant', options: ['primary', 'secondary', 'soft', 'ghost', 'danger'], default: 'ghost' },
      { type: 'select', name: 'size', options: ['sm', 'md', 'lg'], default: 'md' },
      { type: 'boolean', name: 'round', default: false },
      { type: 'boolean', name: 'tooltip', default: true },
      { type: 'boolean', name: 'loading', default: false },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <IconButton
        label="Settings"
        icon={<Settings size={18} />}
        variant={v.variant as 'ghost'}
        size={v.size as 'md'}
        round={!!v.round}
        tooltip={!!v.tooltip}
        loading={!!v.loading}
        disabled={!!v.disabled}
      />
    ),
    code: (p) =>
      jsx('IconButton', p, { variant: 'ghost', size: 'md', round: false, tooltip: true, loading: false, disabled: false }, undefined, [
        'label="Settings"',
        'icon={<Settings size={18} />}',
      ]),
  },
  examples: [
    { id: 'basic', title: 'Variants', description: 'Hover or tab to each one to see its tooltip.', Component: Basic },
    { id: 'sizes', title: 'Sizes', description: 'Matches Button heights.', Component: Sizes },
  ],
  a11y: [
    '`label` becomes aria-label and the tooltip text, so the name people hear matches what sighted users read.',
    'Pass tooltip={false} when the meaning is already visible nearby.',
  ],
  props: [
    { name: 'label', type: 'string', description: 'Required accessible name and tooltip.' },
    { name: 'icon', type: 'ReactNode', description: 'The icon.' },
    { name: 'tooltip', type: 'boolean', defaultValue: 'true', description: 'Show the label on hover and focus.' },
    { name: 'round', type: 'boolean', defaultValue: 'false', description: 'Circle instead of rounded square.' },
    { name: 'variant / size / loading', type: 'as Button', defaultValue: "'ghost'", description: 'Same as Button.' },
  ],
});
