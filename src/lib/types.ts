export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Role {
  id: number;
  roleName: string;
  description?: string | null;
  /** Built-in (SUPER_ADMIN): can't be edited, deleted or assigned by non-super-admins. */
  system: boolean;
  permissions: string[];
  /** Users holding this role (only on /roles responses). */
  userCount?: number | null;
}

export interface Permission {
  id: number;
  permissionName: string;
  description?: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  enabled: boolean;
  /** The built-in administrator account. */
  system: boolean;
  roles: Role[];
  lastLoginAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  /** False until the owner confirms the address from the emailed link. */
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

export interface Session {
  token: string;
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: string;
  roles: string[];
  permissions: string[];
  superAdmin: boolean;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

/** /auth/login answers either a session or this, when a code is still needed. */
export interface LoginResult extends Partial<Session> {
  twoFactorRequired?: boolean;
  challengeToken?: string | null;
}

export interface AuthOptions {
  registrationEnabled: boolean;
  requireEmailVerification: boolean;
  brandName: string;
}

export interface SecurityOverview {
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  recoveryCodesLeft: number;
  passwordChangedAt?: string | null;
  activeSessions: number;
}

export interface TwoFactorSetup {
  secret: string;
  otpauthUrl: string;
}

/** A signed-in device. */
export interface DeviceSession {
  id: string;
  browser: string;
  os: string;
  device: 'desktop' | 'phone' | 'tablet';
  ipAddress?: string | null;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
}

export type NotificationCategory = 'SECURITY' | 'ACCOUNT' | 'PRODUCT';

export interface AppNotification {
  id: number;
  category: NotificationCategory;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationPage {
  items: AppNotification[];
  total: number;
  unreadCount: number;
  page: number;
  size: number;
}

export interface Channels {
  inApp: boolean;
  email: boolean;
}

export interface NotificationSettings {
  security: Channels;
  account: Channels;
  product: Channels;
}

export interface ActivityEntry {
  id: number;
  at: string;
  category: string;
  action: string;
  entityName: string;
  details?: string | null;
  ipAddress?: string | null;
  browser?: string | null;
  os?: string | null;
}

export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  newUsersLast30Days: number;
  totalRoles: number;
  totalPermissions: number;
  signInsLast7Days: number;
  failedSignInsLast7Days: number;
  signInsByDay: { date: string; success: number; failed: number }[];
  usersByRole: { role: string; count: number }[];
  recentUsers: User[] | null;
  recentActivity: AuditEntry[] | null;
}

export type AuditCategory = 'REQUEST' | 'DATA' | 'BUSINESS' | 'AUTH';

export interface AuditEntry {
  id: number;
  category: AuditCategory;
  action: string;
  module: string;
  recordId?: number | null;
  userName: string;
  createdAt: string;
  details?: string | null;
  /** JSON text: {"field": {"old": "...", "new": "..."}} */
  changes?: string | null;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  httpMethod?: string | null;
  path?: string | null;
  statusCode?: number | null;
  durationMs?: number | null;
}

export interface UserPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  password?: string;
  roleIds: number[];
  enabled: boolean;
}

export interface RolePayload {
  roleName: string;
  description?: string;
  permissions?: string[];
}
