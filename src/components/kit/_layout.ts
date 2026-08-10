import type { Responsive, Space } from './types';

export const BPS = ['base', 'sm', 'md', 'lg', 'xl'] as const;

/** Turns a responsive prop into CSS variables: --{name}, --{name}-sm, … */
export function vars<T>(name: string, v: Responsive<T> | undefined, map: (x: T) => string): Record<string, string> {
  if (v === undefined) return {};
  if (typeof v !== 'object' || v === null) return { [`--${name}`]: map(v as T) };
  const out: Record<string, string> = {};
  for (const bp of BPS) {
    const x = (v as Record<string, T | undefined>)[bp];
    if (x !== undefined) out[bp === 'base' ? `--${name}` : `--${name}-${bp}`] = map(x);
  }
  return out;
}

export const space = (s: Space) => (typeof s === 'number' ? `${s * 4}px` : s);
