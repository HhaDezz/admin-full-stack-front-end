import { useState } from 'react';
import { Archive, Copy, MoreHorizontal, Pencil, Share2, Trash2 } from 'lucide-react';
import { Button, DropdownMenu, IconButton, useToast } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './DropdownMenu.tsx?raw';

// #region actions
export function Actions() {
  const toast = useToast();
  return (
    <DropdownMenu
      label="Row actions"
      items={[
        { label: 'Edit', icon: <Pencil size={15} />, shortcut: 'E', onSelect: () => toast.info('Edit') },
        { label: 'Duplicate', icon: <Copy size={15} />, shortcut: '⌘D', onSelect: () => toast.info('Duplicated') },
        { label: 'Share…', icon: <Share2 size={15} />, description: 'Invite people or copy a link', onSelect: () => toast.info('Share') },
        { type: 'separator' },
        { label: 'Archive', icon: <Archive size={15} />, disabled: true },
        { label: 'Delete', icon: <Trash2 size={15} />, danger: true, onSelect: () => toast.err('Deleted') },
      ]}
      trigger={<IconButton label="Actions" variant="secondary" icon={<MoreHorizontal size={18} />} tooltip={false} />}
    />
  );
}
// #endregion

// #region checkbox
export function Columns() {
  const [cols, setCols] = useState({ email: true, role: true, joined: false });
  const flip = (k: keyof typeof cols) => (v: boolean) => setCols({ ...cols, [k]: v });
  return (
    <DropdownMenu
      label="Columns"
      align="end"
      items={[
        { type: 'label', label: 'Show columns' },
        { type: 'checkbox', label: 'Email', checked: cols.email, onCheckedChange: flip('email') },
        { type: 'checkbox', label: 'Role', checked: cols.role, onCheckedChange: flip('role') },
        { type: 'checkbox', label: 'Joined', checked: cols.joined, onCheckedChange: flip('joined') },
      ]}
      trigger={<Button>Columns ({Object.values(cols).filter(Boolean).length})</Button>}
    />
  );
}
// #endregion

export default defineDoc({
  name: 'DropdownMenu',
  group: 'Overlays',
  status: 'new',
  imports: ['DropdownMenu', 'type MenuEntry'],
  description:
    'A menu of actions or options from a button: icons, shortcuts, descriptions, separators, labels, check items, disabled and danger items.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'side', options: ['top', 'bottom'], default: 'bottom' },
      { type: 'select', name: 'align', options: ['start', 'center', 'end'], default: 'start' },
      { type: 'number', name: 'minWidth', default: 200, min: 140, max: 320, step: 20 },
      { type: 'boolean', name: 'descriptions', default: false },
      { type: 'boolean', name: 'danger', label: 'danger item', default: true },
    ],
    render: (v) => (
      <DropdownMenu
        label="Playground menu"
        side={v.side as 'bottom'}
        align={v.align as 'start'}
        minWidth={Number(v.minWidth)}
        trigger={<Button>Actions</Button>}
        items={[
          { label: 'Edit', icon: <Pencil size={15} />, shortcut: 'E', description: v.descriptions ? 'Change name and roles' : undefined },
          { label: 'Duplicate', icon: <Copy size={15} />, description: v.descriptions ? 'Make a copy' : undefined },
          ...(v.danger ? [{ type: 'separator' as const }, { label: 'Delete', icon: <Trash2 size={15} />, danger: true }] : []),
        ]}
      />
    ),
    code: ({ descriptions: _d, danger: _x, ...p }) =>
      jsx('DropdownMenu', p, { side: 'bottom', align: 'start', minWidth: 200 }, undefined, [
        'label="Actions"',
        'trigger={<Button>Actions</Button>}',
        'items={items}',
      ]),
  },
  examples: [
    {
      id: 'actions',
      title: 'Actions',
      description: 'Open with the mouse, or focus the button and press ↓. Type a letter to jump.',
      Component: Actions,
    },
    { id: 'checkbox', title: 'Check items', description: 'Toggle without closing, e.g. visible columns.', Component: Columns },
  ],
  keyboard: [
    ['↓ + ↑', 'Open from the trigger; move through items'],
    ['Home + End', 'First or last item'],
    ['Enter', 'Choose the item (Space too)'],
    ['A–Z', 'Jump to the next item starting with that letter'],
    ['Esc', 'Close and return focus to the trigger'],
  ],
  a11y: [
    'ARIA menu pattern: role="menu", menuitem / menuitemcheckbox with aria-checked, aria-disabled; disabled items are skipped by the arrow keys.',
  ],
  props: [
    { name: 'trigger', type: 'ReactElement', description: 'The button that opens it.' },
    { name: 'items', type: 'MenuEntry[]', description: 'item | checkbox | separator | label (see code).' },
    { name: 'label', type: 'string', defaultValue: "'Menu'", description: 'Accessible name.' },
    { name: 'side / align', type: 'Side / Align', defaultValue: "'bottom' / 'start'", description: 'Placement.' },
    { name: 'minWidth', type: 'number', defaultValue: '200', description: 'Menu width.' },
  ],
});
