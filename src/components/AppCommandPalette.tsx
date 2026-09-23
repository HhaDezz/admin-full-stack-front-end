import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Activity, Bell, Blocks, KeyRound, Lock, LogOut, Moon, Palette, Settings, Shield, Sun, UserPlus } from 'lucide-react';
import { api, unwrap } from '../lib/api';
import { useAuth } from '../lib/auth';
import { keys } from '../lib/queries';
import { useTheme } from '../lib/theme';
import type { User } from '../lib/types';
import { registry } from '../showcase/registry';
import { config } from '../lib/config';
import { Avatar, CommandPalette, type CommandItem, type NavMenuSection } from './kit';

/** ⌘K for this app: pages from the sidebar, settings, actions, people and UI Kit components. */
export default function AppCommandPalette({
  open,
  onOpenChange,
  sections,
  onCustomize,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  sections: NavMenuSection[];
  onCustomize: () => void;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { can, session, logout, lock } = useAuth();
  const { theme, toggle } = useTheme();
  const allowed = useCallback(
    (perm?: string) => !perm || (perm === 'SUPER_ADMIN' ? !!session?.superAdmin : can(perm)),
    [can, session?.superAdmin],
  );

  const items = useMemo<CommandItem[]>(() => {
    const pages: CommandItem[] = sections.flatMap((s) =>
      s.items.flatMap((it) => {
        const own = it.to && allowed(it.perm) ? [{ id: `page:${it.to}`, label: it.label, group: 'Pages', icon: it.icon, href: it.to }] : [];
        const kids = (it.children ?? [])
          .filter((c) => c.to && allowed(c.perm))
          .map((c) => ({ id: `page:${c.to}`, label: c.label, description: it.label, group: 'Pages', href: c.to }));
        return [...own, ...kids];
      }),
    );
    const account: CommandItem[] = [
      {
        id: 'set:profile',
        label: 'Profile',
        description: 'Settings',
        group: 'Account',
        icon: <Settings size={16} />,
        href: '/settings/profile',
        keywords: ['name', 'phone'],
      },
      {
        id: 'set:security',
        label: 'Security',
        description: 'Password, two-step sign-in, devices',
        group: 'Account',
        icon: <Shield size={16} />,
        href: '/settings/security',
        keywords: ['2fa', 'mfa', 'sessions'],
      },
      { id: 'set:password', label: 'Change password', group: 'Account', icon: <KeyRound size={16} />, href: '/settings/security' },
      {
        id: 'set:notifications',
        label: 'Notification settings',
        group: 'Account',
        icon: <Bell size={16} />,
        href: '/settings/notifications',
        keywords: ['email', 'alerts'],
      },
      {
        id: 'notifications',
        label: 'Notifications',
        group: 'Account',
        icon: <Bell size={16} />,
        href: '/notifications',
        keywords: ['inbox', 'alerts'],
      },
      {
        id: 'activity',
        label: 'My activity',
        group: 'Account',
        icon: <Activity size={16} />,
        href: '/activity',
        keywords: ['history', 'sign-ins'],
      },
    ];
    const actions: CommandItem[] = [
      ...(can('admin-user-create')
        ? [
            {
              id: 'act:new-user',
              label: 'Add a user',
              group: 'Actions',
              icon: <UserPlus size={16} />,
              href: '/users?new=1',
              keywords: ['invite', 'create'],
            },
          ]
        : []),
      {
        id: 'act:theme',
        label: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
        group: 'Actions',
        icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />,
        onSelect: () => toggle(),
        keywords: ['theme', 'dark', 'light'],
      },
      {
        id: 'act:customize',
        label: 'Customize theme',
        group: 'Actions',
        icon: <Palette size={16} />,
        onSelect: onCustomize,
        keywords: ['colour', 'color', 'brand', 'rtl'],
      },
      { id: 'act:lock', label: 'Lock screen', group: 'Actions', icon: <Lock size={16} />, onSelect: lock },
      {
        id: 'act:logout',
        label: 'Sign out',
        group: 'Actions',
        icon: <LogOut size={16} />,
        onSelect: () => void logout(),
        keywords: ['log out', 'logout'],
      },
    ];
    const kit: CommandItem[] = config.showcase
      ? registry.map((c) => ({
          id: `ui:${c.slug}`,
          label: c.name,
          description: c.group,
          group: 'UI Kit',
          icon: <Blocks size={16} />,
          href: `/ui/${c.slug}`,
          keywords: [c.description],
        }))
      : [];
    return [...pages, ...account, ...actions, ...kit];
  }, [sections, allowed, can, theme, toggle, onCustomize, lock, logout]);

  // People, when the user may see them: searched from the cached list.
  const loadItems = useMemo(
    () =>
      can('admin-user-view')
        ? async (q: string) => {
            const users = await qc.fetchQuery({
              queryKey: keys.users,
              queryFn: () => unwrap<User[]>(api.get('/users')),
              staleTime: 30_000,
            });
            const t = q.trim().toLowerCase();
            return users
              .filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(t))
              .slice(0, 6)
              .map((u) => ({
                id: `user:${u.id}`,
                label: u.name,
                description: u.email,
                group: 'People',
                icon: <Avatar name={u.name} size={22} />,
                href: `/users?q=${encodeURIComponent(u.email)}`,
                keywords: [u.email],
              }));
          }
        : undefined,
    [can, qc],
  );

  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      items={items}
      loadItems={loadItems}
      onNavigate={navigate}
      recentKey="atelier.cmdk.recent"
    />
  );
}
