import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, Columns3, Download, Inbox, Rows3, Rows4, Search, SearchX, X } from 'lucide-react';
import { Checkbox, Empty, Notice, Skeleton } from '../ui';
import { useScrollFocus } from '../kit/utils';
import { downloadCsv, toCsv } from './csv';
import { Pagination } from './Pagination';
import { Popover } from './Popover';
import type { Column, DataTableProps, Primitive, SortDir } from './types';
import { useTablePrefs } from './usePrefs';

function compare(a: Primitive, b: Primitive): number {
  const na = a === null || a === undefined || a === '';
  const nb = b === null || b === undefined || b === '';
  if (na || nb) return na === nb ? 0 : na ? 1 : -1; // blanks always last
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

const CHECK_W = 44;
const EXPAND_W = 40;
const DEFAULT_PIN_W = 160;
const ROW_H = { comfortable: 53, compact: 37 };

/**
 * Reusable data table: search, sorting, pagination, column visibility, row selection
 * with bulk actions, CSV export, density toggle and loading / empty / error states.
 * Optional: pinned and resizable columns, expandable rows, server mode and virtual rows.
 */
export function DataTable<T>(props: DataTableProps<T>) {
  const {
    id,
    label,
    data,
    columns,
    rowKey,
    loading,
    error,
    searchable = true,
    searchPlaceholder = 'Search',
    toolbar,
    defaultQuery,
    initialSort,
    pageSizes = [10, 25, 50, 100],
    selectable,
    bulkActions,
    rowActions,
    onRowClick,
    exportFileName,
    empty,
    emptyFiltered,
    filtered,
    resizableColumns,
    pinActions,
    expandable,
    server,
    virtual,
  } = props;

  const [prefs, setPrefs] = useTablePrefs(id, {
    hidden: columns.filter((c) => c.defaultHidden).map((c) => c.id),
    pageSize: pageSizes[0],
    density: 'comfortable',
  });
  const [query, setQuery] = useState(defaultQuery ?? '');
  const [sort, setSort] = useState<{ id: string; dir: SortDir } | null>(initialSort ?? null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [open, setOpen] = useState<Set<string | number>>(new Set());
  const [edges, setEdges] = useState({ start: false, end: false });
  const wrap = useRef<HTMLDivElement>(null);
  useScrollFocus(wrap);

  // Start-pinned columns first, end-pinned last.
  const visible = useMemo(() => {
    const shown = columns.filter((c) => !prefs.hidden.includes(c.id));
    return [...shown.filter((c) => c.pin === 'start'), ...shown.filter((c) => !c.pin), ...shown.filter((c) => c.pin === 'end')];
  }, [columns, prefs.hidden]);
  const rows = useMemo(() => data ?? [], [data]);

  // 1. search (local mode only)
  const searched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (server || !needle) return rows;
    const searchCols = columns.filter((c) => c.searchValue);
    return rows.filter((r) => searchCols.some((c) => c.searchValue!(r).toLowerCase().includes(needle)));
  }, [rows, columns, query, server]);

  // 2. sort (local mode only)
  const sorted = useMemo(() => {
    const col = sort && columns.find((c) => c.id === sort.id);
    if (server || !col?.sortValue) return searched;
    const dir = sort!.dir === 'asc' ? 1 : -1;
    return [...searched].sort((a, b) => compare(col.sortValue!(a), col.sortValue!(b)) * dir);
  }, [searched, sort, columns, server]);

  // 3. paginate (not in server or virtual mode)
  const total = server ? server.total : sorted.length;
  const pages = Math.max(1, Math.ceil(total / prefs.pageSize));
  const current = Math.min(page, pages);
  const pageRows = server || virtual ? sorted : sorted.slice((current - 1) * prefs.pageSize, current * prefs.pageSize);

  // Server mode: report what to fetch. Search waits until typing pauses.
  const onQueryChange = useRef(server?.onQueryChange);
  onQueryChange.current = server?.onQueryChange;
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    if (!server) return;
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query, server]);
  useEffect(() => {
    onQueryChange.current?.({ page: current, pageSize: prefs.pageSize, sort, search: debounced.trim() });
  }, [current, prefs.pageSize, sort, debounced]);

  // Drop selections for rows that no longer exist (local mode; server pages come and go).
  useEffect(() => {
    if (server || !selected.size) return;
    const keys = new Set(rows.map(rowKey));
    const kept = [...selected].filter((k) => keys.has(k));
    if (kept.length !== selected.size) setSelected(new Set(kept));
  }, [rows, rowKey, selected, server]);

  const toggleSort = (c: Column<T>) => {
    if (!c.sortValue) return;
    setSort((s) => (s?.id !== c.id ? { id: c.id, dir: 'asc' } : s.dir === 'asc' ? { id: c.id, dir: 'desc' } : null));
    setPage(1);
  };

  const sortedKeys = sorted.map(rowKey);
  const selCount = sortedKeys.filter((k) => selected.has(k)).length;
  const allSelected = sorted.length > 0 && selCount === sorted.length;
  const selectedRows = rows.filter((r) => selected.has(rowKey(r)));
  const clear = () => setSelected(new Set());
  const toggleIn = (setter: typeof setSelected) => (k: string | number, on: boolean) =>
    setter((s) => {
      const n = new Set(s);
      if (on) n.add(k);
      else n.delete(k);
      return n;
    });
  const toggleRow = toggleIn(setSelected);
  const toggleOpen = toggleIn(setOpen);

  const exportCsv = () => {
    if (!exportFileName) return;
    const target = selectedRows.length ? selectedRows : sorted;
    downloadCsv(exportFileName, toCsv(visible, target));
  };

  /* ── widths, pinning and resizing ── */
  const widthOf = useCallback(
    (c: Column<T>) => prefs.widths?.[c.id] ?? (typeof c.width === 'number' ? c.width : undefined),
    [prefs.widths],
  );
  const anyStart = visible.some((c) => c.pin === 'start');
  const endCols = visible.filter((c) => c.pin === 'end');
  const actionsPinned = !!rowActions && (pinActions || endCols.length > 0);
  const ACTIONS_W = 96;
  const pinStyle = useMemo(() => {
    const out = new Map<string, CSSProperties>();
    let start = (selectable ? CHECK_W : 0) + (expandable ? EXPAND_W : 0);
    for (const c of visible.filter((x) => x.pin === 'start')) {
      out.set(c.id, { position: 'sticky', insetInlineStart: start });
      start += widthOf(c) ?? DEFAULT_PIN_W;
    }
    let end = actionsPinned ? ACTIONS_W : 0;
    for (const c of [...endCols].reverse()) {
      out.set(c.id, { position: 'sticky', insetInlineEnd: end });
      end += widthOf(c) ?? DEFAULT_PIN_W;
    }
    return out;
  }, [visible, endCols, selectable, expandable, actionsPinned, widthOf]);
  const lastStart = [...visible].reverse().find((c) => c.pin === 'start')?.id;
  const firstEnd = endCols[0]?.id;

  const colStyle = (c: Column<T>): CSSProperties => {
    const w = widthOf(c) ?? (c.pin ? DEFAULT_PIN_W : c.width);
    return {
      width: w,
      minWidth: typeof w === 'number' ? w : undefined,
      maxWidth: prefs.widths?.[c.id],
      textAlign: c.align,
      ...pinStyle.get(c.id),
    };
  };
  const pinClass = (c: Column<T>) =>
    c.pin
      ? `is-pinned${c.id === lastStart && edges.start ? ' pin-edge-start' : ''}${c.id === firstEnd && edges.end ? ' pin-edge-end' : ''}`
      : '';

  const setWidth = (c: Column<T>, w: number) =>
    setPrefs((p) => ({ ...p, widths: { ...p.widths, [c.id]: Math.max(c.minWidth ?? 72, Math.round(w)) } }));
  const resetWidth = (c: Column<T>) =>
    setPrefs((p) => {
      const widths = { ...p.widths };
      delete widths[c.id];
      return { ...p, widths };
    });
  const startResize = (c: Column<T>, e: PointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const th = e.currentTarget.parentElement as HTMLElement;
    const from = th.getBoundingClientRect().width;
    const x0 = e.clientX;
    const rtl = getComputedStyle(th).direction === 'rtl';
    const move = (ev: globalThis.PointerEvent) => setWidth(c, from + (ev.clientX - x0) * (rtl ? -1 : 1));
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      document.body.classList.remove('is-resizing');
    };
    document.body.classList.add('is-resizing');
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const resizeKey = (c: Column<T>, e: KeyboardEvent<HTMLSpanElement>) => {
    const th = e.currentTarget.parentElement as HTMLElement;
    const now = th.getBoundingClientRect().width;
    const step = e.shiftKey ? 48 : 16;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const rtl = getComputedStyle(th).direction === 'rtl';
      setWidth(c, now + ((e.key === 'ArrowRight') !== rtl ? step : -step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      resetWidth(c);
    }
  };

  // Shadows on pinned columns once there's content scrolled under them.
  const onScroll = useCallback(() => {
    const el = wrap.current;
    if (!el) return;
    const x = Math.abs(el.scrollLeft);
    const next = { start: x > 1, end: x + el.clientWidth < el.scrollWidth - 1 };
    setEdges((e) => (e.start === next.start && e.end === next.end ? e : next));
  }, []);
  useEffect(() => {
    onScroll();
    const el = wrap.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onScroll, visible.length, prefs.widths]);

  /* ── virtual rows ── */
  const virtualOn = !!virtual;
  const height = typeof virtual === 'object' && virtual.height ? virtual.height : 480;
  const rowVirtualizer = useVirtualizer({
    count: virtualOn ? pageRows.length : 0,
    getScrollElement: () => wrap.current,
    estimateSize: () => ROW_H[prefs.density],
    overscan: 8,
  });
  const vItems = virtualOn ? rowVirtualizer.getVirtualItems() : [];
  const padTop = vItems.length ? vItems[0].start : 0;
  const padBottom = vItems.length ? rowVirtualizer.getTotalSize() - vItems[vItems.length - 1].end : 0;

  const span = visible.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0) + (expandable ? 1 : 0);
  const isFiltered = !!query.trim() || !!filtered;
  const hideableCols = columns.filter((c) => c.hideable !== false);
  /** In server mode, sortValue only marks a column as sortable; the server does the sorting. */
  const sortable = (c: Column<T>) => !!c.sortValue;

  const renderRow = (r: T, index?: number) => {
    const k = rowKey(r);
    const isSel = selected.has(k);
    const canOpen = !!expandable && (expandable.canExpand?.(r) ?? true);
    const isOpen = canOpen && open.has(k);
    const detailId = `${id}-detail-${k}`;
    return [
      <tr
        key={k}
        data-index={index}
        aria-rowindex={index !== undefined ? index + 2 : undefined}
        className={`${isSel ? 'is-selected' : ''} ${onRowClick ? 'is-clickable' : ''} ${isOpen ? 'is-open' : ''}`}
        tabIndex={onRowClick ? 0 : undefined}
        onClick={onRowClick ? () => onRowClick(r) : undefined}
        onKeyDown={
          onRowClick
            ? (e) => {
                if (e.key === 'Enter' && e.target === e.currentTarget) onRowClick(r);
              }
            : undefined
        }
      >
        {selectable && (
          <td
            className={`dt-check ${anyStart ? 'is-pinned' : ''}`}
            style={anyStart ? { position: 'sticky', insetInlineStart: 0 } : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox hideLabel label="Select row" checked={isSel} onChange={(v) => toggleRow(k, v)} />
          </td>
        )}
        {expandable && (
          <td
            className={`dt-expand ${anyStart ? 'is-pinned' : ''}`}
            style={anyStart ? { position: 'sticky', insetInlineStart: selectable ? CHECK_W : 0 } : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            {canOpen && (
              <button
                type="button"
                className="btn btn-ghost btn-icon btn-sm dt-expand-btn"
                aria-expanded={isOpen}
                aria-controls={isOpen ? detailId : undefined}
                aria-label={isOpen ? 'Hide details' : 'Show details'}
                onClick={() => toggleOpen(k, !isOpen)}
              >
                <ChevronRight size={16} className="flip-rtl" />
              </button>
            )}
          </td>
        )}
        {visible.map((c) => (
          <td
            key={c.id}
            className={pinClass(c)}
            style={{
              ...pinStyle.get(c.id),
              maxWidth: prefs.widths?.[c.id],
              textAlign: c.align,
              whiteSpace: c.nowrap ? 'nowrap' : undefined,
            }}
          >
            {c.cell(r)}
          </td>
        ))}
        {rowActions && (
          <td
            className={`actions ${actionsPinned ? `is-pinned${edges.end && !firstEnd ? ' pin-edge-end' : ''}` : ''}`}
            style={actionsPinned ? { position: 'sticky', insetInlineEnd: 0, width: ACTIONS_W, minWidth: ACTIONS_W } : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            {rowActions(r)}
          </td>
        )}
      </tr>,
      isOpen ? (
        <tr key={`${k}-detail`} className="dt-detail" id={detailId}>
          <td colSpan={span}>
            <div className="dt-detail-body">{expandable!.render(r)}</div>
          </td>
        </tr>
      ) : null,
    ];
  };

  return (
    <div
      className={`dt card ${prefs.density === 'compact' ? 'dt-compact' : ''} ${virtualOn ? 'dt-virtual' : ''} ${resizableColumns ? 'dt-resizable' : ''}`}
    >
      <div className="sr-only" role="status" aria-live="polite">
        {!loading && data && isFiltered ? `${total} ${total === 1 ? 'result' : 'results'}` : ''}
      </div>
      {selectable && selectedRows.length > 0 ? (
        <div className="toolbar dt-bulk" role="region" aria-label={label ? `${label}: bulk actions` : 'Bulk actions'}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={clear} aria-label="Clear selection">
            <X size={16} />
          </button>
          <b>{selectedRows.length} selected</b>
          {!allSelected && sorted.length > selectedRows.length && (
            <button className="link" onClick={() => setSelected(new Set(sortedKeys))}>
              Select all {sorted.length}
            </button>
          )}
          <span className="grow" />
          {exportFileName && (
            <button className="btn btn-sm" onClick={exportCsv}>
              <Download size={14} /> Export selected
            </button>
          )}
          {bulkActions?.(selectedRows, clear)}
        </div>
      ) : (
        <div className="toolbar">
          {searchable && (
            <div className="input-wrap grow">
              <Search size={17} />
              <input
                className="input"
                placeholder={searchPlaceholder}
                value={query}
                aria-label={searchPlaceholder}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
              {query && (
                <button className="btn btn-ghost btn-icon btn-sm trail" onClick={() => setQuery('')} aria-label="Clear search">
                  <X size={15} />
                </button>
              )}
            </div>
          )}
          {toolbar}
          <div className="dt-tools">
            <button
              className="btn btn-icon"
              title={prefs.density === 'compact' ? 'Comfortable rows' : 'Compact rows'}
              aria-label="Toggle row density"
              onClick={() => setPrefs((p) => ({ ...p, density: p.density === 'compact' ? 'comfortable' : 'compact' }))}
            >
              {prefs.density === 'compact' ? <Rows3 size={17} /> : <Rows4 size={17} />}
            </button>
            {hideableCols.length > 1 && (
              <Popover
                label="Show columns"
                trigger={(isOpen) => (
                  <button
                    className={`btn btn-icon ${isOpen ? 'is-on' : ''}`}
                    title="Columns"
                    aria-label="Choose columns"
                    aria-expanded={isOpen}
                  >
                    <Columns3 size={17} />
                  </button>
                )}
              >
                <div className="pop-title">Show columns</div>
                {hideableCols.map((c) => {
                  const on = !prefs.hidden.includes(c.id);
                  const last = on && visible.length === 1;
                  return (
                    <label key={c.id} className="pop-item">
                      <Checkbox
                        hideLabel
                        checked={on}
                        disabled={last}
                        label={c.header}
                        onChange={(v) => setPrefs((p) => ({ ...p, hidden: v ? p.hidden.filter((h) => h !== c.id) : [...p.hidden, c.id] }))}
                      />
                      {c.header}
                    </label>
                  );
                })}
                {resizableColumns && prefs.widths && Object.keys(prefs.widths).length > 0 && (
                  <button className="link pop-reset" onClick={() => setPrefs((p) => ({ ...p, widths: {} }))}>
                    Reset column widths
                  </button>
                )}
              </Popover>
            )}
            {exportFileName && (
              <button className="btn" onClick={exportCsv} disabled={!sorted.length} title="Download the rows shown as a CSV file">
                <Download size={16} /> <span className="hide-sm">Export</span>
              </button>
            )}
          </div>
        </div>
      )}

      {error ? (
        <div className="card-pad">
          <Notice danger>{error}</Notice>
        </div>
      ) : (
        <div
          ref={wrap}
          className="table-wrap"
          onScroll={onScroll}
          style={virtualOn ? { maxHeight: height, overflowY: 'auto' } : undefined}
          tabIndex={virtualOn ? 0 : undefined}
          role={virtualOn ? 'region' : undefined}
          aria-label={virtualOn ? (label ?? 'Table') : undefined}
        >
          <table className="table" aria-label={label} aria-rowcount={virtualOn ? pageRows.length + 1 : undefined}>
            <thead>
              <tr>
                {selectable && (
                  <th
                    className={`dt-check ${anyStart ? 'is-pinned' : ''}`}
                    style={anyStart ? { position: 'sticky', insetInlineStart: 0 } : undefined}
                  >
                    <Checkbox
                      hideLabel
                      label="Select all rows"
                      checked={allSelected}
                      indeterminate={selCount > 0}
                      disabled={!sorted.length}
                      onChange={(v) => setSelected(v ? new Set(sortedKeys) : new Set())}
                    />
                  </th>
                )}
                {expandable && (
                  <th
                    className={`dt-expand ${anyStart ? 'is-pinned' : ''}`}
                    style={anyStart ? { position: 'sticky', insetInlineStart: selectable ? CHECK_W : 0 } : undefined}
                  >
                    <span className="sr-only">Details</span>
                  </th>
                )}
                {visible.map((c) => {
                  const active = sort?.id === c.id ? sort.dir : null;
                  const canResize = resizableColumns && c.resizable !== false;
                  return (
                    <th
                      key={c.id}
                      className={`${pinClass(c)} ${canResize ? 'is-resizable' : ''}`}
                      style={colStyle(c)}
                      aria-sort={active === 'asc' ? 'ascending' : active === 'desc' ? 'descending' : undefined}
                    >
                      {sortable(c) ? (
                        <button className={`th-sort ${active ? 'is-on' : ''}`} onClick={() => toggleSort(c)}>
                          {c.header}
                          {active === 'asc' ? (
                            <ArrowUp size={13} />
                          ) : active === 'desc' ? (
                            <ArrowDown size={13} />
                          ) : (
                            <ArrowUpDown size={13} className="th-idle" />
                          )}
                        </button>
                      ) : (
                        c.header
                      )}
                      {canResize && (
                        <span
                          className="th-resize"
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={`Resize ${c.header}`}
                          aria-valuenow={Math.round(widthOf(c) ?? 0) || undefined}
                          aria-valuemin={c.minWidth ?? 72}
                          tabIndex={0}
                          onPointerDown={(e) => startResize(c, e)}
                          onDoubleClick={() => resetWidth(c)}
                          onKeyDown={(e) => resizeKey(c, e)}
                        />
                      )}
                    </th>
                  );
                })}
                {rowActions && (
                  <th
                    className={`actions ${actionsPinned ? 'is-pinned' : ''}`}
                    style={actionsPinned ? { position: 'sticky', insetInlineEnd: 0, width: ACTIONS_W, minWidth: ACTIONS_W } : undefined}
                  >
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: Math.min(prefs.pageSize, 6) }, (_, i) => (
                  <tr key={i} className="dt-skel">
                    <td colSpan={span}>
                      <Skeleton h={prefs.density === 'compact' ? 18 : 26} />
                    </td>
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr className="dt-empty">
                  <td colSpan={span}>
                    {isFiltered && (rows.length || server) ? (
                      <Empty icon={emptyFiltered?.icon ?? <SearchX size={22} />} title={emptyFiltered?.title ?? 'No results'}>
                        {emptyFiltered?.description ?? 'Try a different search or clear a filter.'}
                      </Empty>
                    ) : (
                      <Empty icon={empty?.icon ?? <Inbox size={22} />} title={empty?.title ?? 'Nothing here yet'}>
                        {empty?.description}
                      </Empty>
                    )}
                  </td>
                </tr>
              ) : virtualOn ? (
                <>
                  {padTop > 0 && (
                    <tr aria-hidden="true" className="dt-spacer">
                      <td colSpan={span} style={{ height: padTop }} />
                    </tr>
                  )}
                  {vItems.map((v) => renderRow(pageRows[v.index], v.index))}
                  {padBottom > 0 && (
                    <tr aria-hidden="true" className="dt-spacer">
                      <td colSpan={span} style={{ height: padBottom }} />
                    </tr>
                  )}
                </>
              ) : (
                pageRows.map((r) => renderRow(r))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && total > 0 && !virtualOn && (
        <Pagination
          page={current}
          pages={pages}
          total={total}
          pageSize={prefs.pageSize}
          pageSizes={pageSizes}
          label={label}
          onPage={setPage}
          onPageSize={(n) => {
            setPrefs((p) => ({ ...p, pageSize: n }));
            setPage(1);
          }}
        />
      )}
      {virtualOn && !loading && !error && total > 0 && (
        <div className="dt-virtual-foot muted">
          {total.toLocaleString()} {total === 1 ? 'row' : 'rows'}
        </div>
      )}
    </div>
  );
}
