import { lazy, useEffect, Suspense, useCallback, useMemo, useState } from 'react';
import * as m from 'motion/react-m';
import { rise } from '../lib/motion';
import { PageFallback } from './ui';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  FolderOpen,
  Mail,
  MessagesSquare,
  Receipt,
  SquareKanban,
  Blocks,
  ChevronDown,
  FileWarning,
  History,
  KeyRound,
  BarChart3,
  FilePlus2,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  ShoppingBag,
  Tags,
  LayoutTemplate,
  Lock,
  LogOut,
  Menu,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { config } from '../lib/config';
import { titleCase } from '../lib/format';
import { useTheme } from '../lib/theme';
import { NotificationBell } from './NotificationBell';
import { useIdleLock } from './useIdleLock';
import { ErrorBoundary } from './ErrorBoundary';
import { Avatar, Breadcrumbs, DropdownMenu, IconButton, Kbd, NavMenu, useCommandShortcut, type NavMenuSection } from './kit';
import { useUnreadCount } from '../lib/queries';
import { BLOCK_COUNT, KIT_COUNT, nameFromSlug } from '../showcase/kitCount';

const ThemeCustomizer = lazy(() => import('./ThemeCustomizer'));
const AppCommandPalette = lazy(() => import('./AppCommandPalette'));

const SECTIONS: NavMenuSection[] = [
  {
    label: 'Workspace',
    items: [
      { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={19} />, end: true },
      { to: '/users', label: 'Users', icon: <Users size={19} />, perm: 'admin-user-view' },
      { to: '/roles', label: 'Roles', icon: <ShieldCheck size={19} />, perm: 'admin-role-view' },
      { to: '/permissions', label: 'Permissions', icon: <KeyRound size={19} />, perm: 'admin-role-view' },
      { to: '/audit', label: 'Audit log', icon: <ScrollText size={19} />, perm: 'SUPER_ADMIN' },
    ],
  },
  ...(config.showcase
    ? [
        {
          label: 'Dashboards',
          items: [
            { to: '/dashboards/analytics', label: 'Analytics', icon: <BarChart3 size={19} /> },
            { to: '/dashboards/sales', label: 'Sales', icon: <ShoppingBag size={19} /> },
            { to: '/dashboards/projects', label: 'Projects', icon: <FolderKanban size={19} /> },
          ],
        },
        {
          label: 'Apps',
          items: [
            { to: '/apps/kanban', label: 'Kanban', icon: <SquareKanban size={19} /> },
            { to: '/apps/calendar', label: 'Calendar', icon: <CalendarDays size={19} /> },
            { to: '/apps/chat', label: 'Chat', icon: <MessagesSquare size={19} /> },
            { to: '/apps/mail', label: 'Mail', icon: <Mail size={19} /> },
            { to: '/apps/files', label: 'Files', icon: <FolderOpen size={19} /> },
            { to: '/apps/invoices', label: 'Invoices', icon: <Receipt size={19} />, match: (p: string) => p.startsWith('/apps/invoices') },
          ],
        },
        {
          label: 'Pages',
          items: [
            { to: '/pricing', label: 'Pricing', icon: <Tags size={19} /> },
            { to: '/help', label: 'Help centre', icon: <LifeBuoy size={19} /> },
            { to: '/changelog', label: 'Changelog', icon: <Megaphone size={19} /> },
            { to: '/starter', label: 'Starter page', icon: <FilePlus2 size={19} />, perm: 'dashboard-view' },
          ],
        },
        {
          label: 'Design',
          items: [
            {
              to: '/ui',
              label: 'UI Kit',
              icon: <Blocks size={19} />,
              badge: KIT_COUNT,
              end: true,
              match: (p: string) => p.startsWith('/ui/') && p !== '/ui/blocks' && p !== '/ui/motion',
            },
            { to: '/ui/blocks', label: 'Blocks', icon: <LayoutTemplate size={19} />, badge: BLOCK_COUNT },
            { to: '/ui/motion', label: 'Motion', icon: <Sparkles size={19} /> },
            {
              label: 'System pages',
              icon: <FileWarning size={19} />,
              children: [
                { to: '/404', label: '404 Not found' },
                { to: '/403', label: '403 Forbidden' },
                { to: '/500', label: '500 Server error' },
                { to: '/maintenance', label: 'Maintenance' },
                { to: '/coming-soon', label: 'Coming soon' },
              ],
            },
          ],
        },
      ]
    : []),
];

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/notifications': 'Notifications',
  '/activity': 'My activity',
  '/users': 'Users',
  '/roles': 'Roles',
  '/permissions': 'Permissions',
  '/audit': 'Audit log',
  '/ui': 'UI Kit',
  '/dashboards/analytics': 'Analytics',
  '/dashboards/sales': 'Sales',
  '/dashboards/projects': 'Projects',
  '/pricing': 'Pricing',
  '/help': 'Help centre',
  '/changelog': 'Changelog',
  '/starter': 'Starter page',
  '/apps/kanban': 'Kanban',
  '/apps/calendar': 'Calendar',
  '/apps/chat': 'Chat',
  '/apps/mail': 'Mail',
  '/apps/files': 'Files',
  '/apps/invoices': 'Invoices',
};

function crumbsFor(pathname: string) {
  if (pathname === '/ui/blocks') return [{ label: 'UI Kit', to: '/ui' }, { label: 'Blocks' }];
  if (pathname === '/ui/motion') return [{ label: 'UI Kit', to: '/ui' }, { label: 'Motion' }];
  if (pathname.startsWith('/ui/')) {
    return [{ label: 'UI Kit', to: '/ui' }, { label: nameFromSlug(pathname.slice(4)) }];
  }
  if (pathname.startsWith('/apps/invoices/')) {
    return [{ label: 'Invoices', to: '/apps/invoices' }, { label: pathname.slice(15).toUpperCase() }];
  }
  if (pathname.startsWith('/settings/')) {
    const tab = pathname.slice(10);
    return [{ label: 'Settings', to: '/settings/profile' }, { label: tab.charAt(0).toUpperCase() + tab.slice(1) }];
  }
  return [{ label: TITLES[pathname] ?? 'Not found' }];
}

export default function Layout() {
  const { session, logout, can, lock } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState<boolean | null>(null); // null = never opened, so its code isn't loaded yet
  const [palette, setPalette] = useState<boolean | null>(null);
  const { pathname } = useLocation();
  const allowed = (perm: string) => (perm === 'SUPER_ADMIN' ? !!session?.superAdmin : can(perm));
  const name = session?.name || session?.email || 'User';
  const unread = useUnreadCount().data ?? 0;
  useIdleLock();
  const openPalette = useCallback(() => setPalette(true), []);
  // Fetch the palette's code once the page is idle, so ⌘K opens instantly the first time.
  useEffect(() => {
    const t = setTimeout(() => void import('./AppCommandPalette'), 1200);
    return () => clearTimeout(t);
  }, []);
  useCommandShortcut(openPalette);
  const sections = useMemo<NavMenuSection[]>(
    () => [
      SECTIONS[0],
      {
        label: 'Account',
        items: [
          { to: '/notifications', label: 'Notifications', icon: <Bell size={19} />, badge: unread || undefined },
          { to: '/activity', label: 'My activity', icon: <History size={19} /> },
          { to: '/settings/profile', label: 'Settings', icon: <Settings size={19} />, match: '/settings' },
        ],
      },
      ...SECTIONS.slice(1),
    ],
    [unread],
  );

  return (
    <div className={`shell ${collapsed ? 'collapsed' : ''} ${open ? 'open' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">{config.appName.slice(0, 1).toUpperCase()}</div>
          <div>
            <div className="brand-name">{config.appName}</div>
            <div className="brand-sub">Admin</div>
          </div>
        </div>
        <NavMenu sections={sections} can={allowed} collapsed={collapsed} onNavigate={() => setOpen(false)} />
        <div className="side-foot">
          <button
            className="side-user"
            onClick={() => {
              navigate('/settings/profile');
              setOpen(false);
            }}
            title="Profile and settings"
          >
            <Avatar name={name} size={34} />
            <div style={{ minWidth: 0, textAlign: 'start' }}>
              <div className="name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </div>
              <div className="role">{session?.role ? titleCase(session.role) : 'No role'}</div>
            </div>
          </button>
        </div>
      </aside>
      <div className="scrim" onClick={() => setOpen(false)} />

      <div className="main">
        <header className="topbar">
          <IconButton className="mobile-only" label="Open menu" tooltip={false} icon={<Menu size={20} />} onClick={() => setOpen(true)} />
          <IconButton
            className="desktop-only"
            label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            icon={collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
            onClick={() => setCollapsed((c) => !c)}
          />
          <Breadcrumbs items={crumbsFor(pathname)} aria-label="You are here" />
          <span className="spacer" />
          <button
            type="button"
            className="search-trigger"
            onClick={openPalette}
            aria-label="Search (Ctrl K)"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <Search size={16} />
            <span>Search…</span>
            <Kbd keys={['mod', 'K']} />
          </button>
          <IconButton className="hide-sm" label="Customize theme" icon={<Palette size={18} />} onClick={() => setCustom(true)} />
          <IconButton
            className="hide-sm"
            label="Toggle dark mode"
            icon={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
            }}
          />
          <NotificationBell />
          <DropdownMenu
            label="Account"
            align="end"
            minWidth={230}
            trigger={
              <button className="btn btn-ghost btn-sm top-profile" aria-label={`Account: ${name}`}>
                <Avatar name={name} size={26} /> <span className="hide-sm top-name">{name.split(' ')[0]}</span>
                <ChevronDown size={14} className="hide-sm" />
              </button>
            }
            items={[
              { type: 'label', label: session?.email ?? '' },
              { label: 'Profile and settings', icon: <Settings size={15} />, onSelect: () => navigate('/settings/profile') },
              { label: 'Security', icon: <Shield size={15} />, onSelect: () => navigate('/settings/security') },
              { label: 'My activity', icon: <History size={15} />, onSelect: () => navigate('/activity') },
              { label: 'Customize theme', icon: <Palette size={15} />, onSelect: () => setCustom(true) },
              { type: 'separator' },
              { label: 'Lock screen', icon: <Lock size={15} />, onSelect: lock },
              { label: 'Sign out', icon: <LogOut size={15} />, onSelect: () => void logout() },
            ]}
          />
        </header>
        <m.main className="content" key={pathname} variants={rise} initial="hidden" animate="show">
          <ErrorBoundary resetKey={pathname}>
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </m.main>
      </div>
      {palette !== null && (
        <Suspense fallback={null}>
          <AppCommandPalette open={palette} onOpenChange={setPalette} sections={sections} onCustomize={() => setCustom(true)} />
        </Suspense>
      )}
      {custom !== null && (
        <Suspense fallback={null}>
          <ThemeCustomizer open={custom} onClose={() => setCustom(false)} />
        </Suspense>
      )}
    </div>
  );
}
