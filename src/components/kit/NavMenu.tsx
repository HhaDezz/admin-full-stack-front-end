import { type ReactNode, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { ChevronDown } from 'lucide-react';
import { duration, easing } from '../../lib/motion';
import { cx } from './utils';

/* ── Navigation menu (sidebar) ── */

export interface NavMenuItem {
  label: string;
  to?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  /** Match the route exactly (use for "/"). */
  end?: boolean;
  /** Only shown when `can(perm)` is true. */
  perm?: string;
  /** Also active on any path starting with this (e.g. "/settings" for every settings tab). */
  match?: string | ((pathname: string) => boolean);
  children?: NavMenuItem[];
}

export interface NavMenuSection {
  label?: string;
  items: NavMenuItem[];
}

const matches = (m: NavMenuItem['match'], pathname: string) => (typeof m === 'function' ? m(pathname) : !!m && pathname.startsWith(m));

export interface NavMenuProps {
  sections: NavMenuSection[];
  /** Permission check used for items with `perm`. */
  can?: (perm: string) => boolean;
  /** Icon-only mode (collapsed sidebar). */
  collapsed?: boolean;
  onNavigate?: () => void;
  'aria-label'?: string;
}

function visible(items: NavMenuItem[], can?: (p: string) => boolean): NavMenuItem[] {
  return items
    .filter((i) => !i.perm || !can || can(i.perm))
    .map((i) => (i.children ? { ...i, children: visible(i.children, can) } : i))
    .filter((i) => !i.children || i.children.length > 0);
}

export function NavMenu({ sections, can, collapsed, onNavigate, 'aria-label': label = 'Main' }: NavMenuProps) {
  const { pathname } = useLocation();
  const isActive = (i: NavMenuItem): boolean =>
    !!(i.to && (i.end ? pathname === i.to : pathname === i.to || pathname.startsWith(`${i.to}/`))) || !!i.children?.some(isActive);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return (
    <nav className="nav" aria-label={label}>
      {sections.map((s, si) => {
        const items = visible(s.items, can);
        if (!items.length) return null;
        return (
          <div key={si} className="nav-section">
            {s.label && <div className="nav-label">{s.label}</div>}
            {items.map((i) => {
              if (!i.children)
                return (
                  <NavLink
                    key={i.label}
                    to={i.to ?? '#'}
                    end={i.end}
                    onClick={onNavigate}
                    title={collapsed ? i.label : undefined}
                    className={({ isActive: on }) => (on || matches(i.match, pathname) ? 'active' : undefined)}
                    aria-current={matches(i.match, pathname) ? 'page' : undefined}
                  >
                    {i.icon}
                    <span>{i.label}</span>
                    {i.badge != null && <em className="nav-badge">{i.badge}</em>}
                  </NavLink>
                );
              const expanded = open[i.label] ?? isActive(i);
              return (
                <div key={i.label} className={cx('nav-group', isActive(i) && 'has-active')}>
                  <button
                    type="button"
                    className="nav-parent"
                    aria-expanded={expanded}
                    onClick={() => setOpen((o) => ({ ...o, [i.label]: !expanded }))}
                    title={collapsed ? i.label : undefined}
                  >
                    {i.icon}
                    <span>{i.label}</span>
                    {i.badge != null && <em className="nav-badge">{i.badge}</em>}
                    <ChevronDown size={15} className="nav-caret" />
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && !collapsed && (
                      <m.div
                        className="nav-children"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1, transition: { duration: duration.base, ease: easing.enter } }}
                        exit={{ height: 0, opacity: 0, transition: { duration: duration.fast, ease: easing.exit } }}
                      >
                        {i.children.map((c) => (
                          <NavLink key={c.label} to={c.to ?? '#'} end={c.end} onClick={onNavigate}>
                            <span>{c.label}</span>
                            {c.badge != null && <em className="nav-badge">{c.badge}</em>}
                          </NavLink>
                        ))}
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
