import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  closestCorners,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import { useShouldReduceMotion } from '../../lib/motion';
import { cx } from './utils';

/* ── KanbanBoard: columns of cards you drag (mouse, touch or keyboard) to reorder and move ── */

export interface KanbanColumn {
  id: string;
  title: ReactNode;
  /** Work-in-progress limit: the count turns amber when it's passed. */
  limit?: number;
  /** A colour for the dot next to the title (any CSS colour). */
  color?: string;
}

export interface KanbanItem {
  id: string;
  /** The column id this card is in. */
  column: string;
}

export interface KanbanMove {
  id: string;
  from: string;
  to: string;
  /** Position in the new column, from 0. */
  index: number;
}

export interface KanbanBoardProps<T extends KanbanItem> {
  columns: KanbanColumn[];
  /** Cards in order; each column shows its cards in this order. */
  items: T[];
  /** Called after a drop with the reordered list and what moved. */
  onChange: (items: T[], move: KanbanMove) => void;
  renderCard: (item: T) => ReactNode;
  /** What screen readers call a card, e.g. its title. */
  getLabel: (item: T) => string;
  /** Open a card: on click, or Enter from the keyboard (Space picks it up). */
  onOpen?: (item: T) => void;
  /** Shows an "Add card" button under each column. */
  onAdd?: (columnId: string) => void;
  /** Extra content in a column header (e.g. a menu). */
  columnActions?: (column: KanbanColumn) => ReactNode;
  /** Shown in an empty column. */
  emptyText?: ReactNode;
  /** Level of the column titles (default 3). */
  headingLevel?: 2 | 3 | 4;
  'aria-label'?: string;
  className?: string;
}

const COL = 'col:';

function SortableCard({ id, label, children, onOpen }: { id: string; label: string; children: ReactNode; onOpen?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  // Enter opens the card (Space picks it up); a click that didn't turn into a drag opens it too.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onOpen && e.key === 'Enter' && !isDragging) {
      e.preventDefault();
      onOpen();
      return;
    }
    listeners?.onKeyDown?.(e);
  };
  return (
    <li
      ref={setNodeRef}
      className={cx('kanban-slot', isDragging && 'is-placeholder')}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <div
        className="kanban-card"
        {...attributes}
        {...listeners}
        onKeyDown={onKeyDown}
        onClick={onOpen}
        aria-roledescription="draggable card"
        aria-label={label}
      >
        {children}
      </div>
    </li>
  );
}

function Column<T extends KanbanItem>({
  column,
  cards,
  renderCard,
  getLabel,
  onAdd,
  onOpen,
  actions,
  emptyText,
  headingLevel = 3,
}: {
  column: KanbanColumn;
  cards: T[];
  renderCard: (item: T) => ReactNode;
  getLabel: (item: T) => string;
  onAdd?: (id: string) => void;
  onOpen?: (item: T) => void;
  actions?: ReactNode;
  emptyText?: ReactNode;
  headingLevel?: 2 | 3 | 4;
}) {
  const H = `h${headingLevel}` as 'h3';
  const { setNodeRef, isOver } = useDroppable({ id: COL + column.id });
  const over = column.limit != null && cards.length > column.limit;
  const headId = `kanban-${column.id}-title`;
  return (
    <div className={cx('kanban-col', isOver && 'is-over')} role="group" aria-labelledby={headId}>
      <div className="kanban-col-head">
        {column.color && <span className="kanban-dot" style={{ background: column.color }} aria-hidden="true" />}
        <H id={headId}>{column.title}</H>
        <span className={cx('kanban-count', over && 'is-over')} title={column.limit != null ? `Limit ${column.limit}` : undefined}>
          {cards.length}
          {column.limit != null && `/${column.limit}`}
          {over && <span className="sr-only"> (over the limit)</span>}
        </span>
        {actions && <span className="kanban-col-actions">{actions}</span>}
      </div>
      <SortableContext id={column.id} items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="kanban-list">
          {cards.map((c) => (
            <SortableCard key={c.id} id={c.id} label={getLabel(c)} onOpen={onOpen && (() => onOpen(c))}>
              {renderCard(c)}
            </SortableCard>
          ))}
          {cards.length === 0 && <li className="kanban-empty">{emptyText ?? 'Drop cards here'}</li>}
        </ul>
      </SortableContext>
      {onAdd && (
        <button type="button" className="kanban-add" onClick={() => onAdd(column.id)}>
          <Plus size={15} aria-hidden="true" /> Add card
        </button>
      )}
    </div>
  );
}

export function KanbanBoard<T extends KanbanItem>({
  columns,
  items,
  onChange,
  renderCard,
  getLabel,
  onAdd,
  onOpen,
  columnActions,
  emptyText,
  headingLevel,
  'aria-label': label = 'Board',
  className,
}: KanbanBoardProps<T>) {
  const [draft, setDraft] = useState<T[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const startColumn = useRef<string>('');
  const reduce = useShouldReduceMotion();
  const list = draft ?? items;

  const byColumn = useMemo(() => {
    const map = new Map<string, T[]>(columns.map((c) => [c.id, []]));
    for (const it of list) map.get(it.column)?.push(it);
    return map;
  }, [columns, list]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // On touch screens, press and hold to pick up, so swiping still scrolls the board.
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: onOpen ? ['Space'] : ['Space', 'Enter'], cancel: ['Escape'], end: ['Space', 'Enter'] },
    }),
  );

  const find = (id: UniqueIdentifier) => list.find((i) => i.id === id);
  const columnOf = (id: UniqueIdentifier): string | undefined =>
    String(id).startsWith(COL) ? String(id).slice(COL.length) : find(id)?.column;
  const titleOf = (id: string) => {
    const c = columns.find((x) => x.id === id)?.title;
    return typeof c === 'string' ? c : id;
  };
  const position = (id: UniqueIdentifier) => {
    const col = columnOf(id);
    const cards = col ? (byColumn.get(col) ?? []) : [];
    return { col, index: cards.findIndex((c) => c.id === id), total: cards.length };
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      const p = position(active.id);
      return `Picked up ${getLabel(find(active.id)!)}, card ${p.index + 1} of ${p.total} in ${titleOf(p.col!)}. Use the arrow keys to move, Space to drop, Escape to cancel.`;
    },
    onDragOver: ({ active, over }) => {
      if (!over) return `${getLabel(find(active.id)!)} is no longer over a column.`;
      const p = position(over.id);
      return String(over.id).startsWith(COL)
        ? `Over ${titleOf(p.col!)}.`
        : `Over ${titleOf(p.col!)}, position ${p.index + 1} of ${p.total}.`;
    },
    onDragEnd: ({ active, over }) => {
      const it = find(active.id);
      if (!over || !it) return `Dropped. ${it ? getLabel(it) : 'The card'} went back.`;
      const p = position(active.id);
      return `Dropped ${getLabel(it)} in ${titleOf(p.col!)}, position ${p.index + 1} of ${p.total}.`;
    },
    onDragCancel: ({ active }) => `Cancelled. ${getLabel(find(active.id)!)} went back to ${titleOf(startColumn.current)}.`,
  };

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    startColumn.current = find(active.id)?.column ?? '';
    setDraft(items);
  };

  // Moving to another column happens while dragging, so the card makes room as you go.
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const from = columnOf(active.id);
    const to = columnOf(over.id);
    if (!from || !to || from === to) return;
    setDraft((prev) => {
      const cur = prev ?? items;
      const moving = cur.find((i) => i.id === active.id);
      if (!moving) return cur;
      const rest = cur.filter((i) => i.id !== active.id);
      const moved = { ...moving, column: to };
      if (String(over.id).startsWith(COL)) {
        // Over the column itself: go to the end of it.
        const lastIdx = rest.reduce((acc, it, i) => (it.column === to ? i : acc), -1);
        rest.splice(lastIdx + 1, 0, moved);
        return rest;
      }
      const overIdx = rest.findIndex((i) => i.id === over.id);
      const below = active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height / 2;
      rest.splice(overIdx + (below ? 1 : 0), 0, moved);
      return rest;
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const cur = draft ?? items;
    setActiveId(null);
    setDraft(null);
    if (!over) return;
    let next = cur;
    const it = cur.find((i) => i.id === active.id);
    if (!it) return;
    if (!String(over.id).startsWith(COL) && over.id !== active.id && columnOf(over.id) === it.column) {
      const a = cur.findIndex((i) => i.id === active.id);
      const b = cur.findIndex((i) => i.id === over.id);
      next = arrayMove(cur, a, b);
    }
    const index = next.filter((i) => i.column === it.column).findIndex((i) => i.id === it.id);
    const changed = next !== items && (it.column !== startColumn.current || next.some((x, i) => x.id !== items[i]?.id));
    if (changed) onChange(next, { id: it.id, from: startColumn.current, to: it.column, index });
  };

  const dropAnimation: DropAnimation | null = reduce
    ? null
    : {
        duration: 220,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.35' } } }),
        keyframes: ({ transform }) => [
          { transform: CSS.Transform.toString({ ...transform.initial, scaleX: 1.03, scaleY: 1.03 }) + ' rotate(-1.5deg)' },
          { transform: CSS.Transform.toString(transform.final) + ' rotate(0deg)' },
        ],
      };

  const active = activeId ? find(activeId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        setDraft(null);
      }}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            'To pick up a card, press Space. Use the arrow keys to move it between positions and columns, Space or Enter to drop, and Escape to cancel.',
        },
      }}
    >
      <div className={cx('kanban', className)} role="region" aria-label={label}>
        {columns.map((c) => (
          <Column
            key={c.id}
            column={c}
            cards={byColumn.get(c.id) ?? []}
            renderCard={renderCard}
            getLabel={getLabel}
            onAdd={onAdd}
            onOpen={onOpen}
            actions={columnActions?.(c)}
            emptyText={emptyText}
            headingLevel={headingLevel}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={dropAnimation}>
        {active ? <div className={cx('kanban-card is-overlay', reduce && 'no-lift')}>{renderCard(active)}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}
