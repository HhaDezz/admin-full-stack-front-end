import { useEffect, useState } from 'react';

export type Density = 'comfortable' | 'compact';
export interface TablePrefs {
  hidden: string[];
  pageSize: number;
  density: Density;
  /** Column widths set by resizing, in px. */
  widths?: Record<string, number>;
}

/** Per-table preferences remembered in this browser (silently skipped if storage is unavailable). */
export function useTablePrefs(id: string, defaults: TablePrefs) {
  const key = `atelier.table.${id}`;
  const [prefs, setPrefs] = useState<TablePrefs>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return { ...defaults, ...(JSON.parse(raw) as Partial<TablePrefs>) };
    } catch {
      /* ignore */
    }
    return defaults;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [key, prefs]);
  return [prefs, setPrefs] as const;
}
