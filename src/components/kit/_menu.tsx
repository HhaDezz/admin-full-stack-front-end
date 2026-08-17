import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cx } from './utils';

/* Shared by DropdownMenu and ContextMenu: the items and their keyboard handling. */

export type MenuEntry =
  | {
      type?: 'item';
      label: string;
      icon?: ReactNode;
      shortcut?: string;
      description?: string;
      onSelect?: () => void;
      danger?: boolean;
      disabled?: boolean;
    }
  | { type: 'checkbox'; label: string; icon?: ReactNode; checked: boolean; onCheckedChange: (v: boolean) => void; disabled?: boolean }
  | { type: 'separator' }
  | { type: 'label'; label: string };

/** Renders menu entries as menuitem / menuitemcheckbox elements. close() runs before an item's onSelect. */
export function renderMenuItems(items: MenuEntry[], close: () => void): ReactNode {
  return items.map((it, i) => {
    if (it.type === 'separator') return <div key={i} className="menu-sep" role="separator" />;
    if (it.type === 'label')
      return (
        <div key={i} className="menu-label" role="presentation">
          {it.label}
        </div>
      );
    if (it.type === 'checkbox')
      return (
        <div
          key={i}
          role="menuitemcheckbox"
          aria-checked={it.checked}
          aria-disabled={it.disabled || undefined}
          tabIndex={-1}
          className="menu-item"
          onClick={() => !it.disabled && it.onCheckedChange(!it.checked)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !it.disabled) {
              e.preventDefault();
              it.onCheckedChange(!it.checked);
            }
          }}
        >
          <span className="menu-check">{it.checked && <Check size={14} />}</span>
          {it.icon}
          <span className="menu-text">{it.label}</span>
        </div>
      );
    const pick = () => {
      if (it.disabled) return;
      close();
      it.onSelect?.();
    };
    return (
      <div
        key={i}
        role="menuitem"
        aria-disabled={it.disabled || undefined}
        tabIndex={-1}
        className={cx('menu-item', it.danger && 'is-danger')}
        onClick={pick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            pick();
          }
        }}
      >
        {it.icon && <span className="menu-icon">{it.icon}</span>}
        <span className="menu-text">
          {it.label}
          {it.description && <small>{it.description}</small>}
        </span>
        {it.shortcut && <kbd className="menu-kbd">{it.shortcut}</kbd>}
      </div>
    );
  });
}

/** Arrow keys, Home/End, Tab and type-ahead inside a menu panel. */
export function menuKeyDown(e: ReactKeyboardEvent, els: HTMLElement[], typed: { text: string; at: number }, closeNoRefocus: () => void) {
  const i = els.indexOf(document.activeElement as HTMLElement);
  const go = (n: number) => {
    e.preventDefault();
    els[(n + els.length) % els.length]?.focus();
  };
  if (e.key === 'ArrowDown') go(i + 1);
  else if (e.key === 'ArrowUp') go(i - 1);
  else if (e.key === 'Home') go(0);
  else if (e.key === 'End') go(els.length - 1);
  else if (e.key === 'Tab') closeNoRefocus();
  else if (e.key.length === 1 && /\S/.test(e.key)) {
    // Type-ahead: jump to the next item starting with what was typed.
    const now = Date.now();
    typed.text = now - typed.at > 700 ? e.key.toLowerCase() : typed.text + e.key.toLowerCase();
    typed.at = now;
    const order = [...els.slice(i + 1), ...els.slice(0, i + 1)];
    order.find((el) => el.textContent?.trim().toLowerCase().startsWith(typed.text))?.focus();
  }
}
