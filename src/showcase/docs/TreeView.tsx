import { useState } from 'react';
import { File, FileCode2, FileImage, Folder, Search } from 'lucide-react';
import { Card, Input, TreeView, useToast, type TreeNode } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './TreeView.tsx?raw';

// #region files
const FILES: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    icon: <Folder size={16} />,
    children: [
      {
        id: 'components',
        label: 'components',
        icon: <Folder size={16} />,
        children: [
          { id: 'Button.tsx', label: 'Button.tsx', icon: <FileCode2 size={16} />, meta: '4 KB' },
          { id: 'Modal.tsx', label: 'Modal.tsx', icon: <FileCode2 size={16} />, meta: '7 KB' },
          { id: 'TreeView.tsx', label: 'TreeView.tsx', icon: <FileCode2 size={16} />, meta: '11 KB' },
        ],
      },
      {
        id: 'pages',
        label: 'pages',
        icon: <Folder size={16} />,
        children: [
          { id: 'Dashboard.tsx', label: 'Dashboard.tsx', icon: <FileCode2 size={16} />, meta: '12 KB' },
          { id: 'Users.tsx', label: 'Users.tsx', icon: <FileCode2 size={16} />, meta: '18 KB' },
        ],
      },
      { id: 'main.tsx', label: 'main.tsx', icon: <FileCode2 size={16} />, meta: '1 KB' },
    ],
  },
  {
    id: 'public',
    label: 'public',
    icon: <Folder size={16} />,
    children: [{ id: 'logo.svg', label: 'logo.svg', icon: <FileImage size={16} />, meta: '2 KB' }],
  },
  { id: 'README.md', label: 'README.md', icon: <File size={16} />, meta: '6 KB' },
];

export function Files() {
  const toast = useToast();
  const [query, setQuery] = useState('');
  return (
    <div style={{ width: 'min(380px, 100%)' }}>
      <Card padding="sm">
        <Input
          size="sm"
          aria-label="Filter files"
          placeholder="Filter files"
          prefix={<Search size={15} />}
          clearable
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div style={{ height: 8 }} />
        <TreeView
          aria-label="Project files"
          items={FILES}
          defaultExpanded={['src', 'components']}
          defaultSelected={['TreeView.tsx']}
          filter={query}
          onAction={(n) => toast.info(`Open ${n.label}`)}
        />
      </Card>
    </div>
  );
}
// #endregion

// #region permissions
const PERMS: TreeNode[] = [
  {
    id: 'users',
    label: 'Users',
    children: [
      { id: 'users.view', label: 'View users' },
      { id: 'users.edit', label: 'Edit users' },
      { id: 'users.delete', label: 'Delete users' },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    children: [
      { id: 'billing.view', label: 'View invoices' },
      { id: 'billing.refund', label: 'Issue refunds', disabled: true },
    ],
  },
];

export function Permissions() {
  const [checked, setChecked] = useState(['users.view', 'users.edit']);
  return (
    <div style={{ width: 'min(380px, 100%)' }}>
      <TreeView
        aria-label="Permissions"
        selectionMode="multiple"
        items={PERMS}
        defaultExpanded={['users', 'billing']}
        selected={checked}
        onSelectedChange={setChecked}
      />
      <p className="muted" style={{ fontSize: 13 }}>
        {checked.filter((c) => c.includes('.')).length} permissions checked
      </p>
    </div>
  );
}
// #endregion

// #region lazy
const REGIONS: TreeNode[] = ['Europe', 'Asia', 'Americas'].map((r) => ({ id: r, label: r, hasChildren: true }));

// In the app this calls the API; here it waits a moment.
const loadOffices = (n: TreeNode) =>
  new Promise<TreeNode[]>((resolve) =>
    setTimeout(
      () => resolve([1, 2, 3].map((i) => ({ id: `${n.id}-${i}`, label: `${n.label} office ${i}`, meta: `${i * 12} people` }))),
      700,
    ),
  );

export function Lazy() {
  return (
    <div style={{ width: 'min(380px, 100%)' }}>
      <TreeView aria-label="Offices" items={REGIONS} loadChildren={loadOffices} selectionMode="none" size="sm" />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'TreeView',
  group: 'Data display',
  status: 'new',
  description:
    'Nested rows that open and close: files, categories, org charts, permission groups. Single or cascading checkbox selection, filtering, children loaded on demand and full arrow-key navigation.',
  imports: ['TreeView', 'type TreeNode'],
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'selectionMode', options: ['none', 'single', 'multiple'], default: 'single' },
      { type: 'select', name: 'size', options: ['sm', 'md'], default: 'md' },
      { type: 'boolean', name: 'lines', default: true },
      { type: 'text', name: 'filter', default: '' },
    ],
    render: (v) => (
      <div style={{ width: 'min(380px, 100%)' }}>
        <TreeView
          key={String(v.selectionMode)}
          aria-label="Playground tree"
          items={FILES}
          defaultExpanded={['src', 'components']}
          selectionMode={v.selectionMode as 'single'}
          size={v.size as 'md'}
          lines={!!v.lines}
          filter={String(v.filter)}
        />
      </div>
    ),
    code: (p) =>
      jsx('TreeView', p, { selectionMode: 'single', size: 'md', lines: true, filter: '' }, undefined, [
        'items={files}',
        'aria-label="Files"',
      ]),
  },
  examples: [
    {
      id: 'files',
      title: 'File browser with a filter',
      description: 'Typing in the box shows matches with their folders opened. Enter or double-click runs onAction.',
      Component: Files,
    },
    {
      id: 'permissions',
      title: 'Checkboxes that cascade',
      description: 'selectionMode="multiple": checking a group checks everything in it; a partly checked group shows a dash.',
      Component: Permissions,
    },
    {
      id: 'lazy',
      title: 'Children on demand',
      description: 'Nodes with hasChildren call loadChildren the first time they open.',
      Component: Lazy,
    },
  ],
  keyboard: [
    ['Down / Up', 'Next or previous visible row'],
    ['Right', 'Open a closed row, or move to its first child'],
    ['Left', 'Close an open row, or move to its parent'],
    ['Home / End', 'First or last visible row'],
    ['Enter', 'Run onAction, or select'],
    ['Space', 'Select (or check)'],
    ['*', 'Open every row at this level'],
    ['Letters', 'Jump to the next row starting with them'],
  ],
  a11y: [
    'The ARIA tree pattern: role="tree", treeitem and group, with aria-level, aria-setsize and aria-posinset.',
    'One row is in the Tab order at a time (roving tabindex); arrows move between rows.',
    'Single selection uses aria-selected; checkboxes use aria-checked, including "mixed" for partly checked groups.',
    'Rows loading their children are marked aria-busy. Left and Right swap in right-to-left.',
  ],
  props: [
    { name: 'items', type: 'TreeNode[]', description: '{ id, label, icon?, meta?, children?, hasChildren?, disabled? }' },
    { name: 'expanded / defaultExpanded / onExpandedChange', type: 'string[]', description: 'Open rows.' },
    { name: 'selectionMode', type: "'none' | 'single' | 'multiple'", defaultValue: "'single'", description: 'What clicking does.' },
    {
      name: 'selected / defaultSelected / onSelectedChange',
      type: 'string[]',
      description: 'Selected (or checked) ids; checked groups are included.',
    },
    { name: 'onAction', type: '(node) => void', description: 'Enter or double-click.' },
    { name: 'filter', type: 'string', description: 'Show matching rows and their parents.' },
    { name: 'loadChildren', type: '(node) => Promise<TreeNode[]>', description: 'For nodes with hasChildren.' },
    { name: 'size', type: "'sm' | 'md'", defaultValue: "'md'", description: 'Row height.' },
    { name: 'lines', type: 'boolean', defaultValue: 'true', description: 'Guide lines per level.' },
    { name: 'aria-label', type: 'string', description: 'Required name for the tree.' },
  ],
});
