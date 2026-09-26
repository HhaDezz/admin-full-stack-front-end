import type { OptionValue, SelectOption } from './types';

/** Lower-case with accents removed, so "jose" finds "José". */
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Every word typed must appear in the label, description or keywords. */
export function matches<V extends OptionValue>(o: SelectOption<V>, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = normalize([o.label, o.description ?? '', ...(o.keywords ?? [])].join(' '));
  return words.every((w) => hay.includes(w));
}

/** Splits text into runs, marking the letters that match any typed word. */
export function highlight(text: string, query: string): { text: string; hit: boolean }[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [{ text, hit: false }];
  const norm = normalize(text);
  // NFD normalisation can change length for some scripts; fall back to no highlight then.
  if (norm.length !== text.length) return [{ text, hit: false }];
  const hit = new Array<boolean>(text.length).fill(false);
  for (const w of words) {
    for (let i = norm.indexOf(w); i !== -1; i = norm.indexOf(w, i + w.length)) {
      for (let k = i; k < i + w.length; k++) hit[k] = true;
    }
  }
  const runs: { text: string; hit: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = runs.at(-1);
    if (last && last.hit === hit[i]) last.text += text[i];
    else runs.push({ text: text[i], hit: hit[i] });
  }
  return runs;
}

/**
 * Lower is better: label starts with the query (0), a word in the label starts with it (1),
 * the label contains it (2), only the description or keywords match (3).
 */
export function rank<V extends OptionValue>(o: SelectOption<V>, query: string): number {
  const q = normalize(query.trim());
  if (!q) return 0;
  const label = normalize(o.label);
  if (label.startsWith(q)) return 0;
  if (label.split(/[\s\-_/.,()]+/).some((w) => w.startsWith(q))) return 1;
  if (label.includes(q)) return 2;
  return 3;
}
