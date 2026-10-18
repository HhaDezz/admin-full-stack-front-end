import { useSyncExternalStore } from 'react';
import { INVOICES, type Invoice } from './data';

/* A tiny in-memory store so the list and the detail page share changes (e.g. "Mark as paid")
 * during a visit. Swap it for TanStack Query calls to your invoices API. */

let invoices: Invoice[] = INVOICES;
const listeners = new Set<() => void>();

export function useInvoices(): Invoice[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => invoices,
  );
}

export function updateInvoice(id: string, patch: Partial<Invoice>) {
  invoices = invoices.map((i) => (i.id === id ? { ...i, ...patch } : i));
  listeners.forEach((l) => l());
}
