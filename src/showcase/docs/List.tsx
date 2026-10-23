import { useState } from 'react';
import { FileText, Folder, Image, MoreHorizontal, Trash2 } from 'lucide-react';
import { Avatar, Badge, IconButton, List } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './List.tsx?raw';

// #region people
export function People() {
  return (
    <div className="ex-wide" style={{ maxWidth: 520 }}>
      <List
        aria-label="Team"
        items={[
          {
            id: '1',
            leading: <Avatar name="Ada Lovelace" status="online" />,
            title: 'Ada Lovelace',
            description: 'ada@example.com',
            meta: <Badge tone="brand">Owner</Badge>,
          },
          {
            id: '2',
            leading: <Avatar name="Grace Hopper" status="away" />,
            title: 'Grace Hopper',
            description: 'grace@example.com',
            meta: <Badge>Admin</Badge>,
          },
          {
            id: '3',
            leading: <Avatar name="Alan Turing" />,
            title: 'Alan Turing',
            description: 'Invited 2 days ago',
            meta: <Badge tone="info">Invited</Badge>,
          },
        ]}
      />
    </div>
  );
}
// #endregion

// #region interactive
export function Interactive() {
  const [picked, setPicked] = useState('2');
  const files = [
    { id: '1', icon: <Folder size={18} />, title: 'Contracts', description: '14 files' },
    { id: '2', icon: <FileText size={18} />, title: 'Q3 report.pdf', description: '2.4 MB · edited today' },
    { id: '3', icon: <Image size={18} />, title: 'Logo.svg', description: '18 KB · edited last week' },
  ];
  return (
    <div className="ex-wide" style={{ maxWidth: 520 }}>
      <List
        variant="cards"
        aria-label="Files"
        items={files.map((f) => ({
          id: f.id,
          leading: f.icon,
          title: f.title,
          description: f.description,
          selected: picked === f.id,
          onClick: () => setPicked(f.id),
          actions: (
            <>
              <IconButton size="sm" label={`Delete ${f.title}`} icon={<Trash2 size={15} />} />
              <IconButton size="sm" label={`More for ${f.title}`} icon={<MoreHorizontal size={15} />} />
            </>
          ),
        }))}
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'List',
  group: 'Data display',
  status: 'new',
  description:
    'Rows of people, files or notifications: a leading avatar or icon, title and description, meta at the end and actions that stay clickable.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'variant', options: ['divided', 'cards', 'plain'], default: 'divided' },
      { type: 'select', name: 'size', options: ['sm', 'md'], default: 'md' },
      { type: 'boolean', name: 'clickable', label: 'onClick', default: false },
      { type: 'boolean', name: 'actions', default: true },
    ],
    render: (v) => (
      <div style={{ width: 'min(480px, 100%)' }}>
        <List
          aria-label="Team"
          variant={v.variant as 'divided'}
          size={v.size as 'md'}
          items={['Ada Lovelace', 'Grace Hopper', 'Alan Turing'].map((n, i) => ({
            id: n,
            title: n,
            description: ['Admin', 'Support', 'Viewer'][i],
            leading: <Avatar name={n} size="sm" />,
            meta: <Badge tone={i ? 'neutral' : 'ok'}>{i ? 'Away' : 'Online'}</Badge>,
            actions: v.actions ? <IconButton label={`More for ${n}`} icon={<MoreHorizontal size={16} />} size="sm" /> : undefined,
            onClick: v.clickable ? () => {} : undefined,
          }))}
        />
      </div>
    ),
    code: ({ clickable: _c, actions: _a, ...p }) =>
      jsx('List', p, { variant: 'divided', size: 'md' }, undefined, ['items={items}', 'aria-label="Team"']),
  },
  examples: [
    { id: 'people', title: 'Divided', description: 'The default: one box with lines between rows.', Component: People },
    {
      id: 'interactive',
      title: 'Clickable cards with actions',
      description:
        'Rows with onClick become buttons; selected adds a marker and aria-current. The action buttons sit beside the row, not inside it, so they never nest.',
      Component: Interactive,
    },
  ],
  props: [
    {
      name: 'items',
      type: 'ListItem[]',
      description: '{ id, title, description?, leading?, meta?, actions?, onClick?, href?, selected?, disabled? }',
    },
    { name: 'variant', type: "'divided' | 'cards' | 'plain'", defaultValue: "'divided'", description: 'Style.' },
    { name: 'size', type: "'sm' | 'md'", defaultValue: "'md'", description: 'Row height.' },
    { name: 'empty', type: 'ReactNode', description: 'Shown when there are no items.' },
  ],
});
