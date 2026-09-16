/**
 * Demo mode: sign-in, sign-up, email links, two-step sign-in, devices, notifications and
 * activity, imitating the Anjana Admin API. Emails go to an in-memory inbox that the pages show
 * in demo mode, so every flow can be tried without a server.
 */
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { DEMO_LOGIN } from './config';
import type { AppNotification, AuditEntry, DeviceSession, NotificationSettings, Role, User } from './types';

type Respond = (c: InternalAxiosRequestConfig, status: number, body: unknown) => Promise<AxiosResponse>;
interface Ctx {
  config: InternalAxiosRequestConfig;
  method: string;
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  users: User[];
  roles: Role[];
  audit: AuditEntry[];
  log: (e: Partial<AuditEntry> & Pick<AuditEntry, 'category' | 'action' | 'module'>, at?: string) => void;
  respond: Respond;
  fail: (c: InternalAxiosRequestConfig, status: number, message: string) => Promise<AxiosResponse>;
  ok: <T>(data: T, message?: string) => { success: boolean; message: string; data: T };
  session: (token: string | null) => unknown;
  me: () => User;
  setCurrent: (id: number) => void;
  authed: boolean;
}

/* ── State ── */

export interface DemoEmail {
  to: string;
  subject: string;
  link: string;
  at: number;
}
/** Emails "sent" in demo mode, newest first. */
export const inbox: DemoEmail[] = [];

const DEFAULT_SETTINGS: NotificationSettings = {
  security: { inApp: true, email: true },
  account: { inApp: true, email: false },
  product: { inApp: true, email: false },
};

interface Account {
  password: string;
  recovery: string[];
  settings: NotificationSettings;
  lockedUntil?: number;
}
const accounts = new Map<number, Account>();
function acct(u: User): Account {
  let a = accounts.get(u.id);
  if (!a) {
    a = {
      password: u.email === DEMO_LOGIN.email ? DEMO_LOGIN.password : 'Password123!',
      recovery: [],
      settings: structuredClone(DEFAULT_SETTINGS),
    };
    accounts.set(u.id, a);
  }
  return a;
}

const links = new Map<string, { userId: number; purpose: 'verify' | 'reset'; expires: number; used: boolean }>();
const challenges = new Map<string, number>();

const MIN = 60_000;
const now = () => new Date().toISOString();
const agoMin = (m: number) => new Date(Date.now() - m * MIN).toISOString();
const rand = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);

const UA = {
  mac: { browser: 'Chrome', os: 'macOS', device: 'desktop' as const },
  iphone: { browser: 'Safari', os: 'iOS', device: 'phone' as const },
  windows: { browser: 'Firefox', os: 'Windows', device: 'desktop' as const },
};
const sessions = new Map<number, DeviceSession[]>();
function devicesOf(u: User): DeviceSession[] {
  let list = sessions.get(u.id);
  if (!list) {
    list = [{ id: `s-${u.id}-current`, ...UA.mac, ipAddress: '203.0.113.24', createdAt: agoMin(90), lastSeenAt: now(), current: true }];
    if (u.email === DEMO_LOGIN.email) {
      list.push(
        {
          id: `s-${u.id}-phone`,
          ...UA.iphone,
          ipAddress: '198.51.100.7',
          createdAt: agoMin(60 * 26),
          lastSeenAt: agoMin(42),
          current: false,
        },
        {
          id: `s-${u.id}-win`,
          ...UA.windows,
          ipAddress: '192.0.2.88',
          createdAt: agoMin(60 * 24 * 6),
          lastSeenAt: agoMin(60 * 30),
          current: false,
        },
      );
    }
    sessions.set(u.id, list);
  }
  return list;
}

let noteSeq = 100;
const notes = new Map<number, AppNotification[]>();
function notesOf(u: User): AppNotification[] {
  let list = notes.get(u.id);
  if (!list) {
    list = [];
    if (u.email === DEMO_LOGIN.email) {
      const seed: [AppNotification['category'], string, string, string, string | null, number, boolean][] = [
        ['SECURITY', 'NEW_SIGN_IN', 'New sign-in to your account', 'Safari on iOS, from 198.51.100.7.', '/settings/security', 42, false],
        ['ACCOUNT', 'ROLES_CHANGED', 'Alex Morgan joined Admins', 'Alex now has the ADMIN role.', '/users', 60 * 3, false],
        ['PRODUCT', 'RELEASE', 'New: command palette', 'Press ⌘K (or Ctrl+K) to jump to any page or action.', null, 60 * 9, false],
        [
          'SECURITY',
          'TWO_FACTOR_REMINDER',
          'Turn on two-step sign-in',
          'Admins should protect their account with a code from an app.',
          '/settings/security',
          60 * 26,
          true,
        ],
        ['ACCOUNT', 'USER_DISABLED', 'Lucas Silva was disabled', 'By Demo Admin. Their devices were signed out.', '/users', 60 * 30, true],
        [
          'PRODUCT',
          'WELCOME',
          'Welcome to Anjana Admin',
          'Your workspace is ready. Invite your team from Users.',
          '/users',
          60 * 24 * 4,
          true,
        ],
      ];
      list = seed.map(([category, type, title, body, link, mins, read]) => ({
        id: ++noteSeq,
        category,
        type,
        title,
        body,
        link,
        read,
        createdAt: agoMin(mins),
      }));
    }
    notes.set(u.id, list);
  }
  return list;
}
function notify(
  u: User,
  category: AppNotification['category'],
  type: string,
  title: string,
  body: string,
  link: string | null = '/settings/security',
) {
  const a = acct(u);
  const key = category.toLowerCase() as keyof NotificationSettings;
  if (a.settings[key].inApp) notesOf(u).unshift({ id: ++noteSeq, category, type, title, body, link, read: false, createdAt: now() });
  if (a.settings[key].email) inbox.unshift({ to: u.email, subject: title, link: link ?? '/', at: Date.now() });
}

function sendLink(u: User, purpose: 'verify' | 'reset') {
  for (const [k, v] of links) if (v.userId === u.id && v.purpose === purpose && !v.used) links.set(k, { ...v, used: true });
  const token = rand() + rand();
  links.set(token, { userId: u.id, purpose, expires: Date.now() + (purpose === 'verify' ? 24 * 60 : 60) * MIN, used: false });
  const path = purpose === 'verify' ? '/verify-email' : '/reset-password';
  inbox.unshift({
    to: u.email,
    subject: purpose === 'verify' ? 'Confirm your email address' : 'Reset your password',
    link: `${location.origin}${path}?token=${token}`,
    at: Date.now(),
  });
}

/* ── Persistence: demo state survives a reload in the same tab (e.g. opening an emailed link) ── */

export function snapshotAccount() {
  return {
    inbox,
    accounts: [...accounts],
    links: [...links],
    challenges: [...challenges],
    sessions: [...sessions],
    notes: [...notes],
    noteSeq,
  };
}

export function restoreAccount(d: ReturnType<typeof snapshotAccount>) {
  inbox.splice(0, inbox.length, ...d.inbox);
  const fill = <K, V>(m: Map<K, V>, e: [K, V][]) => {
    m.clear();
    e.forEach(([k, v]) => m.set(k, v));
  };
  fill(accounts, d.accounts);
  fill(links, d.links);
  fill(challenges, d.challenges);
  fill(sessions, d.sessions);
  fill(notes, d.notes);
  noteSeq = d.noteSeq;
}

/* ── Routes ── */

export function accountRoutes(c: Ctx): Promise<AxiosResponse> | undefined {
  const { config, method, url, body, users, respond, ok } = c;
  const field = (status: number, name: string, message: string) =>
    respond(config, status, { success: false, message, data: { [name]: message } });
  const coded = (status: number, code: string, message: string) => respond(config, status, { success: false, message, data: { code } });
  const byEmail = (e: unknown) =>
    users.find(
      (u) =>
        u.email ===
        String(e ?? '')
          .trim()
          .toLowerCase(),
    );
  const signIn = (u: User, how = 'Signed in') => {
    c.setCurrent(u.id);
    u.lastLoginAt = now();
    c.log({ category: 'AUTH', action: 'LOGIN', module: 'Auth', userName: u.email, details: how });
    return respond(config, 200, ok(c.session(`demo-token.${u.id}`), 'Signed in'));
  };
  const linkFor = (token: unknown, purpose: 'verify' | 'reset') => {
    const l = links.get(String(token ?? ''));
    return l && l.purpose === purpose && !l.used && l.expires > Date.now() ? l : null;
  };
  const strong = (p: unknown) => String(p ?? '').length >= 8 && String(p ?? '').length <= 72;

  if (!c.authed) {
    if (url === '/auth/options')
      return respond(config, 200, ok({ registrationEnabled: true, requireEmailVerification: true, brandName: 'Anjana' }));

    if (url === '/auth/login' && method === 'POST') {
      const u = byEmail(body.email);
      const a = u && acct(u);
      if (!u || !a || a.password !== body.password) {
        c.log({ category: 'AUTH', action: 'LOGIN_FAILED', module: 'Auth', userName: String(body.email || ''), details: 'Sign-in failed' });
        return c.fail(config, 401, 'Incorrect email or password.');
      }
      if (!u.enabled) return c.fail(config, 403, 'This account has been disabled. Contact an administrator.');
      if (u.emailVerified === false)
        return coded(403, 'EMAIL_NOT_VERIFIED', 'Confirm your email address first. We sent you a link when you signed up.');
      if (u.twoFactorEnabled) {
        const token = `challenge-${rand()}`;
        challenges.set(token, u.id);
        return respond(config, 200, ok({ twoFactorRequired: true, challengeToken: token }, 'Enter your code'));
      }
      return signIn(u);
    }

    if (url === '/auth/login/2fa' && method === 'POST') {
      const id = challenges.get(String(body.challengeToken ?? ''));
      const u = id == null ? undefined : users.find((x) => x.id === id);
      if (!u) return coded(401, 'CHALLENGE_EXPIRED', 'Your sign-in timed out. Please sign in again.');
      const code = String(body.code ?? '').replace(/\s/g, '');
      const a = acct(u);
      const norm = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const rec = a.recovery.findIndex((r) => r.replace('-', '') === norm);
      if (/^\d{6}$/.test(code) && code !== '000000') {
        challenges.delete(String(body.challengeToken));
        return signIn(u, 'Signed in with two-step code');
      }
      if (rec >= 0) {
        a.recovery.splice(rec, 1);
        challenges.delete(String(body.challengeToken));
        notify(
          u,
          'SECURITY',
          'RECOVERY_CODE_USED',
          'A recovery code was used',
          `You signed in with a recovery code. ${a.recovery.length} of 10 left.`,
        );
        return signIn(u, 'Signed in with a recovery code');
      }
      if (!/^\d{6}$/.test(code))
        return field(400, 'code', "That recovery code didn't work. Each code works once; check for typos or try another.");
      return field(400, 'code', "That code didn't work. Check the time on your phone and try again.");
    }

    if (url === '/auth/register' && method === 'POST') {
      if (!String(body.name ?? '').trim()) return field(400, 'name', 'Name is required');
      if (!/^\S+@\S+\.\S+$/.test(String(body.email ?? ''))) return field(400, 'email', 'Enter a valid email address');
      if (!strong(body.password)) return field(400, 'password', 'Password must be 8 to 72 characters');
      if (byEmail(body.email)) return field(409, 'email', 'An account with this email already exists. Sign in or reset your password.');
      const role = c.roles.find((r) => r.roleName === 'USER');
      const u: User = {
        id: Math.max(...users.map((x) => x.id)) + 1,
        name: String(body.name).trim(),
        email: String(body.email).trim().toLowerCase(),
        phone: null,
        address: null,
        enabled: true,
        system: false,
        roles: role ? [role] : [],
        lastLoginAt: null,
        createdAt: now(),
        updatedAt: now(),
        emailVerified: false,
        twoFactorEnabled: false,
      };
      users.push(u);
      acct(u).password = String(body.password);
      c.log({ category: 'AUTH', action: 'REGISTER', module: 'Auth', userName: u.email, details: 'Created an account' });
      notify(
        u,
        'PRODUCT',
        'WELCOME',
        'Welcome to Anjana Admin',
        'Your account is ready. Set up two-step sign-in in Settings to keep it safe.',
      );
      sendLink(u, 'verify');
      return respond(
        config,
        201,
        ok({ email: u.email, verificationRequired: true }, 'Account created. Check your email for a link to confirm your address.'),
      );
    }

    if (url === '/auth/verify-email' && method === 'POST') {
      const l = linkFor(body.token, 'verify');
      if (!l) return coded(400, 'LINK_INVALID', 'This confirmation link has expired or was already used. Sign in to get a new one.');
      l.used = true;
      const u = users.find((x) => x.id === l.userId);
      if (u) u.emailVerified = true;
      return respond(config, 200, ok(null, 'Email confirmed. You can sign in now.'));
    }

    if (url === '/auth/resend-verification' && method === 'POST') {
      const u = byEmail(body.email);
      if (u && u.emailVerified === false) sendLink(u, 'verify');
      return respond(config, 200, ok(null, "If an account exists for that email, we've sent a link to it."));
    }

    if (url === '/auth/forgot-password' && method === 'POST') {
      const u = byEmail(body.email);
      if (u?.enabled) sendLink(u, 'reset');
      return respond(config, 200, ok(null, "If an account exists for that email, we've sent a link to it."));
    }

    if (url === '/auth/reset-password/check' && method === 'POST') {
      return linkFor(body.token, 'reset')
        ? respond(config, 200, ok(null, 'Link is valid'))
        : coded(400, 'LINK_INVALID', 'This reset link has expired or was already used. Ask for a new one.');
    }

    if (url === '/auth/reset-password' && method === 'POST') {
      const l = linkFor(body.token, 'reset');
      if (!l) return coded(400, 'LINK_INVALID', 'This reset link has expired or was already used. Ask for a new one.');
      if (!strong(body.password)) return field(400, 'password', 'Password must be 8 to 72 characters');
      const u = users.find((x) => x.id === l.userId)!;
      l.used = true;
      acct(u).password = String(body.password);
      u.emailVerified = true;
      sessions.set(u.id, []);
      notify(
        u,
        'SECURITY',
        'PASSWORD_CHANGED',
        'Your password was reset',
        'Your password was reset with an emailed link and every device was signed out.',
      );
      return respond(config, 200, ok(null, 'Password changed. Sign in with your new password.'));
    }
    return undefined;
  }

  /* ── Signed in ── */
  const u = c.me();
  const a = acct(u);

  if (url === '/me/password' && method === 'PUT') {
    if (body.currentPassword !== a.password) return field(400, 'currentPassword', 'Your current password is incorrect.');
    if (!strong(body.newPassword)) return field(400, 'newPassword', 'New password must be 8 to 72 characters');
    if (body.newPassword === a.password) return field(400, 'newPassword', "Choose a password you haven't used here before.");
    a.password = String(body.newPassword);
    sessions.set(
      u.id,
      devicesOf(u).filter((s) => s.current),
    );
    c.log({ category: 'BUSINESS', action: 'PASSWORD_CHANGED', module: 'User', recordId: u.id, details: 'Changed own password' });
    notify(
      u,
      'SECURITY',
      'PASSWORD_CHANGED',
      'Your password was changed',
      'Your password was changed and your other devices were signed out.',
    );
    return respond(config, 200, ok(c.session(`demo-token.${u.id}`), 'Password changed'));
  }

  if (url === '/me/security') {
    return respond(
      config,
      200,
      ok({
        emailVerified: u.emailVerified !== false,
        twoFactorEnabled: !!u.twoFactorEnabled,
        recoveryCodesLeft: u.twoFactorEnabled ? a.recovery.length : 0,
        passwordChangedAt: null,
        activeSessions: devicesOf(u).length,
      }),
    );
  }

  if (url === '/me/verify-password' && method === 'POST') {
    return body.password === a.password ? respond(config, 200, ok(null, 'Unlocked')) : field(400, 'password', "That password isn't right.");
  }

  if (url === '/me/2fa/setup' && method === 'POST') {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const secret = Array.from({ length: 32 }, () => alphabet[Math.floor(Math.random() * 32)]).join('');
    return respond(
      config,
      200,
      ok({
        secret,
        otpauthUrl: `otpauth://totp/Anjana%20Admin:${encodeURIComponent(u.email)}?secret=${secret}&issuer=Anjana%20Admin&algorithm=SHA1&digits=6&period=30`,
      }),
    );
  }
  const newCodes = () => {
    const al = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    const one = () => Array.from({ length: 8 }, (_, i) => (i === 4 ? '-' : '') + al[Math.floor(Math.random() * al.length)]).join('');
    a.recovery = Array.from({ length: 10 }, one);
    return { codes: [...a.recovery] };
  };
  if (url === '/me/2fa/enable' && method === 'POST') {
    const code = String(body.code ?? '').replace(/\s/g, '');
    if (!/^\d{6}$/.test(code) || code === '000000')
      return field(400, 'code', "That code didn't work. Check the time on your phone and try again.");
    u.twoFactorEnabled = true;
    c.log({ category: 'BUSINESS', action: 'TWO_FACTOR_ENABLED', module: 'User', recordId: u.id, details: 'Turned on two-step sign-in' });
    notify(
      u,
      'SECURITY',
      'TWO_FACTOR_ENABLED',
      'Two-step sign-in is on',
      "From now on you'll enter a code from your authenticator app when you sign in.",
    );
    return respond(config, 200, ok(newCodes(), 'Two-step sign-in is on'));
  }
  if (url === '/me/2fa/disable' && method === 'POST') {
    if (body.password !== a.password) return field(400, 'password', "That password isn't right.");
    u.twoFactorEnabled = false;
    a.recovery = [];
    c.log({ category: 'BUSINESS', action: 'TWO_FACTOR_DISABLED', module: 'User', recordId: u.id, details: 'Turned off two-step sign-in' });
    notify(u, 'SECURITY', 'TWO_FACTOR_DISABLED', 'Two-step sign-in is off', 'Your account is now protected by your password only.');
    return respond(config, 200, ok(null, 'Two-step sign-in is off'));
  }
  if (url === '/me/2fa/recovery-codes' && method === 'POST') {
    if (body.password !== a.password) return field(400, 'password', "That password isn't right.");
    return respond(config, 200, ok(newCodes(), 'New recovery codes created'));
  }

  if (url === '/me/sessions' && method === 'GET') {
    const list = devicesOf(u);
    const cur = list.find((s) => s.current);
    if (cur) cur.lastSeenAt = now();
    return respond(config, 200, ok(list));
  }
  if (url === '/me/sessions' && method === 'DELETE') {
    const list = devicesOf(u);
    const n = list.filter((s) => !s.current).length;
    sessions.set(
      u.id,
      list.filter((s) => s.current),
    );
    if (n) c.log({ category: 'AUTH', action: 'SESSION_REVOKED', module: 'Auth', details: `Signed out ${n} other device(s)` });
    return respond(
      config,
      200,
      ok({ revoked: n }, n ? `Signed out ${n} other device${n === 1 ? '' : 's'}` : 'No other devices were signed in'),
    );
  }
  let m = url.match(/^\/me\/sessions\/(.+)$/);
  if (m && method === 'DELETE') {
    const list = devicesOf(u);
    const s = list.find((x) => x.id === m![1]);
    if (!s) return c.fail(config, 404, 'Session not found');
    if (s.current) return c.fail(config, 400, "That's this device. Use Sign out instead.");
    sessions.set(
      u.id,
      list.filter((x) => x !== s),
    );
    c.log({ category: 'AUTH', action: 'SESSION_REVOKED', module: 'Auth', details: 'Signed out another device' });
    return respond(config, 200, ok(null, 'Device signed out'));
  }

  if (url === '/me/notification-settings') {
    if (method === 'PUT') {
      a.settings = { security: body.security, account: body.account, product: body.product };
      return respond(config, 200, ok(a.settings, 'Notification settings saved'));
    }
    return respond(config, 200, ok(a.settings));
  }

  if (url === '/me/activity') {
    const rows = c.audit
      .filter((e) => e.userName === u.email && (e.category === 'AUTH' || e.category === 'BUSINESS'))
      .slice(0, 300)
      .map((e) => ({
        id: e.id,
        at: e.createdAt,
        category: e.category,
        action: e.action,
        entityName: e.module,
        details: e.details,
        ipAddress: e.ipAddress,
        browser: /Chrome/.test(e.userAgent ?? '') ? 'Chrome' : 'Safari',
        os: 'macOS',
      }));
    return respond(config, 200, ok(rows));
  }

  if (url === '/me/notifications/unread-count') return respond(config, 200, ok({ count: notesOf(u).filter((n) => !n.read).length }));
  if (url === '/me/notifications/read-all' && method === 'POST') {
    const list = notesOf(u);
    const n = list.filter((x) => !x.read).length;
    list.forEach((x) => (x.read = true));
    return respond(config, 200, ok({ updated: n }, n ? `Marked ${n} as read` : 'Nothing unread'));
  }
  if (url === '/me/notifications' && method === 'GET') {
    const p = (config.params ?? {}) as { unread?: boolean | string; page?: number; size?: number };
    const unread = p.unread === true || p.unread === 'true';
    const list = notesOf(u).filter((n) => !unread || !n.read);
    const size = Number(p.size ?? 20);
    const page = Number(p.page ?? 0);
    return respond(
      config,
      200,
      ok({
        items: list.slice(page * size, page * size + size),
        total: list.length,
        unreadCount: notesOf(u).filter((n) => !n.read).length,
        page,
        size,
      }),
    );
  }
  m = url.match(/^\/me\/notifications\/(\d+)(\/read|\/unread)?$/);
  if (m) {
    const list = notesOf(u);
    const n = list.find((x) => x.id === Number(m![1]));
    if (!n) return c.fail(config, 404, 'Notification not found');
    if (method === 'DELETE') {
      list.splice(list.indexOf(n), 1);
      return respond(config, 200, ok(null, 'Notification deleted'));
    }
    n.read = m[2] === '/read';
    return respond(config, 200, ok(n));
  }

  m = url.match(/^\/users\/(\d+)\/2fa\/reset$/);
  if (m && method === 'POST') {
    const t = users.find((x) => x.id === Number(m![1]));
    if (!t) return c.fail(config, 404, 'User not found');
    if (!t.twoFactorEnabled) return c.fail(config, 400, 'Two-step sign-in is already off for this user.');
    t.twoFactorEnabled = false;
    acct(t).recovery = [];
    c.log({
      category: 'BUSINESS',
      action: 'TWO_FACTOR_DISABLED',
      module: 'User',
      recordId: t.id,
      details: `Reset two-step sign-in for ${t.email}`,
    });
    notify(
      t,
      'SECURITY',
      'TWO_FACTOR_DISABLED',
      'Two-step sign-in was turned off',
      'An administrator turned off two-step sign-in for your account.',
    );
    return respond(config, 200, ok(t, 'Two-step sign-in turned off'));
  }
  return undefined;
}
