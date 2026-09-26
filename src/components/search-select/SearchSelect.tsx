import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Check, ChevronDown, Loader2, Plus, Search, X } from 'lucide-react';
import { pop } from '../../lib/motion';
import { highlight, matches, normalize, rank } from './match';
import type { MultiSelectProps, OptionValue, SearchSelectProps, SelectOption, SingleSelectProps } from './types';
import { useMenuPosition, type MenuPosition } from './usePosition';
import { useField } from '../kit/Field';
import './search-select.css';

type Row<V extends OptionValue> =
  | { kind: 'group'; label: string }
  | { kind: 'option'; option: SelectOption<V>; nav: number }
  | { kind: 'create'; text: string; nav: number };
type NavRow<V extends OptionValue> = Exclude<Row<V>, { kind: 'group' }>;

/** Lists longer than this render only the visible rows. */
const VIRTUAL_THRESHOLD = 200;
const DEBOUNCE_MS = 250;

function Highlighted({ text, query }: { text: string; query: string }) {
  return <>{highlight(text, query).map((r, i) => (r.hit ? <mark key={i}>{r.text}</mark> : <span key={i}>{r.text}</span>))}</>;
}

/**
 * Searchable dropdown: single or multi-select, with search and highlighting, groups,
 * icons and descriptions, server search, "create new", keyboard support and ARIA
 * combobox semantics. The menu renders in a portal, so it works inside modals.
 */
export function SearchSelect<V extends OptionValue>(props: MultiSelectProps<V>): ReactElement;
export function SearchSelect<V extends OptionValue>(props: SingleSelectProps<V>): ReactElement;
export function SearchSelect<V extends OptionValue>(props: SearchSelectProps<V>): ReactElement {
  const {
    options = [],
    loadOptions,
    placeholder = 'Select…',
    searchPlaceholder = 'Search…',
    searchable = true,
    clearable = false,
    creatable = false,
    onCreate,
    disabled = false,
    error,
    size = 'md',
    emptyText = 'No matches',
    renderOption,
    minWidth,
    fullWidth,
    maxMenuHeight = 320,
    id,
    name,
    className,
  } = props;
  const multiple = props.multiple === true;
  const maxChips = props.multiple ? (props.maxChips ?? 3) : 0;
  const maxSelected = props.multiple ? props.maxSelected : undefined;
  const selected: V[] = useMemo(
    () => (props.multiple ? props.value : props.value == null ? [] : [props.value]),
    [props.multiple, props.value],
  );

  const reactId = useId().replace(/:/g, '');
  // Inside a Field: take its id, label, hint and invalid state like the other inputs.
  const field = useField();
  const baseId = id ?? field?.id ?? `ss-${reactId}`;
  const labelledBy = props['aria-labelledby'] ?? (field && !props['aria-label'] ? `${field.id}-label` : undefined);
  const invalid = !!error || !!field?.invalid;
  const listId = `${baseId}-list`;
  const errorId = `${baseId}-error`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [remote, setRemote] = useState<SelectOption<V>[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fieldRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef<MenuPosition | null>(null);
  /** Every option seen, so selected values keep their labels after a server search changes the list. */
  const known = useRef(new Map<V, SelectOption<V>>());

  options.forEach((o) => known.current.set(o.value, o));
  remote?.forEach((o) => known.current.set(o.value, o));
  const lookup = useCallback((v: V): SelectOption<V> => known.current.get(v) ?? { value: v, label: String(v) }, []);

  /* ── Server search ── */
  useEffect(() => {
    if (!open || !loadOptions) return;
    const q = query.trim();
    if (!q && options.length) {
      setRemote(null);
      setLoading(false);
      return;
    }
    let stale = false;
    setLoading(true);
    const timer = setTimeout(
      async () => {
        try {
          const result = await loadOptions(q);
          if (!stale) setRemote(result);
        } catch {
          if (!stale) setRemote([]);
        } finally {
          if (!stale) setLoading(false);
        }
      },
      q ? DEBOUNCE_MS : 0,
    );
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [open, query, loadOptions, options.length]);

  /* ── What the menu shows ── */
  const source = loadOptions ? (remote ?? options) : options;
  const visible = useMemo(() => {
    if (loadOptions) return source; // the server decides order
    const hits = source.filter((o) => matches(o, query));
    if (!query.trim()) return hits;
    // Best matches first; ties keep their original order (Array.prototype.sort is stable).
    return hits
      .map((o) => [rank(o, query), o] as const)
      .sort((a, b) => a[0] - b[0])
      .map(([, o]) => o);
  }, [source, query, loadOptions]);
  const typed = query.trim();
  const showCreate = creatable && !!typed && !source.some((o) => normalize(o.label) === normalize(typed));

  const { rows, navCount } = useMemo(() => {
    const out: Row<V>[] = [];
    const groups = new Map<string, SelectOption<V>[]>();
    const loose: SelectOption<V>[] = [];
    for (const o of visible) {
      if (o.group) {
        if (!groups.has(o.group)) groups.set(o.group, []);
        groups.get(o.group)!.push(o);
      } else loose.push(o);
    }
    let nav = 0;
    const push = (o: SelectOption<V>) => out.push({ kind: 'option', option: o, nav: o.disabled ? -1 : nav++ });
    loose.forEach(push);
    groups.forEach((list, label) => {
      out.push({ kind: 'group', label });
      list.forEach(push);
    });
    if (showCreate) out.push({ kind: 'create', text: typed, nav: nav++ });
    return { rows: out, navCount: nav };
  }, [visible, showCreate, typed]);

  const navRows = useMemo(() => rows.filter((r): r is NavRow<V> => r.kind !== 'group' && r.nav >= 0), [rows]);

  /* ── Open / close ── */
  const openMenu = useCallback(
    (initialQuery = '') => {
      if (disabled) return;
      setQuery(initialQuery);
      setOpen(true);
    },
    [disabled],
  );
  const closeMenu = useCallback((refocus: boolean) => {
    setOpen(false);
    setQuery('');
    setRemote(null);
    if (refocus) fieldRef.current?.focus();
  }, []);

  // Start on the selected option (single) or the first one.
  useEffect(() => {
    if (!open) return;
    const first = selected.length && !multiple ? navRows.findIndex((r) => r.kind === 'option' && r.option.value === selected[0]) : -1;
    setActive(first >= 0 ? first : 0);
    // Only when the menu opens or the search changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query]);

  useEffect(() => {
    if (active >= navCount) setActive(Math.max(0, navCount - 1));
  }, [active, navCount]);

  // Close on a press outside the field and the menu.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (fieldRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      closeMenu(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, closeMenu]);

  const pos = useMenuPosition(open, fieldRef, maxMenuHeight, Math.max(minWidth ?? 0, 240));
  if (pos) lastPos.current = pos;
  const shownPos = pos ?? lastPos.current;

  useEffect(() => {
    if (!open || !pos) return;
    (searchable ? inputRef.current : listRef.current)?.focus({ preventScroll: true });
  }, [open, pos, searchable]);

  /* ── Choosing ── */
  const emit = useCallback(
    (values: V[]) => {
      if (props.multiple) props.onChange(values, values.map(lookup));
      else props.onChange(values[0] ?? null, values.length ? lookup(values[0]) : null);
    },
    [props, lookup],
  );

  const isSelected = (v: V) => selected.includes(v);
  const atMax = maxSelected !== undefined && selected.length >= maxSelected;

  const choose = (o: SelectOption<V>) => {
    if (o.disabled) return;
    if (!multiple) {
      emit([o.value]);
      closeMenu(true);
      return;
    }
    if (isSelected(o.value)) emit(selected.filter((v) => v !== o.value));
    else if (!atMax) emit([...selected, o.value]);
  };

  const create = async (text: string) => {
    setCreating(true);
    try {
      const made = (await onCreate?.(text)) || ({ value: text as V, label: text } as SelectOption<V>);
      known.current.set(made.value, made);
      if (multiple) {
        if (!atMax) emit([...selected, made.value]);
        setQuery('');
      } else {
        emit([made.value]);
        closeMenu(true);
      }
    } finally {
      setCreating(false);
    }
  };

  const pick = (index: number) => {
    const row = navRows.at(index);
    if (!row) return;
    if (row.kind === 'option') choose(row.option);
    else if (row.kind === 'create') void create(row.text);
  };

  const removeValue = (v: V) => emit(selected.filter((x) => x !== v));

  /* ── Keyboard ── */
  const onFieldKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      openMenu();
    } else if ((e.key === 'Backspace' || e.key === 'Delete') && selected.length) {
      if (multiple) {
        e.preventDefault();
        removeValue(selected.at(-1)!);
      } else if (clearable) {
        e.preventDefault();
        emit([]);
      }
    } else if (searchable && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      openMenu(e.key);
    }
  };

  const onMenuKey = (e: KeyboardEvent<HTMLElement>) => {
    const move = (to: number) => {
      e.preventDefault();
      if (navCount) setActive((to + navCount) % navCount);
    };
    switch (e.key) {
      case 'ArrowDown':
        return move(active + 1);
      case 'ArrowUp':
        return move(active - 1);
      case 'PageDown':
        return move(Math.min(active + 8, navCount - 1));
      case 'PageUp':
        return move(Math.max(active - 8, 0));
      case 'Home':
        if (!searchable || !query) move(0);
        return;
      case 'End':
        if (!searchable || !query) move(navCount - 1);
        return;
      case 'Enter':
        e.preventDefault();
        pick(active);
        return;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        closeMenu(true);
        return;
      case 'Tab':
        closeMenu(false);
        return;
      default:
    }
  };

  /* ── Rendering helpers ── */
  const activeRow = navRows.at(active);
  const optionId = (nav: number) => `${baseId}-opt-${nav}`;
  const activeId = open && activeRow ? optionId(activeRow.nav) : undefined;

  const virtual = rows.length > VIRTUAL_THRESHOLD;
  const virtualizer = useVirtualizer({
    count: virtual ? rows.length : 0,
    getScrollElement: () => listRef.current,
    estimateSize: (i) => {
      const r = rows[i];
      return r?.kind === 'group' ? 30 : r?.kind === 'option' && r.option.description ? 52 : 38;
    },
    overscan: 8,
  });

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open || !activeRow) return;
    if (virtual) {
      const index = rows.indexOf(activeRow);
      if (index >= 0) virtualizer.scrollToIndex(index, { align: 'auto' });
    } else {
      document.getElementById(optionId(activeRow.nav))?.scrollIntoView({ block: 'nearest' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open, virtual]);

  const renderRow = (
    row: Row<V>,
    key: string | number,
    style?: React.CSSProperties,
    measureRef?: (el: Element | null) => void,
    dataIndex?: number,
  ) => {
    if (row.kind === 'group') {
      return (
        <div key={key} className="ss-group" role="presentation" style={style} ref={measureRef} data-index={dataIndex}>
          {row.label}
        </div>
      );
    }
    if (row.kind === 'create') {
      const isActive = activeRow === row;
      return (
        <div
          key={key}
          id={optionId(row.nav)}
          role="option"
          aria-selected={false}
          aria-label={`Create “${row.text}”`}
          className={`ss-option ss-create ${isActive ? 'is-active' : ''}`}
          style={style}
          ref={measureRef}
          data-index={dataIndex}
          onMouseDown={(e) => e.preventDefault()}
          onMouseMove={() => setActive(navRows.indexOf(row))}
          onClick={() => void create(row.text)}
        >
          <span className="ss-icon">{creating ? <Loader2 size={15} className="spin" /> : <Plus size={15} />}</span>
          <span className="ss-text">
            Create “<b>{row.text}</b>”
          </span>
        </div>
      );
    }
    const o = row.option;
    const sel = isSelected(o.value);
    const isActive = activeRow === row;
    const blocked = !!o.disabled || (multiple && !sel && atMax);
    return (
      <div
        key={key}
        id={row.nav >= 0 ? optionId(row.nav) : undefined}
        role="option"
        aria-selected={sel}
        aria-disabled={blocked || undefined}
        // An explicit name: highlight marks inside the label must not split what screen readers say.
        aria-label={o.description ? `${o.label}, ${o.description}` : o.label}
        className={`ss-option ${isActive ? 'is-active' : ''} ${sel ? 'is-selected' : ''} ${blocked ? 'is-disabled' : ''}`}
        style={style}
        ref={measureRef}
        data-index={dataIndex}
        onMouseDown={(e) => e.preventDefault()}
        onMouseMove={() => row.nav >= 0 && !isActive && setActive(navRows.indexOf(row))}
        onClick={() => !blocked && choose(o)}
      >
        {renderOption ? (
          renderOption(o, { selected: sel, active: isActive, query })
        ) : (
          <>
            {multiple && (
              <span className={`ss-check ${sel ? 'is-on' : ''}`} aria-hidden="true">
                {sel && <Check size={12} strokeWidth={3} />}
              </span>
            )}
            {o.icon && <span className="ss-icon">{o.icon}</span>}
            <span className="ss-text">
              <span className="ss-label">
                <Highlighted text={o.label} query={query} />
              </span>
              {o.description && (
                <span className="ss-desc">
                  <Highlighted text={o.description} query={query} />
                </span>
              )}
            </span>
            {!multiple && sel && <Check size={16} className="ss-tick" aria-hidden="true" />}
          </>
        )}
      </div>
    );
  };

  const selectedOptions = selected.map(lookup);
  const single = !multiple ? selectedOptions[0] : undefined;
  const errorText = typeof error === 'string' ? error : undefined;
  const status = loading ? 'Loading…' : `${navCount} ${navCount === 1 ? 'result' : 'results'}`;

  let menuBody: ReactNode;
  if (!rows.length) {
    menuBody = <div className="ss-empty">{loading ? 'Searching…' : typed || !loadOptions ? emptyText : 'Type to search'}</div>;
  } else if (virtual) {
    menuBody = (
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer
          .getVirtualItems()
          .map((vi) =>
            renderRow(
              rows[vi.index],
              vi.key as string,
              { position: 'absolute', top: 0, left: 0, right: 0, transform: `translateY(${vi.start}px)` },
              virtualizer.measureElement,
              vi.index,
            ),
          )}
      </div>
    );
  } else {
    menuBody = rows.map((r, i) => renderRow(r, i));
  }

  const listMax = shownPos
    ? Math.max(140, Math.min(maxMenuHeight, shownPos.space - (searchable ? 56 : 8) - (multiple ? 44 : 0)))
    : maxMenuHeight;

  return (
    <div className={`ss ss-${size} ${fullWidth ? 'ss-full' : ''} ${className ?? ''}`} style={minWidth ? { minWidth } : undefined}>
      <div
        ref={fieldRef}
        id={baseId}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={props['aria-label']}
        aria-labelledby={labelledBy}
        aria-disabled={disabled || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={[errorText ? errorId : '', field?.describedBy ?? ''].filter(Boolean).join(' ') || undefined}
        className={`ss-field ${open ? 'is-open' : ''} ${invalid ? 'is-error' : ''} ${disabled ? 'is-disabled' : ''}`}
        onClick={() => (open ? closeMenu(false) : openMenu())}
        onKeyDown={onFieldKey}
      >
        <div className="ss-value">
          {multiple ? (
            selectedOptions.length ? (
              <span className="ss-chips">
                <AnimatePresence initial={false} mode="popLayout">
                  {selectedOptions.slice(0, maxChips).map((o) => (
                    <m.span
                      key={String(o.value)}
                      layout
                      className="ss-chip"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.14 }}
                    >
                      {o.icon && <span className="ss-chip-icon">{o.icon}</span>}
                      <span className="ss-chip-label">{o.label}</span>
                      {!disabled && (
                        <button
                          type="button"
                          tabIndex={-1}
                          className="ss-chip-x"
                          aria-label={`Remove ${o.label}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeValue(o.value);
                          }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </m.span>
                  ))}
                  {selectedOptions.length > maxChips && (
                    <m.span
                      key="more"
                      layout
                      className="ss-chip ss-more"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      +{selectedOptions.length - maxChips}
                    </m.span>
                  )}
                </AnimatePresence>
              </span>
            ) : (
              <span className="ss-placeholder">{placeholder}</span>
            )
          ) : single ? (
            <span className="ss-single">
              {single.icon && <span className="ss-icon">{single.icon}</span>}
              <span className="ss-single-label">{single.label}</span>
            </span>
          ) : (
            <span className="ss-placeholder">{placeholder}</span>
          )}
        </div>
        {clearable && selected.length > 0 && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            className="ss-clear"
            aria-label="Clear selection"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              emit([]);
            }}
          >
            <X size={14} />
          </button>
        )}
        <ChevronDown size={16} className="ss-chevron" aria-hidden="true" />
      </div>
      {errorText && (
        <div id={errorId} className="ss-error">
          {errorText}
        </div>
      )}
      {name && selected.map((v) => <input key={String(v)} type="hidden" name={name} value={String(v)} />)}

      {createPortal(
        <AnimatePresence>
          {open && shownPos && (
            <m.div
              ref={menuRef}
              className={`ss-menu ss-menu-${shownPos.placement}`}
              style={{
                left: shownPos.left,
                width: shownPos.width,
                top: shownPos.top,
                bottom: shownPos.bottom,
                transformOrigin: shownPos.placement === 'bottom' ? 'top center' : 'bottom center',
              }}
              variants={pop}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {searchable && (
                <div className="ss-search">
                  <Search size={15} aria-hidden="true" />
                  <input
                    ref={inputRef}
                    type="text"
                    role="combobox"
                    aria-expanded="true"
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={activeId}
                    aria-label={searchPlaceholder}
                    placeholder={searchPlaceholder}
                    value={query}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onMenuKey}
                  />
                  {loading && <Loader2 size={15} className="spin ss-loading" aria-hidden="true" />}
                </div>
              )}
              <div
                ref={listRef}
                id={listId}
                role="listbox"
                tabIndex={searchable ? -1 : 0}
                aria-multiselectable={multiple || undefined}
                aria-activedescendant={searchable ? undefined : activeId}
                aria-label={props['aria-label']}
                className="ss-list"
                style={{ maxHeight: listMax }}
                onKeyDown={searchable ? undefined : onMenuKey}
              >
                {menuBody}
              </div>
              {multiple && (
                <div className="ss-foot">
                  <span>
                    {selected.length} selected{maxSelected !== undefined ? ` of ${maxSelected} max` : ''}
                  </span>
                  <span className="ss-foot-actions">
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        const add = visible.filter((o) => !o.disabled && !isSelected(o.value)).map((o) => o.value);
                        const room = maxSelected === undefined ? add.length : Math.max(0, maxSelected - selected.length);
                        emit([...selected, ...add.slice(0, room)]);
                      }}
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => emit([])}
                      disabled={!selected.length}
                    >
                      Clear
                    </button>
                  </span>
                </div>
              )}
              <div className="sr-only" role="status" aria-live="polite">
                {status}
              </div>
            </m.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
