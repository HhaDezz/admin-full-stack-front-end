import { useQuery } from '@tanstack/react-query';
import { api, unwrap } from './api';
import { useAuth } from './auth';
import type {
  ActivityEntry,
  AuditEntry,
  AuthOptions,
  DashboardSummary,
  DeviceSession,
  NotificationPage,
  NotificationSettings,
  Permission,
  Role,
  SecurityOverview,
  User,
} from './types';

export const keys = {
  users: ['users'] as const,
  roles: ['roles'] as const,
  permissions: ['permissions'] as const,
  dashboard: ['dashboard'] as const,
  audit: (f: AuditFilters) => ['audit', f] as const,
  authOptions: ['auth-options'] as const,
  security: ['me', 'security'] as const,
  sessions: ['me', 'sessions'] as const,
  notificationSettings: ['me', 'notification-settings'] as const,
  notifications: (unread: boolean) => ['me', 'notifications', unread] as const,
  unreadCount: ['me', 'notifications', 'count'] as const,
  activity: ['me', 'activity'] as const,
};

export function useUsers() {
  const { can } = useAuth();
  return useQuery({ queryKey: keys.users, queryFn: () => unwrap<User[]>(api.get('/users')), enabled: can('admin-user-view') });
}

export function useRoles() {
  const { can } = useAuth();
  return useQuery({ queryKey: keys.roles, queryFn: () => unwrap<Role[]>(api.get('/roles')), enabled: can('admin-role-view') });
}

export function usePermissionCatalog() {
  const { can } = useAuth();
  return useQuery({
    queryKey: keys.permissions,
    queryFn: () => unwrap<Permission[]>(api.get('/permissions')),
    enabled: can('admin-role-view'),
  });
}

export function useDashboard() {
  const { can } = useAuth();
  return useQuery({
    queryKey: keys.dashboard,
    queryFn: () => unwrap<DashboardSummary>(api.get('/dashboard/summary')),
    enabled: can('dashboard-view'),
  });
}

export interface AuditFilters {
  from?: string;
  to?: string;
}

export function useAuditLog(f: AuditFilters) {
  const { session } = useAuth();
  return useQuery({
    queryKey: keys.audit(f),
    queryFn: () =>
      unwrap<AuditEntry[]>(
        api.get('/audit-logs', {
          params: { date_from: f.from || undefined, date_to: f.to || undefined, limit: 5000 },
        }),
      ),
    enabled: !!session?.superAdmin,
  });
}

/* ── Account ── */

/** Public sign-up settings (whether to show "Create account"). Cached for the session. */
export function useAuthOptions() {
  return useQuery({
    queryKey: keys.authOptions,
    queryFn: () => unwrap<AuthOptions>(api.get('/auth/options')),
    staleTime: Infinity,
    retry: false,
  });
}

export function useSecurityOverview() {
  return useQuery({ queryKey: keys.security, queryFn: () => unwrap<SecurityOverview>(api.get('/me/security')) });
}

export function useDeviceSessions() {
  return useQuery({ queryKey: keys.sessions, queryFn: () => unwrap<DeviceSession[]>(api.get('/me/sessions')) });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: keys.notificationSettings,
    queryFn: () => unwrap<NotificationSettings>(api.get('/me/notification-settings')),
  });
}

export function useNotifications(unread = false, size = 20) {
  return useQuery({
    queryKey: [...keys.notifications(unread), size],
    queryFn: () => unwrap<NotificationPage>(api.get('/me/notifications', { params: { unread, page: 0, size } })),
  });
}

/** The bell badge: re-checked every minute and when the tab regains focus. */
export function useUnreadCount() {
  const { session, locked } = useAuth();
  return useQuery({
    queryKey: keys.unreadCount,
    queryFn: async () => (await unwrap<{ count: number }>(api.get('/me/notifications/unread-count'))).count,
    enabled: !!session && !locked,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useActivity() {
  return useQuery({ queryKey: keys.activity, queryFn: () => unwrap<ActivityEntry[]>(api.get('/me/activity', { params: { limit: 300 } })) });
}
