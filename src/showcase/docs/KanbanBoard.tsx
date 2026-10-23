import { useState } from 'react';
import { MessageSquare, Paperclip } from 'lucide-react';
import { Avatar, Badge, KanbanBoard, useToast, type KanbanColumn, type KanbanItem } from '@/components/kit';
import { defineDoc } from '../doc';
import raw from './KanbanBoard.tsx?raw';

// #region board
interface Task extends KanbanItem {
  title: string;
  tag: string;
  owner: string;
  comments: number;
  files?: number;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'To do', color: 'var(--chart-2)' },
  { id: 'doing', title: 'In progress', color: 'var(--chart-5)', limit: 3 },
  { id: 'review', title: 'Review', color: 'var(--chart-4)' },
  { id: 'done', title: 'Done', color: 'var(--chart-1)' },
];

const TASKS: Task[] = [
  { id: 't1', column: 'todo', title: 'Write the returns policy page', tag: 'Content', owner: 'Amara Perera', comments: 2 },
  { id: 't2', column: 'todo', title: 'Sizes chart for the linen range', tag: 'Product', owner: 'Kasun Silva', comments: 0, files: 1 },
  { id: 't3', column: 'doing', title: 'Checkout: save card for later', tag: 'Engineering', owner: 'Nadia Fernando', comments: 5 },
  { id: 't4', column: 'doing', title: 'Photo shoot shortlist', tag: 'Design', owner: 'Amara Perera', comments: 1, files: 12 },
  { id: 't5', column: 'review', title: 'Spring newsletter', tag: 'Marketing', owner: 'Oliver Grant', comments: 3 },
  { id: 't6', column: 'done', title: 'Move images to the CDN', tag: 'Engineering', owner: 'Kasun Silva', comments: 0 },
];

export function Board() {
  const toast = useToast();
  const [tasks, setTasks] = useState(TASKS);
  return (
    <KanbanBoard
      aria-label="Sprint board"
      columns={COLUMNS}
      items={tasks}
      getLabel={(t) => t.title}
      onChange={(next, move) => {
        setTasks(next);
        if (move.from !== move.to) toast.ok(`Moved to ${COLUMNS.find((c) => c.id === move.to)?.title}`);
      }}
      onAdd={(col) =>
        setTasks((t) => [...t, { id: `t${Date.now()}`, column: col, title: 'New task', tag: 'Inbox', owner: 'You', comments: 0 }])
      }
      renderCard={(t) => (
        <div style={{ display: 'grid', gap: 8 }}>
          <Badge size="sm" seed={t.tag}>
            {t.tag}
          </Badge>
          <b style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>{t.title}</b>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--muted)' }}>
            <Avatar name={t.owner} size="xs" />
            <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
              <MessageSquare size={13} aria-hidden="true" /> {t.comments}
            </span>
            {t.files != null && (
              <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
                <Paperclip size={13} aria-hidden="true" /> {t.files}
              </span>
            )}
          </div>
        </div>
      )}
    />
  );
}
// #endregion

export default defineDoc({
  name: 'KanbanBoard',
  group: 'Apps & advanced',
  status: 'new',
  description:
    'Columns of cards you drag to reorder or move, with the mouse, a finger (press and hold) or the keyboard. The card lifts as you pick it up and settles where it lands; columns can have a work-in-progress limit.',
  imports: ['KanbanBoard', 'type KanbanColumn', 'type KanbanItem'],
  raw,
  examples: [
    {
      id: 'board',
      title: 'Team sprint',
      description:
        'Drag cards between columns. “In progress” has a limit of 3: add a fourth and the count turns amber. Focus a card and press Space to move it with the arrow keys.',
      Component: Board,
    },
  ],
  keyboard: [
    ['Tab', 'Move between cards'],
    ['Space', 'Pick up the focused card, or drop it (Enter drops too)'],
    ['Enter', 'Open the card, when onOpen is set (otherwise it picks up too)'],
    ['Arrow keys', 'Move the card up and down, or to the next column'],
    ['Escape', 'Cancel and put the card back'],
  ],
  a11y: [
    'Built on dnd-kit: every pickup, move and drop is announced in plain words (“Over Review, position 2 of 3”).',
    'Cards are named by getLabel, so give each one a short title. A card is one big handle, so keep buttons out of it and use onOpen to show details.',
    'The limit is announced as “over the limit”, not only shown in colour.',
    'With reduced motion the lift and settle are turned off.',
  ],
  props: [
    { name: 'columns', type: 'KanbanColumn[]', description: '{ id, title, limit?, color? }' },
    { name: 'items', type: 'T extends { id, column }', description: 'Cards in order.' },
    {
      name: 'onChange',
      type: '(items, move) => void',
      description: 'After a drop: the new order and { id, from, to, index }. Save it here.',
    },
    { name: 'renderCard', type: '(item) => ReactNode', description: 'What a card shows.' },
    { name: 'getLabel', type: '(item) => string', description: 'Name read by screen readers.' },
    { name: 'onOpen', type: '(item) => void', description: 'Click or Enter opens a card, e.g. in a drawer.' },
    { name: 'onAdd', type: '(columnId) => void', description: 'Shows “Add card” under each column.' },
    { name: 'columnActions', type: '(column) => ReactNode', description: 'Extra content in a column header.' },
    { name: 'headingLevel', type: '2 | 3 | 4', defaultValue: '3', description: 'Level of the column titles.' },
    { name: 'emptyText', type: 'ReactNode', defaultValue: "'Drop cards here'", description: 'In an empty column.' },
  ],
});
