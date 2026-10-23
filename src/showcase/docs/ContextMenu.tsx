import { Copy, Download, FileText, Pencil, Share2, Star, Trash2 } from 'lucide-react';
import { ContextMenu, useToast } from '@/components/kit';
import { defineDoc } from '../doc';
import raw from './ContextMenu.tsx?raw';

// #region file
export function File() {
  const toast = useToast();
  return (
    <ContextMenu
      label="File actions"
      items={[
        { label: 'Open', icon: <FileText size={15} />, onSelect: () => toast.info('Opened') },
        { label: 'Rename', icon: <Pencil size={15} />, shortcut: 'F2', onSelect: () => toast.info('Rename') },
        { label: 'Duplicate', icon: <Copy size={15} />, onSelect: () => toast.ok('Duplicated') },
        { label: 'Download', icon: <Download size={15} />, onSelect: () => toast.info('Downloading…') },
        { type: 'separator' },
        { label: 'Delete', icon: <Trash2 size={15} />, danger: true, onSelect: () => toast.err('Deleted') },
      ]}
    >
      <div className="ctx-demo" tabIndex={0}>
        <FileText size={22} aria-hidden="true" />
        <div>
          <b>Q3-report.pdf</b>
          <div className="muted">Right-click, long-press, or focus and press Shift+F10</div>
        </div>
      </div>
    </ContextMenu>
  );
}
// #endregion

// #region dynamic
const PEOPLE = ['Alex Morgan', 'Priya Shah', 'Mei Chen'];

export function Dynamic() {
  const toast = useToast();
  return (
    <ContextMenu
      label="Person actions"
      items={(target) => {
        const name = target.closest<HTMLElement>('[data-name]')?.dataset.name;
        if (!name) return [];
        return [
          { type: 'label', label: name },
          { label: 'Message', icon: <Share2 size={15} />, onSelect: () => toast.info(`Message ${name}`) },
          { label: 'Add to favourites', icon: <Star size={15} />, onSelect: () => toast.ok(`${name} starred`) },
        ];
      }}
    >
      <ul className="ctx-list" tabIndex={0} aria-label="People">
        {PEOPLE.map((p) => (
          <li key={p} data-name={p}>
            {p}
          </li>
        ))}
      </ul>
    </ContextMenu>
  );
}
// #endregion

export default defineDoc({
  name: 'ContextMenu',
  group: 'Overlays',
  status: 'new',
  description:
    'The right-click menu, for rows, cards and files. Also opens with a long press on touch screens and with the keyboard. Same items as DropdownMenu.',
  raw,
  examples: [
    {
      id: 'file',
      title: 'On a card',
      description: 'Wrap any focusable element; the menu opens where you clicked and stays inside the window.',
      Component: File,
    },
    {
      id: 'dynamic',
      title: 'Items from the target',
      description: 'Pass a function to build items from the element that was right-clicked: one menu for a whole list.',
      Component: Dynamic,
    },
  ],
  keyboard: [
    ['Shift + F10 / Menu key', 'Open on the focused element'],
    ['Up / Down', 'Move between items'],
    ['Home / End', 'First or last item'],
    ['Letters', 'Jump to an item that starts with them'],
    ['Enter / Space', 'Choose'],
    ['Esc', 'Close and return focus'],
  ],
  a11y: [
    'The wrapped element gets aria-haspopup="menu"; give it tabIndex={0} if it isn’t focusable, so keyboard users can open the menu.',
    'A context menu is a shortcut: put the same actions somewhere visible too (a row’s ⋯ button).',
    'The menu has role="menu" and items are menuitem / menuitemcheckbox, shared with DropdownMenu.',
  ],
  props: [
    { name: 'children', type: 'ReactElement', description: 'The area that gets the menu.' },
    {
      name: 'items',
      type: 'MenuEntry[] | (target: HTMLElement) => MenuEntry[]',
      description: 'Items, or a function of the clicked element. Return [] for no menu.',
    },
    { name: 'label', type: 'string', defaultValue: "'Actions'", description: 'Name of the menu.' },
    { name: 'minWidth', type: 'number', defaultValue: '200', description: 'Menu width in px.' },
    { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Use the browser’s own menu instead.' },
  ],
});
