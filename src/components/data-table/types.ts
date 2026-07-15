import type { ReactNode } from 'react';

export type SortDir = 'asc' | 'desc';
export type Primitive = string | number | boolean | null | undefined;

export interface Column<T> {
  /** Unique, stable id. Used for sorting, visibility and saved preferences. */
  id: string;
  header: string;
  /** How the cell renders. */
  cell: (row: T) => ReactNode;
  /** Provide to make the column sortable. */
  sortValue?: (row: T) => Primitive;
  /** Text that the global search box matches against. */
  searchValue?: (row: T) => string;
  /** Value written to CSV. Falls back to searchValue, then sortValue. */
  exportValue?: (row: T) => Primitive;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  /** Can the user hide this column? Default true. */
  hideable?: boolean;
  /** Hidden until the user turns it on. */
  defaultHidden?: boolean;
  nowrap?: boolean;
  /** Keep this column in view while the table scrolls sideways. Start-pinned columns move to the front. */
  pin?: 'start' | 'end';
  /** Smallest width when resizing, in px. Default 72. */
  minWidth?: number;
  /** Turn off resizing for this column when the table has resizableColumns. */
  resizable?: boolean;
}

/** What a server-side table needs to fetch a page. */
export interface TableQuery {
  page: number;
  pageSize: number;
  sort: { id: string; dir: SortDir } | null;
  search: string;
}

export interface EmptyState {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
}

export interface DataTableProps<T> {
  /** Unique id; the table remembers page size, density and hidden columns under it. */
  id: string;
  /** Name for screen readers (e.g. "Users"). Also names the pagination and bulk-action bar, so two tables on a page stay distinct. */
  label?: string;
  data: T[] | undefined;
  columns: Column<T>[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  /** When set, an error message replaces the rows. */
  error?: string | null;

  /** Show the built-in search box. Default true. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Text the search box starts with (e.g. from a ?q= link). */
  defaultQuery?: string;
  /** Extra controls placed beside the search box (filters, etc.). */
  toolbar?: ReactNode;

  initialSort?: { id: string; dir: SortDir };
  pageSizes?: number[];

  /** Adds a checkbox column. */
  selectable?: boolean;
  /** Buttons shown while rows are selected. Call `clear()` to reset the selection. */
  bulkActions?: (rows: T[], clear: () => void) => ReactNode;

  /** Buttons at the end of each row. */
  rowActions?: (row: T) => ReactNode;
  /** Makes rows clickable (and focusable with Enter to open). */
  onRowClick?: (row: T) => void;

  /** Enables "Export CSV"; the file name, without extension. */
  exportFileName?: string;

  /** Shown when there is no data at all. */
  empty?: EmptyState;
  /** Shown when search/filters hide every row. */
  emptyFiltered?: EmptyState;
  /** Is a filter (outside the table) active? Used to choose the empty state. */
  filtered?: boolean;

  /** Drag (or use the arrow keys on) the edge of a header to resize. Widths are remembered. */
  resizableColumns?: boolean;
  /** Pin the row-actions column to the end, so it stays in view on wide tables. */
  pinActions?: boolean;

  /** A detail panel under a row, opened with a chevron. */
  expandable?: {
    render: (row: T) => ReactNode;
    /** Rows without details get no chevron. */
    canExpand?: (row: T) => boolean;
  };

  /**
   * Server mode: `data` is the current page, and the server does searching, sorting and paging.
   * The table calls onQueryChange (search is debounced) and shows `total` in the pagination.
   */
  server?: {
    total: number;
    onQueryChange: (q: TableQuery) => void;
  };

  /**
   * Virtual rows for long lists: no pagination; only the rows in view are rendered.
   * `height` is the scroll area's height in px (default 480).
   */
  virtual?: boolean | { height?: number };
}
