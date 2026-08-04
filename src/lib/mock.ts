/**
 * Demo mode: an in-memory imitation of the Anjana Admin API so the UI can be explored
 * without a server. Enabled with VITE_DEMO_MODE=true. Changes are kept for the browser tab
 * (sessionStorage), so a reload or an emailed link keeps them; a new tab starts fresh.
 */
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import { DEMO_LOGIN } from './config';
import type { AuditEntry, Permission, Role, User } from './types';
import { accountRoutes, restoreAccount, snapshotAccount } from './mock-account';

const permissions: Permission[] = [
  ['dashboard-view', 'See the dashboard'],
  ['admin-user-view', 'See the list of users'],
  ['admin-user-create', 'Add users'],
  ['admin-user-edit', 'Edit users, enable and disable accounts'],
  ['admin-user-delete', 'Delete users'],
  ['admin-role-view', 'See roles and the permission catalogue'],
  ['admin-role-create', 'Create roles'],
  ['admin-role-edit', 'Rename roles and change their permissions'],
  ['admin-role-delete', 'Delete roles'],
].map(([permissionName, description], i) => ({ id: i + 1, permissionName, description }));
const all = permissions.map((p) => p.permissionName);

let roleSeq = 4;
const roles: Role[] = [
  {
    id: 1,
    roleName: 'SUPER_ADMIN',
    system: true,
    description: 'Built-in. Holds every permission and can see the audit log.',
    permissions: [...all],
  },
  { id: 2, roleName: 'ADMIN', system: false, description: 'Manages users and roles.', permissions: [...all] },
  { id: 3, roleName: 'USER', system: false, description: 'Standard member. Can see the dashboard.', permissions: ['dashboard-view'] },
  {
    id: 4,
    roleName: 'SUPPORT',
    system: false,
    description: 'Helps users with their accounts.',
    permissions: ['dashboard-view', 'admin-user-view', 'admin-user-edit'],
  },
];

const DAY = 86_400_000;
const ago = (d: number, h = 0) => new Date(Date.now() - d * DAY - h * 3_600_000).toISOString();
let userSeq = 0;
const mk = (name: string, email: string, roleIds: number[], d: number, extra: Partial<User> = {}): User => ({
  id: ++userSeq,
  name,
  email,
  phone: null,
  address: null,
  enabled: true,
  system: false,
  roles: roles.filter((r) => roleIds.includes(r.id)),
  lastLoginAt: d < 20 ? ago(d % 5, 3) : null,
  createdAt: ago(d),
  updatedAt: ago(d),
  emailVerified: true,
  twoFactorEnabled: false,
  ...extra,
});
const users: User[] = [
  mk('Demo Admin', DEMO_LOGIN.email, [1], 120, { system: true, lastLoginAt: ago(0, 1) }),
  mk('Alex Morgan', 'alex@example.com', [2], 2, { phone: '+1 415 555 0132' }),
  mk('Priya Shah', 'priya@example.com', [3], 5),
  mk('Daniel Okafor', 'daniel@example.com', [4], 9, { phone: '+44 20 7946 0958' }),
  mk('Mei Chen', 'mei@example.com', [3], 14),
  mk('Lucas Silva', 'lucas@example.com', [3], 22, { enabled: false }),
  mk('Sofia Rossi', 'sofia@example.com', [2, 4], 31),
  mk('Noah Becker', 'noah@example.com', [3], 46),
  mk('Amara Nwosu', 'amara@example.com', [3], 58),
  mk('Kenji Watanabe', 'kenji@example.com', [4], 73),
  mk('Hannah Lee', 'hannah@example.com', [3], 90),
  mk('Omar Haddad', 'omar@example.com', [3], 104),
];

/** Who the current request is from (set from the demo token). */
let currentId = 1;

/* ── audit trail ── */
let auditSeq = 0;
const audit: AuditEntry[] = [];
const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 Safari/605.1.15';
function log(e: Partial<AuditEntry> & Pick<AuditEntry, 'category' | 'action' | 'module'>, at = new Date().toISOString()) {
  audit.unshift({ id: ++auditSeq, userName: me().email, createdAt: at, ipAddress: '203.0.113.24', userAgent: ua, ...e });
}
(function seedAudit() {
  const people = users.filter((u) => u.lastLoginAt || u.id < 6).map((u) => u.email);
  for (let d = 13; d >= 0; d--) {
    const n = 3 + ((d * 7) % 6);
    for (let i = 0; i < n; i++) {
      const email = people[(d + i) % people.length];
      log({ category: 'AUTH', action: 'LOGIN', module: 'Auth', userName: email, details: 'Signed in' }, ago(d, 9 - i));
    }
    if (d % 3 === 0)
      log(
        {
          category: 'AUTH',
          action: 'LOGIN_FAILED',
          module: 'Auth',
          userName: 'unknown@example.com',
          details: 'Sign-in failed: unknown email',
        },
        ago(d, 2),
      );
    if (d % 4 === 1)
      log(
        {
          category: 'AUTH',
          action: 'LOGIN_FAILED',
          module: 'Auth',
          userName: 'mei@example.com',
          details: 'Sign-in failed: wrong password',
        },
        ago(d, 5),
      );
  }
  const rid = 'c0ffee00-1a2b-4c3d-9e8f-000000000001';
  log(
    {
      category: 'REQUEST',
      action: 'UPDATE',
      module: 'users',
      recordId: 6,
      httpMethod: 'PATCH',
      path: '/users/6/status',
      statusCode: 200,
      durationMs: 41,
      requestId: rid,
      details: 'PATCH /users/6/status',
    },
    ago(1, 4),
  );
  log(
    {
      category: 'DATA',
      action: 'UPDATE',
      module: 'User',
      recordId: 6,
      requestId: rid,
      details: 'Updated User: enabled',
      changes: '{"enabled":{"old":"true","new":"false"}}',
    },
    ago(1, 4),
  );
  log(
    {
      category: 'BUSINESS',
      action: 'PASSWORD_CHANGED',
      module: 'User',
      recordId: 2,
      userName: 'alex@example.com',
      details: 'Changed own password',
    },
    ago(0, 6),
  );
  audit.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
})();

/* ── helpers ── */
const ok = <T>(data: T, message = 'Success') => ({ success: true, message, data });
function respond(config: InternalAxiosRequestConfig, status: number, body: unknown): Promise<AxiosResponse> {
  // A copy, like a real network response, so React Query sees new data.
  const res: AxiosResponse = { data: JSON.parse(JSON.stringify(body ?? null)), status, statusText: String(status), headers: {}, config };
  if (status >= 200 && status < 300) return Promise.resolve(res);
  return Promise.reject(new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, null, res));
}
const fail = (c: InternalAxiosRequestConfig, status: number, message: string) =>
  respond(c, status, { success: false, message, data: null });
const bodyOf = (c: InternalAxiosRequestConfig): any => (!c.data ? {} : typeof c.data === 'string' ? JSON.parse(c.data) : c.data);
function me(): User {
  return users.find((u) => u.id === currentId) ?? users[0];
}
const session = (token: string | null) => {
  const u = me();
  const superAdmin = u.roles.some((r) => r.system);
  const names = u.roles.map((r) => r.roleName).sort();
  return {
    token,
    id: u.id,
    username: u.email,
    name: u.name,
    email: u.email,
    phone: u.phone,
    address: u.address,
    role: [...u.roles].sort((a, b) => Number(b.system) - Number(a.system))[0]?.roleName ?? '',
    roles: names,
    permissions: superAdmin ? all : [...new Set(u.roles.flatMap((r) => r.permissions))].sort(),
    superAdmin,
    emailVerified: u.emailVerified !== false,
    twoFactorEnabled: !!u.twoFactorEnabled,
  };
};
const roleView = (r: Role) => ({ ...r, userCount: users.filter((u) => u.roles.some((x) => x.id === r.id)).length });
const touchUserRoles = () => users.forEach((u) => (u.roles = u.roles.map((r) => roles.find((x) => x.id === r.id)!).filter(Boolean)));
function change(method: string, path: string, module: string, recordId: number | undefined, details: string, changes?: string) {
  const requestId = crypto.randomUUID?.() ?? String(Math.random());
  const action = method === 'DELETE' ? 'DELETE' : method === 'POST' && recordId === undefined ? 'CREATE' : 'UPDATE';
  log({
    category: 'REQUEST',
    action,
    module: path.split('/')[1],
    recordId,
    httpMethod: method,
    path,
    statusCode: 200,
    durationMs: 20 + Math.round(Math.random() * 60),
    requestId,
    details: `${method} ${path}`,
  });
  log({ category: 'DATA', action, module, recordId, requestId, details, changes });
}

/* ── persistence ── */
const STORE_KEY = 'atelier.demo.v1';
(function restore() {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    users.splice(0, users.length, ...d.users);
    roles.splice(0, roles.length, ...d.roles);
    audit.splice(0, audit.length, ...d.audit);
    ({ userSeq, roleSeq, auditSeq } = d);
    touchUserRoles();
    restoreAccount(d.account);
  } catch {
    /* storage blocked or old data: start fresh */
  }
})();
function persist() {
  try {
    sessionStorage.setItem(
      STORE_KEY,
      JSON.stringify({ users, roles, audit: audit.slice(0, 500), userSeq, roleSeq, auditSeq, account: snapshotAccount() }),
    );
  } catch {
    /* storage blocked or full */
  }
}

export const mockAdapter: AxiosAdapter = async (config) => {
  try {
    return await handle(config);
  } finally {
    if ((config.method ?? 'get').toLowerCase() !== 'get') persist();
  }
};

const handle: AxiosAdapter = async (config) => {
  await new Promise((r) => setTimeout(r, 160 + Math.random() * 200));
  const method = (config.method ?? 'get').toUpperCase();
  const url = (config.url ?? '').replace(/^https?:\/\/[^/]+/, '').split('?')[0];
  const body = bodyOf(config);

  const ctx = {
    config,
    method,
    url,
    body,
    users,
    roles,
    audit,
    log,
    respond,
    fail,
    ok,
    session,
    me,
    setCurrent: (id: number) => (currentId = id),
    authed: false,
  };
  // Public account endpoints (sign-in, sign-up, password reset…).
  const pub = accountRoutes(ctx);
  if (pub) return pub;

  const auth = String(config.headers.get('Authorization') ?? '');
  const tok = /^Bearer demo-token(?:\.(\d+))?/.exec(auth);
  const tokenUser = tok ? users.find((u) => u.id === Number(tok[1] ?? 1)) : undefined;
  if (!tokenUser || !tokenUser.enabled) return fail(config, 401, 'Your session has expired. Please sign in again.');
  currentId = tokenUser.id;
  ctx.authed = true;
  const mine = accountRoutes(ctx);
  if (mine) return mine;

  if (url === '/auth/logout') {
    log({ category: 'AUTH', action: 'LOGOUT', module: 'Auth', details: 'Signed out' });
    return respond(config, 200, ok(null, 'Signed out'));
  }
  if (url === '/me' && method === 'GET') return respond(config, 200, ok(session(null)));
  if (url === '/me' && method === 'PUT') {
    if (!String(body.name || '').trim()) return fail(config, 400, 'Name is required');
    Object.assign(me(), {
      name: body.name.trim(),
      phone: body.phone || null,
      address: body.address || null,
      updatedAt: new Date().toISOString(),
    });
    change('PUT', '/me', 'User', me().id, 'Updated User: name, phone, address');
    return respond(config, 200, ok(session(null), 'Profile updated'));
  }
  if (url === '/dashboard/summary') {
    const today = new Date();
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today.getTime() - (13 - i) * DAY);
      const key = d.toISOString().slice(0, 10);
      const day = audit.filter((a) => a.category === 'AUTH' && a.createdAt.slice(0, 10) === key);
      return {
        date: key,
        success: day.filter((a) => a.action === 'LOGIN').length,
        failed: day.filter((a) => a.action === 'LOGIN_FAILED').length,
      };
    });
    const last7 = days.slice(7);
    return respond(
      config,
      200,
      ok({
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.enabled).length,
        disabledUsers: users.filter((u) => !u.enabled).length,
        newUsersLast30Days: users.filter((u) => Date.now() - +new Date(u.createdAt!) < 30 * DAY).length,
        totalRoles: roles.length,
        totalPermissions: permissions.length,
        signInsLast7Days: last7.reduce((s, d) => s + d.success, 0),
        failedSignInsLast7Days: last7.reduce((s, d) => s + d.failed, 0),
        signInsByDay: days,
        usersByRole: roles
          .map((r) => ({ role: r.roleName, count: roleView(r).userCount }))
          .filter((r) => r.count > 0)
          .sort((a, b) => b.count - a.count),
        recentUsers: [...users].sort((a, b) => b.createdAt!.localeCompare(a.createdAt!)).slice(0, 5),
        recentActivity: audit.filter((a) => a.category === 'BUSINESS' || a.category === 'AUTH').slice(0, 8),
      }),
    );
  }

  if (url === '/audit-logs') {
    const p = (config.params ?? {}) as Record<string, string | undefined>;
    const rows = audit.filter(
      (a) =>
        (!p.category || a.category === p.category) &&
        (!p.date_from || a.createdAt.slice(0, 10) >= p.date_from) &&
        (!p.date_to || a.createdAt.slice(0, 10) <= p.date_to),
    );
    return respond(config, 200, ok(rows));
  }

  if (url === '/permissions') return respond(config, 200, ok(permissions));
  if (url === '/roles' && method === 'GET') return respond(config, 200, ok(roles.map(roleView)));
  if (url === '/roles' && method === 'POST') {
    if (roles.some((r) => r.roleName === body.roleName)) return fail(config, 409, 'A role with that name already exists.');
    const role: Role = {
      id: ++roleSeq,
      roleName: body.roleName,
      description: body.description || null,
      system: false,
      permissions: body.permissions ?? [],
    };
    roles.push(role);
    change('POST', '/roles', 'Role', undefined, 'Created Role', JSON.stringify({ name: { new: role.roleName } }));
    return respond(config, 201, ok(roleView(role), 'Role created'));
  }
  let m = url.match(/^\/roles\/(\d+)(\/permissions)?$/);
  if (m) {
    const role = roles.find((r) => r.id === Number(m![1]));
    if (!role) return fail(config, 404, 'Role not found');
    if (method !== 'GET' && role.system) return fail(config, 403, `The ${role.roleName} role is built in and can't be changed.`);
    if (m[2] && method === 'PUT') {
      role.permissions = permissions.filter((p) => (body as number[]).includes(p.id)).map((p) => p.permissionName);
      touchUserRoles();
      change('PUT', url, 'Role', role.id, 'Updated Role permissions');
      return respond(config, 200, ok(roleView(role), 'Permissions saved'));
    }
    if (method === 'PUT') {
      if (roles.some((r) => r.roleName === body.roleName && r.id !== role.id))
        return fail(config, 409, 'A role with that name already exists.');
      const old = role.roleName;
      role.roleName = body.roleName;
      role.description = body.description || null;
      touchUserRoles();
      change(
        'PUT',
        url,
        'Role',
        role.id,
        'Updated Role: name, description',
        old !== role.roleName ? JSON.stringify({ name: { old, new: role.roleName } }) : undefined,
      );
      return respond(config, 200, ok(roleView(role), 'Role updated'));
    }
    if (method === 'DELETE') {
      roles.splice(roles.indexOf(role), 1);
      users.forEach((u) => (u.roles = u.roles.filter((r) => r.id !== role.id)));
      change('DELETE', url, 'Role', role.id, 'Deleted Role (row removed)');
      return respond(config, 200, ok(null, 'Role deleted'));
    }
    return respond(config, 200, ok(roleView(role)));
  }

  if (url === '/users' && method === 'GET')
    return respond(config, 200, ok([...users].sort((a, b) => b.createdAt!.localeCompare(a.createdAt!))));
  if (url === '/users' && method === 'POST') {
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    if (users.some((u) => u.email === email))
      return respond(config, 409, {
        success: false,
        message: 'That email is already in use.',
        data: { email: 'That email is already in use.' },
      });
    const now = new Date().toISOString();
    const u: User = {
      id: ++userSeq,
      name: body.name,
      email,
      phone: body.phone || null,
      address: body.address || null,
      enabled: body.enabled !== false,
      system: false,
      roles: roles.filter((r) => (body.roleIds ?? []).includes(r.id)),
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };
    users.push(u);
    change(
      'POST',
      '/users',
      'User',
      undefined,
      'Created User',
      JSON.stringify({ name: { new: u.name }, email: { new: u.email }, passwordHash: { new: '***' } }),
    );
    return respond(config, 201, ok(u, 'User created'));
  }
  m = url.match(/^\/users\/(\d+)(\/status)?$/);
  if (m) {
    const u = users.find((x) => x.id === Number(m![1]));
    if (!u) return fail(config, 404, 'User not found');
    if (method !== 'GET' && u.system)
      return fail(config, 403, "The built-in administrator account can't be changed here. Its owner can update it from their profile.");
    if (m[2] && method === 'PATCH') {
      u.enabled = !!body.enabled;
      change(
        'PATCH',
        url,
        'User',
        u.id,
        'Updated User: enabled',
        JSON.stringify({ enabled: { old: String(!u.enabled), new: String(u.enabled) } }),
      );
      return respond(config, 200, ok(u, u.enabled ? 'User enabled' : 'User disabled'));
    }
    if (method === 'PUT') {
      const email = String(body.email || '')
        .trim()
        .toLowerCase();
      if (users.some((x) => x.email === email && x.id !== u.id))
        return respond(config, 409, {
          success: false,
          message: 'That email is already in use.',
          data: { email: 'That email is already in use.' },
        });
      const before = { name: u.name, email: u.email };
      Object.assign(u, {
        name: body.name,
        email,
        phone: body.phone || null,
        address: body.address || null,
        enabled: body.enabled !== false,
        roles: roles.filter((r) => (body.roleIds ?? []).includes(r.id)),
        updatedAt: new Date().toISOString(),
      });
      const diff: Record<string, { old: string; new: string }> = {};
      if (before.name !== u.name) diff.name = { old: before.name, new: u.name };
      if (before.email !== u.email) diff.email = { old: before.email, new: u.email };
      change('PUT', url, 'User', u.id, 'Updated User', Object.keys(diff).length ? JSON.stringify(diff) : undefined);
      return respond(config, 200, ok(u, 'User updated'));
    }
    if (method === 'DELETE') {
      users.splice(users.indexOf(u), 1);
      change('DELETE', url, 'User', u.id, 'Deleted User (row removed)');
      return respond(config, 200, ok(null, 'User deleted'));
    }
    return respond(config, 200, ok(u));
  }

  return fail(config, 404, `Demo mode: ${method} ${url} is not available`);
};
