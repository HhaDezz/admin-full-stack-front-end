import { useMemo, useState } from 'react';
import { CalendarClock, CheckSquare, MessageSquare, Plus, Search, Trash2 } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Field,
  Input,
  KanbanBoard,
  PageHeader,
  Select,
  Textarea,
  useToast,
  type BadgeTone,
} from '../../components/kit';
import { cx } from '../../components/kit/utils';
import { BOARD_COLUMNS, person, TASKS, TEAM, type Priority, type Task } from './data';
import { SampleBadge } from './shared';

/* Kanban: a sprint board. Drag cards between columns; click one (or press Enter) to edit it. */

const PRIORITY: Record<Priority, BadgeTone> = { Low: 'neutral', Medium: 'info', High: 'warn', Urgent: 'danger' };
const shortDue = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const dueSoon = (d?: string) => !!d && new Date(`${d}T23:59:59`).getTime() - Date.now() < 2 * 86_400_000;

export default function Kanban() {
  const toast = useToast();
  const [tasks, setTasks] = useState(TASKS);
  const [query, setQuery] = useState('');
  const [owner, setOwner] = useState<string | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => (!owner || t.owner === owner) && (!q || `${t.id} ${t.title} ${t.tag}`.toLowerCase().includes(q)));
  }, [tasks, query, owner]);
  const filtered = shown.length !== tasks.length;

  const save = (t: Task) => {
    setTasks((list) => (list.some((x) => x.id === t.id) ? list.map((x) => (x.id === t.id ? t : x)) : [...list, t]));
    setEditing(null);
  };
  const add = (column = 'todo') => {
    const n = Math.max(...tasks.map((t) => Number(t.id.split('-')[1]))) + 1;
    setEditing({ id: `AT-${n}`, column, title: '', description: '', tag: 'General', priority: 'Medium', owner: 'me', comments: 0 });
  };

  return (
    <>
      <PageHeader
        title="Kanban"
        description="This sprint’s work, from backlog to done."
        actions={
          <>
            <SampleBadge />
            <Button variant="primary" iconStart={<Plus size={16} />} onClick={() => add()}>
              New task
            </Button>
          </>
        }
      />
      <div className="app-toolbar">
        <Input
          size="sm"
          aria-label="Search tasks"
          placeholder="Search tasks"
          prefix={<Search size={15} />}
          clearable
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="app-search"
        />
        <div className="app-people" role="group" aria-label="Show tasks for">
          {TEAM.map((p) => (
            <button
              key={p.id}
              type="button"
              className={cx('app-person', owner === p.id && 'is-on')}
              aria-pressed={owner === p.id}
              aria-label={p.name}
              title={p.name}
              onClick={() => setOwner(owner === p.id ? null : p.id)}
            >
              <Avatar name={p.name} size="sm" />
            </button>
          ))}
        </div>
        {filtered && (
          <Button size="sm" variant="ghost" onClick={() => (setQuery(''), setOwner(null))}>
            Clear filters
          </Button>
        )}
        <span className="muted app-count" aria-live="polite">
          {shown.length} of {tasks.length} tasks
        </span>
      </div>
      <KanbanBoard
        aria-label="Sprint board"
        headingLevel={2}
        columns={BOARD_COLUMNS}
        items={shown}
        getLabel={(t) => `${t.title}, ${t.priority} priority, ${person(t.owner).name}`}
        onOpen={setEditing}
        onAdd={add}
        onChange={(next, move) => {
          // With a filter on, hidden cards keep their place after the visible ones.
          setTasks((all) => [...next, ...all.filter((t) => !next.some((n) => n.id === t.id))]);
          if (move.from !== move.to) toast.ok(`Moved to ${BOARD_COLUMNS.find((c) => c.id === move.to)?.title}`);
        }}
        renderCard={(t) => (
          <div className="task">
            <div className="task-top">
              <span className="task-id">{t.id}</span>
              <Badge size="sm" tone={PRIORITY[t.priority]}>
                {t.priority}
              </Badge>
            </div>
            <b className="task-title">{t.title}</b>
            <div className="task-meta">
              <Badge size="sm" variant="outline" seed={t.tag}>
                {t.tag}
              </Badge>
              {t.due && (
                <span className={cx('task-chip', dueSoon(t.due) && t.column !== 'done' && 'is-soon')}>
                  <CalendarClock size={13} aria-hidden="true" /> {shortDue(t.due)}
                </span>
              )}
              {t.checklist && (
                <span className="task-chip">
                  <CheckSquare size={13} aria-hidden="true" /> {t.checklist[0]}/{t.checklist[1]}
                </span>
              )}
              {t.comments > 0 && (
                <span className="task-chip">
                  <MessageSquare size={13} aria-hidden="true" /> {t.comments}
                </span>
              )}
              <span className="task-owner">
                <Avatar name={person(t.owner).name} size="xs" />
              </span>
            </div>
          </div>
        )}
      />
      {editing && (
        <TaskDrawer
          task={editing}
          isNew={!tasks.some((t) => t.id === editing.id)}
          onClose={() => setEditing(null)}
          onSave={save}
          onDelete={() => {
            setTasks((l) => l.filter((t) => t.id !== editing.id));
            setEditing(null);
            toast.ok('Task deleted');
          }}
        />
      )}
    </>
  );
}

function TaskDrawer({
  task,
  isNew,
  onClose,
  onSave,
  onDelete,
}: {
  task: Task;
  isNew: boolean;
  onClose: () => void;
  onSave: (t: Task) => void;
  onDelete: () => void;
}) {
  const [t, setT] = useState(task);
  const [error, setError] = useState('');
  const set = <K extends keyof Task>(k: K, v: Task[K]) => setT((x) => ({ ...x, [k]: v }));
  return (
    <Drawer
      open
      onClose={onClose}
      title={isNew ? 'New task' : t.id}
      subtitle={isNew ? undefined : `In ${BOARD_COLUMNS.find((c) => c.id === t.column)?.title}`}
      footer={
        <>
          {!isNew && (
            <Button variant="ghost" iconStart={<Trash2 size={15} />} onClick={onDelete} style={{ marginInlineEnd: 'auto' }}>
              Delete
            </Button>
          )}
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!t.title.trim()) return setError('Give the task a title.');
              onSave({ ...t, title: t.title.trim() });
            }}
          >
            {isNew ? 'Create task' : 'Save'}
          </Button>
        </>
      }
    >
      <form className="app-form" onSubmit={(e) => e.preventDefault()}>
        <Field label="Title" required error={error}>
          <Input value={t.title} onChange={(e) => (set('title', e.target.value), setError(''))} autoFocus />
        </Field>
        <Field label="Description">
          <Textarea value={t.description} onChange={(e) => set('description', e.target.value)} autosize minRows={3} />
        </Field>
        <div className="app-form-row">
          <Field label="Status">
            <Select
              value={t.column}
              onChange={(v) => set('column', v)}
              options={BOARD_COLUMNS.map((c) => ({ value: c.id, label: c.title }))}
            />
          </Field>
          <Field label="Priority">
            <Select
              value={t.priority}
              onChange={(v) => set('priority', v as Priority)}
              options={(['Low', 'Medium', 'High', 'Urgent'] as const).map((v) => ({ value: v, label: v }))}
            />
          </Field>
        </div>
        <div className="app-form-row">
          <Field label="Owner">
            <Select
              value={t.owner}
              onChange={(v) => set('owner', v)}
              options={[{ value: 'me', label: 'You' }, ...TEAM.map((p) => ({ value: p.id, label: p.name }))]}
            />
          </Field>
          <Field label="Due date">
            <Input type="date" value={t.due ?? ''} onChange={(e) => set('due', e.target.value || undefined)} />
          </Field>
        </div>
        <Field label="Tag">
          <Input value={t.tag} onChange={(e) => set('tag', e.target.value)} />
        </Field>
      </form>
    </Drawer>
  );
}
