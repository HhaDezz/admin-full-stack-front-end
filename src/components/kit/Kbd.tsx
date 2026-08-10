import type { ReactNode } from 'react';

/* ── Kbd ── */

const MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

const SYMBOL: Record<string, string> = {
  mod: MAC ? '⌘' : 'Ctrl',
  cmd: '⌘',
  ctrl: 'Ctrl',
  alt: MAC ? '⌥' : 'Alt',
  shift: '⇧',
  enter: '↵',
  esc: 'Esc',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  tab: 'Tab',
  space: 'Space',
  backspace: '⌫',
};

/** Keyboard keys. "mod" shows ⌘ on Mac and Ctrl elsewhere: <Kbd keys={['mod', 'K']} />. */
export function Kbd({ keys, children }: { keys?: string[]; children?: ReactNode }) {
  if (!keys) return <kbd className="kbd">{children}</kbd>;
  return (
    <span className="kbd-combo">
      {keys.map((k, i) => (
        <kbd key={i} className="kbd">
          {SYMBOL[k.toLowerCase()] ?? k}
        </kbd>
      ))}
    </span>
  );
}
