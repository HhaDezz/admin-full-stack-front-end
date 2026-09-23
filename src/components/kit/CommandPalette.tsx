import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { CornerDownLeft, Search } from 'lucide-react';
import { duration, easing } from '../../lib/motion';
import { highlight, matches, rank } from '../search-select/match';
import { Kbd } from './Kbd';
import { Spinner } from './Spinner';
import { cx, useFocusTrap, useOverlayLayer } from './utils';

/* ── CommandPalette: ⌘K / Ctrl+K search across pages, actions and records ── */

export interface CommandItem {
  id: string;
  label: string;
  /** Heading the item is listed under (Pages, Actions, Users…). */
  group?: string;
  description?: string;
  icon?: ReactNode;
  /** Extra words that find it (e.g. "logout" for Sign out). */
  keywords?: string[];
  /** Keys shown on the right, e.g. ['mod', 'K']. */
  shortcut?: string[];
  onSelect?: () => void;
  /** Navigate here via onNavigate. */
  href?: string;
  disabled?: boolean;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  /** Extra results fetched as the user types (e.g. users from the API). Debounced. */
  loadItems?: (query: string) => Promise<CommandItem[]>;
  onNavigate?: (href: string) => void;
  placeholder?: string;
  /** Remember the last picks under this storage key and show them first. */
  recentKey?: string;
  /** Results per group when searching. */
  limit?: number;
}

const RECENT_MAX = 5;

export { useCommandShortcut } from './useCommandShortcut';

function readRecent(key?: string): string[] {
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function CommandPalette(props: CommandPaletteProps) {
  return createPortal(<AnimatePresence>{props.open && <Panel {...props} />}</AnimatePresence>, document.body);
}

function Panel({
  onOpenChange,
  items,
  loadItems,
  onNavigate,
  placeholder = 'Search pages, actions and people…',
  recentKey,
  limit = 8,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [remote, setRemote] = useState<CommandItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(() => readRecent(recentKey));
  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const close = () => onOpenChange(false);
  useOverlayLayer(true, close);
  useFocusTrap(panel, true, input);

  // Remote results, debounced; stale answers are ignored.
  useEffect(() => {
    if (!loadItems || !query.trim()) {
      setRemote([]);
      setLoading(false);
      return;
    }
    let live = true;
    setLoading(true);
    const t = setTimeout(() => {
      loadItems(query)
        .then((r) => live && setRemote(r))
        .catch(() => live && setRemote([]))
        .finally(() => live && setLoading(false));
    }, 200);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [query, loadItems]);

  const groups = useMemo(() => {
    const q = query.trim();
    const asOption = (it: CommandItem) => ({
      value: it.id,
      label: it.label,
      description: it.description,
      keywords: [...(it.keywords ?? []), it.group ?? ''],
    });
    let found: CommandItem[];
    if (!q) {
      const byId = new Map(items.map((i) => [i.id, i]));
      const rec = recent.map((r) => byId.get(r)).filter(Boolean) as CommandItem[];
      found = [...rec.map((r) => ({ ...r, group: 'Recent' })), ...items.filter((i) => !recent.includes(i.id))];
    } else {
      found = [...items, ...remote].filter((i) => matches(asOption(i), q)).sort((a, b) => rank(asOption(a), q) - rank(asOption(b), q));
    }
    const out = new Map<string, CommandItem[]>();
    for (const it of found) {
      const g = it.group ?? 'Results';
      const arr = out.get(g) ?? [];
      if (!q || arr.length < limit) arr.push(it);
      out.set(g, arr);
    }
    return [...out.entries()];
  }, [items, remote, query, recent, limit]);

  const flat = groups.flatMap(([, its]) => its).filter((i) => !i.disabled);
  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const run = (it: CommandItem | undefined) => {
    if (!it || it.disabled) return;
    if (recentKey) {
      const next = [it.id, ...recent.filter((r) => r !== it.id)].slice(0, RECENT_MAX);
      setRecent(next);
      try {
        localStorage.setItem(recentKey, JSON.stringify(next));
      } catch {
        /* storage blocked */
      }
    }
    close();
    // Let the dialog close (and focus return) before navigating or opening something else.
    setTimeout(() => {
      if (it.href) onNavigate?.(it.href);
      it.onSelect?.();
    }, 0);
  };

  const onKey = (e: KeyboardEvent) => {
    const n = flat.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (n ? (a + 1) % n : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (n ? (a - 1 + n) % n : 0));
    } else if (e.key === 'Home' && e.ctrlKey) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End' && e.ctrlKey) {
      e.preventDefault();
      setActive(n - 1);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      setActive((a) => Math.min(n - 1, a + 8));
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 8));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(flat[active]);
    }
  };

  let index = -1;
  const activeId = flat[active] ? `${id}-${flat[active].id}` : undefined;

  return (
    <m.div
      className="overlay cmdk-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: duration.fast } }}
      exit={{ opacity: 0, transition: { duration: duration.fast } }}
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <m.div
        ref={panel}
        className="cmdk"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: duration.base, ease: easing.enter } }}
        exit={{ opacity: 0, y: -6, scale: 0.99, transition: { duration: duration.fast, ease: easing.exit } }}
      >
        <div className="cmdk-search">
          <Search size={18} aria-hidden="true" />
          <input
            ref={input}
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-label="Search commands"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            autoComplete="off"
            spellCheck={false}
          />
          {loading && <Spinner size={16} label="Searching" />}
          <Kbd>Esc</Kbd>
        </div>
        <div ref={list} className="cmdk-list" id={`${id}-list`} role="listbox" aria-label="Results">
          {flat.length === 0 && !loading && <div className="cmdk-empty">No results for “{query}”.</div>}
          {groups.map(([group, its]) => (
            <div key={group} role="group" aria-labelledby={`${id}-g-${group}`} className="cmdk-group">
              <div className="cmdk-group-label" id={`${id}-g-${group}`} role="presentation">
                {group}
              </div>
              {its.map((it) => {
                if (!it.disabled) index++;
                const i = it.disabled ? -1 : index;
                const on = i === active;
                return (
                  <div
                    key={`${group}-${it.id}`}
                    id={`${id}-${it.id}`}
                    role="option"
                    aria-selected={on}
                    aria-disabled={it.disabled || undefined}
                    data-index={i}
                    className={cx('cmdk-item', on && 'is-active', it.disabled && 'is-disabled')}
                    onMouseMove={() => i >= 0 && i !== active && setActive(i)}
                    onClick={() => run(it)}
                  >
                    {it.icon && (
                      <span className="cmdk-icon" aria-hidden="true">
                        {it.icon}
                      </span>
                    )}
                    <span className="cmdk-text">
                      <span className="cmdk-label">
                        {highlight(it.label, query).map((r, k) => (r.hit ? <mark key={k}>{r.text}</mark> : <span key={k}>{r.text}</span>))}
                      </span>
                      {it.description && <span className="cmdk-desc">{it.description}</span>}
                    </span>
                    {it.shortcut ? (
                      <Kbd keys={it.shortcut} />
                    ) : (
                      on && <CornerDownLeft size={15} className="cmdk-enter" aria-hidden="true" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cmdk-foot" aria-hidden="true">
          <span>
            <Kbd keys={['up', 'down']} /> move
          </span>
          <span>
            <Kbd keys={['enter']} /> open
          </span>
          <span>
            <Kbd keys={['mod', 'K']} /> toggle
          </span>
        </div>
      </m.div>
    </m.div>
  );
}
