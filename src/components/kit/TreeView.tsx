import { useCallback, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { highlight } from '../search-select/match';
import { Spinner } from './Spinner';
import { cx, useControllable } from './utils';

/* ── TreeView: folders, categories, org charts and permission groups, with full keyboard support ── */

export interface TreeNode {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Text or a badge at the end of the row (a count, a size). */
  meta?: ReactNode;
  children?: TreeNode[];
  /** Has children that loadChildren will fetch when it opens. */
  hasChildren?: boolean;
  disabled?: boolean;
}

export interface TreeViewProps {
  items: TreeNode[];
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** none: rows only open and close. single: one row is selected. multiple: checkboxes that cascade to children. */
  selectionMode?: 'none' | 'single' | 'multiple';
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Enter or double-click on a row (open the file, go to the page). */
  onAction?: (node: TreeNode) => void;
  /** Shows rows whose label contains this text, with their parents opened. */
  filter?: string;
  /** Fetch children for nodes with hasChildren the first time they open. */
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
  size?: 'sm' | 'md';
  /** Vertical guide lines for each level. */
  lines?: boolean;
  'aria-label': string;
  className?: string;
}

interface Flat {
  node: TreeNode;
  depth: number;
  parent: string | null;
  setSize: number;
  pos: number;
}

const EMPTY: string[] = [];

export function TreeView({
  items,
  expanded,
  defaultExpanded = EMPTY,
  onExpandedChange,
  selectionMode = 'single',
  selected,
  defaultSelected = EMPTY,
  onSelectedChange,
  onAction,
  filter = '',
  loadChildren,
  size = 'md',
  lines = true,
  'aria-label': label,
  className,
}: TreeViewProps) {
  const [openIds, setOpenIds] = useControllable(expanded, defaultExpanded, onExpandedChange);
  const [selIds, setSelIds] = useControllable(selected, defaultSelected, onSelectedChange);
  const [loaded, setLoaded] = useState<Record<string, TreeNode[]>>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [focusId, setFocusId] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLLIElement>());
  const typed = useRef({ text: '', at: 0 });

  const kids = useCallback((n: TreeNode) => loaded[n.id] ?? n.children ?? [], [loaded]);
  const isParent = useCallback((n: TreeNode) => kids(n).length > 0 || (!!n.hasChildren && !loaded[n.id]), [kids, loaded]);

  // Filtering: matches plus every ancestor of a match.
  const q = filter.trim().toLowerCase();
  const { shown, forcedOpen } = useMemo(() => {
    const shownIds = new Set<string>();
    const open = new Set<string>();
    if (!q) return { shown: null, forcedOpen: open };
    const walk = (n: TreeNode): boolean => {
      const childHit = kids(n).map(walk).some(Boolean);
      const hit = n.label.toLowerCase().includes(q) || childHit;
      if (hit) shownIds.add(n.id);
      if (childHit) open.add(n.id);
      return hit;
    };
    items.forEach(walk);
    return { shown: shownIds, forcedOpen: open };
  }, [q, items, kids]);

  const openSet = useMemo(() => new Set(q ? [...openIds, ...forcedOpen] : openIds), [openIds, forcedOpen, q]);

  // Visible rows in order, for keyboard movement.
  const flat = useMemo(() => {
    const out: Flat[] = [];
    const visit = (list: TreeNode[], depth: number, parent: string | null) => {
      const vis = shown ? list.filter((n) => shown.has(n.id)) : list;
      vis.forEach((n, i) => {
        out.push({ node: n, depth, parent, setSize: vis.length, pos: i + 1 });
        if (openSet.has(n.id)) visit(kids(n), depth + 1, n.id);
      });
    };
    visit(items, 1, null);
    return out;
  }, [items, shown, openSet, kids]);
  const byId = useMemo(() => new Map(flat.map((f) => [f.node.id, f])), [flat]);
  const current = focusId && byId.has(focusId) ? focusId : (flat.find((f) => selIds.includes(f.node.id))?.node.id ?? flat[0]?.node.id);

  /* ── open / close ── */
  const setOpen = (n: TreeNode, open: boolean) => {
    if (open === openSet.has(n.id)) return;
    setOpenIds(open ? [...openIds, n.id] : openIds.filter((x) => x !== n.id));
    if (open && n.hasChildren && !loaded[n.id] && !n.children && loadChildren) {
      setLoading((s) => new Set(s).add(n.id));
      loadChildren(n)
        .then((c) => setLoaded((l) => ({ ...l, [n.id]: c })))
        .catch(() => setLoaded((l) => ({ ...l, [n.id]: [] })))
        .finally(() =>
          setLoading((s) => {
            const next = new Set(s);
            next.delete(n.id);
            return next;
          }),
        );
    }
  };

  /* ── selection; in multiple mode checking a node checks its children too ── */
  // Disabled rows keep their state when a parent is toggled.
  const descendants = (n: TreeNode): string[] => (n.disabled ? [] : [n.id, ...kids(n).flatMap(descendants)]);
  const checkState = (n: TreeNode, set: Set<string>): 'on' | 'off' | 'mixed' => {
    const c = kids(n).filter((x) => !x.disabled);
    if (!c.length) return set.has(n.id) ? 'on' : 'off';
    const states = c.map((x) => checkState(x, set));
    if (states.every((s) => s === 'on')) return 'on';
    if (states.every((s) => s === 'off')) return 'off';
    return 'mixed';
  };
  const selSet = useMemo(() => new Set(selIds), [selIds]);
  const select = (n: TreeNode) => {
    if (n.disabled || selectionMode === 'none') return;
    if (selectionMode === 'single') return setSelIds([n.id]);
    const next = new Set(selSet);
    const turnOn = checkState(n, selSet) !== 'on';
    for (const id of descendants(n)) {
      if (turnOn) next.add(id);
      else next.delete(id);
    }
    // Parents follow their children.
    const fix = (list: TreeNode[]) =>
      list.forEach((x) => {
        fix(kids(x));
        if (kids(x).length) {
          if (checkState(x, next) === 'on') next.add(x.id);
          else next.delete(x.id);
        }
      });
    fix(items);
    setSelIds([...next]);
  };

  const focus = (id: string | undefined) => {
    if (!id) return;
    setFocusId(id);
    refs.current.get(id)?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const i = flat.findIndex((f) => f.node.id === current);
    const f = flat[i];
    if (!f) return;
    const n = f.node;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const key = rtl && e.key === 'ArrowRight' ? 'ArrowLeft' : rtl && e.key === 'ArrowLeft' ? 'ArrowRight' : e.key;
    const handled = () => e.preventDefault();
    switch (key) {
      case 'ArrowDown':
        handled();
        return focus(flat[i + 1]?.node.id);
      case 'ArrowUp':
        handled();
        return focus(flat[i - 1]?.node.id);
      case 'Home':
        handled();
        return focus(flat[0]?.node.id);
      case 'End':
        handled();
        return focus(flat[flat.length - 1]?.node.id);
      case 'ArrowRight':
        handled();
        if (!isParent(n)) return;
        if (!openSet.has(n.id)) return setOpen(n, true);
        return focus(flat[i + 1]?.depth > f.depth ? flat[i + 1].node.id : undefined);
      case 'ArrowLeft':
        handled();
        if (isParent(n) && openSet.has(n.id)) return setOpen(n, false);
        return focus(f.parent ?? undefined);
      case 'Enter':
        handled();
        if (onAction) return onAction(n);
        if (selectionMode === 'none') return isParent(n) && setOpen(n, !openSet.has(n.id));
        return select(n);
      case ' ':
        handled();
        if (selectionMode === 'none') return isParent(n) && setOpen(n, !openSet.has(n.id));
        return select(n);
      case '*': {
        handled();
        const siblings = flat.filter((x) => x.parent === f.parent && isParent(x.node)).map((x) => x.node.id);
        return setOpenIds([...new Set([...openIds, ...siblings])]);
      }
      default:
        if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const now = Date.now();
          typed.current = { text: (now - typed.current.at < 600 ? typed.current.text : '') + e.key.toLowerCase(), at: now };
          const order = [...flat.slice(i + 1), ...flat.slice(0, i + 1)];
          const hit = order.find((x) => x.node.label.toLowerCase().startsWith(typed.current.text));
          if (hit) focus(hit.node.id);
        }
    }
  };

  const renderLevel = (list: TreeNode[], depth: number): ReactNode =>
    (shown ? list.filter((n) => shown.has(n.id)) : list).map((n) => {
      const f = byId.get(n.id);
      const parent = isParent(n);
      const open = parent && openSet.has(n.id);
      const state = selectionMode === 'multiple' ? checkState(n, selSet) : selSet.has(n.id) ? 'on' : 'off';
      const busy = loading.has(n.id);
      return (
        <li
          key={n.id}
          ref={(el) => {
            if (el) refs.current.set(n.id, el);
            else refs.current.delete(n.id);
          }}
          role="treeitem"
          aria-level={depth}
          aria-setsize={f?.setSize}
          aria-posinset={f?.pos}
          aria-expanded={parent ? open : undefined}
          aria-selected={selectionMode === 'single' ? state === 'on' : undefined}
          aria-checked={selectionMode === 'multiple' ? (state === 'mixed' ? 'mixed' : state === 'on') : undefined}
          aria-disabled={n.disabled || undefined}
          aria-busy={busy || undefined}
          tabIndex={n.id === current ? 0 : -1}
          className="tree-item"
          onFocus={(e) => {
            if (e.target === e.currentTarget) setFocusId(n.id);
          }}
        >
          <div
            className={cx('tree-row', state === 'on' && 'is-selected', n.disabled && 'is-disabled')}
            style={{ paddingInlineStart: `calc(${depth - 1} * var(--tree-indent) + 4px)` }}
            onClick={(e) => {
              e.stopPropagation();
              focus(n.id);
              if (selectionMode === 'none') {
                if (parent) setOpen(n, !open);
              } else select(n);
            }}
            onDoubleClick={() => onAction?.(n)}
          >
            {lines &&
              Array.from({ length: depth - 1 }, (_, k) => (
                <span
                  key={k}
                  className="tree-guide"
                  style={{ insetInlineStart: `calc(${k} * var(--tree-indent) + var(--tree-indent) / 2 + 4px)` }}
                />
              ))}
            <span
              className={cx('tree-toggle', !parent && 'is-leaf')}
              onClick={(e) => {
                if (!parent) return;
                e.stopPropagation();
                focus(n.id);
                setOpen(n, !open);
              }}
              aria-hidden="true"
            >
              {busy ? <Spinner size={13} label="" /> : parent && <ChevronRight size={15} className={cx('flip-rtl', open && 'is-open')} />}
            </span>
            {selectionMode === 'multiple' && <span className={cx('tree-check', `is-${state}`)} aria-hidden="true" />}
            {n.icon && (
              <span className="tree-icon" aria-hidden="true">
                {n.icon}
              </span>
            )}
            <span className="tree-label">
              {q
                ? highlight(n.label, filter.trim()).map((r, k) => (r.hit ? <mark key={k}>{r.text}</mark> : <span key={k}>{r.text}</span>))
                : n.label}
            </span>
            {n.meta != null && <span className="tree-meta">{n.meta}</span>}
          </div>
          {open && kids(n).length > 0 && (
            <ul role="group" className="tree-group">
              {renderLevel(kids(n), depth + 1)}
            </ul>
          )}
        </li>
      );
    });

  return (
    <ul
      role="tree"
      aria-label={label}
      aria-multiselectable={selectionMode === 'multiple' || undefined}
      className={cx('tree', `tree-${size}`, className)}
      onKeyDown={onKey}
    >
      {flat.length === 0 ? (
        <li role="none" className="tree-empty">
          {q ? `Nothing matches “${filter.trim()}”.` : 'Nothing here.'}
        </li>
      ) : (
        renderLevel(items, 1)
      )}
    </ul>
  );
}
