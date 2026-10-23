import { useCallback, useState } from 'react';
import { FilePlus2, LayoutDashboard, LogOut, Moon, Settings, Users } from 'lucide-react';
import { Avatar, Button, CommandPalette, Kbd, useToast, type CommandItem } from '@/components/kit';
import { defineDoc } from '../doc';
import raw from './CommandPalette.tsx?raw';

// #region basic
const ITEMS: CommandItem[] = [
  { id: 'dash', label: 'Dashboard', group: 'Pages', icon: <LayoutDashboard size={16} />, href: '/' },
  { id: 'users', label: 'Users', group: 'Pages', icon: <Users size={16} />, href: '/users' },
  {
    id: 'settings',
    label: 'Settings',
    group: 'Pages',
    icon: <Settings size={16} />,
    href: '/settings',
    keywords: ['preferences', 'profile'],
  },
  { id: 'new', label: 'New user', group: 'Actions', icon: <FilePlus2 size={16} />, shortcut: ['N'] },
  { id: 'dark', label: 'Toggle dark mode', group: 'Actions', icon: <Moon size={16} />, keywords: ['theme'] },
  { id: 'out', label: 'Sign out', group: 'Actions', icon: <LogOut size={16} />, keywords: ['logout'] },
];

export function Basic() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const items = ITEMS.map((i) => ({ ...i, onSelect: () => toast.info(i.label) }));
  return (
    <div className="ex-row">
      <Button onClick={() => setOpen(true)}>
        Search… <Kbd keys={['mod', 'K']} />
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={items}
        onNavigate={(href) => toast.info(`Go to ${href}`)}
        recentKey="docs.cmdk.recent"
      />
    </div>
  );
}
// #endregion

// #region remote
const PEOPLE = ['Alex Morgan', 'Priya Shah', 'Daniel Okafor', 'Mei Chen', 'Sofia Rossi', 'Kenji Watanabe'];

export function Remote() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  // In the app this calls the API; here it waits a moment and filters a list.
  const loadPeople = useCallback(
    (q: string) =>
      new Promise<CommandItem[]>((resolve) =>
        setTimeout(
          () =>
            resolve(
              PEOPLE.filter((p) => p.toLowerCase().includes(q.toLowerCase())).map((p) => ({
                id: p,
                label: p,
                group: 'People',
                icon: <Avatar name={p} size={22} />,
                onSelect: () => toast.info(`Open ${p}`),
              })),
            ),
          300,
        ),
      ),
    [toast],
  );
  return (
    <div className="ex-row">
      <Button onClick={() => setOpen(true)}>Find a person</Button>
      <CommandPalette open={open} onOpenChange={setOpen} items={ITEMS} loadItems={loadPeople} placeholder="Type a name…" />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'CommandPalette',
  group: 'Overlays',
  status: 'new',
  description:
    'Press ⌘K (Ctrl+K) to search pages, actions and records from anywhere. Fuzzy matching with highlights, grouped results, recent picks and results loaded from the API as you type.',
  imports: ['CommandPalette', 'useCommandShortcut'],
  raw,
  examples: [
    {
      id: 'basic',
      title: 'Pages and actions',
      description: 'Items with groups, icons, shortcuts and keywords. recentKey remembers the last five picks.',
      Component: Basic,
    },
    {
      id: 'remote',
      title: 'Results from the server',
      description: 'loadItems runs 200 ms after typing stops; stale answers are ignored and a spinner shows while it waits.',
      Component: Remote,
    },
  ],
  keyboard: [
    ['mod K', 'Open or close (with useCommandShortcut)'],
    ['/', 'Open, when not typing in a field'],
    ['Up / Down', 'Move through results'],
    ['PageUp / PageDown', 'Jump eight results'],
    ['Enter', 'Run the highlighted result'],
    ['Esc', 'Close'],
  ],
  a11y: [
    'A modal dialog with a combobox input; the highlighted result is announced through aria-activedescendant.',
    'Results are a listbox split into labelled groups.',
    'Focus returns to where it was before the palette opened, then the action runs.',
  ],
  props: [
    { name: 'open / onOpenChange', type: 'boolean / (open) => void', description: 'Controlled visibility.' },
    {
      name: 'items',
      type: 'CommandItem[]',
      description: 'Pages and actions: { id, label, group?, description?, icon?, keywords?, shortcut?, href?, onSelect?, disabled? }.',
    },
    { name: 'loadItems', type: '(q: string) => Promise<CommandItem[]>', description: 'Extra results as the user types.' },
    { name: 'onNavigate', type: '(href: string) => void', description: 'Called for items with href (e.g. react-router’s navigate).' },
    { name: 'recentKey', type: 'string', description: 'localStorage key for recent picks.' },
    { name: 'limit', type: 'number', defaultValue: '8', description: 'Results per group while searching.' },
    { name: 'placeholder', type: 'string', description: 'Input placeholder.' },
  ],
  extra: [
    {
      id: 'shortcut',
      title: 'Wiring the shortcut',
      content: (
        <p>
          <code>useCommandShortcut(() =&gt; setOpen(true))</code> listens for ⌘K / Ctrl+K and “/” on the window. The app’s own palette (
          <code>AppCommandPalette</code>) builds its items from the sidebar, so new pages appear in search automatically.
        </p>
      ),
    },
  ],
});
