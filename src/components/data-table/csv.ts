import type { Column, Primitive } from './types';

function cellValue<T>(col: Column<T>, row: T): Primitive {
  if (col.exportValue) return col.exportValue(row);
  if (col.searchValue) return col.searchValue(row);
  if (col.sortValue) return col.sortValue(row);
  return '';
}

function escape(v: Primitive): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv<T>(columns: Column<T>[], rows: T[]): string {
  const head = columns.map((c) => escape(c.header)).join(',');
  const body = rows.map((r) => columns.map((c) => escape(cellValue(c, r))).join(','));
  return [head, ...body].join('\r\n');
}

export function downloadCsv(fileName: string, csv: string) {
  // BOM so Excel opens UTF-8 correctly.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
