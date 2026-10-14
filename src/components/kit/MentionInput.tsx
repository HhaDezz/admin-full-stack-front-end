import { useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Avatar } from './Avatar';
import { Textarea } from './Textarea';
import { cx } from './utils';

/* ── MentionInput: a text box where typing @ suggests people to mention ── */

export interface MentionPerson {
  id: string;
  name: string;
  /** Second line in the list, e.g. a role or email. */
  description?: string;
  avatar?: string;
}

export interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  people: MentionPerson[];
  /** Called with the text and the people mentioned in it (Enter sends when submitOnEnter is on). */
  onSubmit?: (value: string, mentioned: MentionPerson[]) => void;
  /** Enter sends; Shift+Enter starts a new line. */
  submitOnEnter?: boolean;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
  /** Extra content inside the box, after the text (e.g. a send button). */
  trailing?: ReactNode;
  className?: string;
}

/** People whose "@Name" appears in the text. */
export function mentionedIn(text: string, people: MentionPerson[]): MentionPerson[] {
  return people.filter((p) => text.includes(`@${p.name}`));
}

const MAX = 6;

export function MentionInput({
  value,
  onChange,
  people,
  onSubmit,
  submitOnEnter,
  placeholder = 'Write a message… Type @ to mention someone',
  minRows = 1,
  maxRows = 8,
  disabled,
  id,
  'aria-label': label = 'Message',
  trailing,
  className,
}: MentionInputProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [query, setQuery] = useState<{ text: string; start: number } | null>(null);
  const [active, setActive] = useState(0);
  const listId = useId();
  // Where the caret goes after a pick, applied as soon as the new text is in the box.
  const pendingCaret = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && pendingCaret.current != null) {
      el.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
  }, [value]);

  const matches = useMemo(() => {
    if (!query) return [];
    const q = query.text.toLowerCase();
    return people
      .filter(
        (p) =>
          p.name
            .toLowerCase()
            .split(/\s+/)
            .some((w) => w.startsWith(q)) || p.name.toLowerCase().startsWith(q),
      )
      .slice(0, MAX);
  }, [query, people]);
  const open = !!query && matches.length > 0;

  // Find an @word right before the caret.
  const sync = (el: HTMLTextAreaElement) => {
    const upto = el.value.slice(0, el.selectionStart ?? el.value.length);
    const m = /(^|\s)@([\p{L}\p{N}._-]{0,30})$/u.exec(upto);
    if (m) {
      setQuery({ text: m[2], start: upto.length - m[2].length - 1 });
      setActive(0);
    } else setQuery(null);
  };

  const pick = (p: MentionPerson) => {
    const el = ref.current;
    if (!el || !query) return;
    const end = el.selectionStart ?? value.length;
    const insert = `@${p.name} `;
    const next = value.slice(0, query.start) + insert + value.slice(end);
    onChange(next);
    setQuery(null);
    pendingCaret.current = query.start + insert.length;
    el.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const d = e.key === 'ArrowDown' ? 1 : -1;
        setActive((a) => (a + d + matches.length) % matches.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        pick(matches[active]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setQuery(null);
        return;
      }
    }
    if (submitOnEnter && e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (value.trim()) onSubmit?.(value, mentionedIn(value, people));
    }
  };

  return (
    <div className={cx('mention', trailing != null && 'has-trailing', className)}>
      <Textarea
        ref={ref}
        id={id}
        value={value}
        disabled={disabled}
        autosize
        minRows={minRows}
        maxRows={maxRows}
        placeholder={placeholder}
        aria-label={label}
        aria-autocomplete="list"
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${matches[active]?.id}` : undefined}
        onChange={(e) => {
          onChange(e.target.value);
          sync(e.target);
        }}
        onKeyDown={onKey}
        onKeyUp={(e) => ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) && sync(e.currentTarget)}
        onClick={(e) => sync(e.currentTarget)}
        onBlur={() => setTimeout(() => setQuery(null), 120)}
      />
      {trailing != null && <div className="mention-trailing">{trailing}</div>}
      <span className="sr-only" role="status">
        {open ? `${matches.length} ${matches.length === 1 ? 'person' : 'people'} found. Up and down to choose, Enter to insert.` : ''}
      </span>
      {open && (
        <ul className="mention-list" id={listId} role="listbox" aria-label="People to mention">
          {matches.map((p, i) => (
            <li
              key={p.id}
              id={`${listId}-${p.id}`}
              role="option"
              aria-selected={i === active}
              className={cx('mention-option', i === active && 'is-active')}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(p);
              }}
              onMouseMove={() => setActive(i)}
            >
              <Avatar name={p.name} src={p.avatar} size="xs" />
              <span className="mention-name">{p.name}</span>
              {p.description && <span className="mention-desc">{p.description}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
