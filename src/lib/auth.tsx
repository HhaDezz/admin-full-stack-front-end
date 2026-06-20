import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, errorCode, errorFields, errorMessage, SESSION_KEY, UNAUTHORIZED_EVENT, unwrap } from './api';
import type { LoginResult, Session } from './types';

/** A sign-in failure with the API's reason code (e.g. EMAIL_NOT_VERIFIED) and field errors. */
export class AuthError extends Error {
  code?: string;
  fields: Record<string, string>;
  constructor(err: unknown, fallback: string) {
    super(errorMessage(err, fallback));
    this.code = errorCode(err);
    this.fields = errorFields(err);
  }
}

export type SignInStep = { status: 'signed-in' } | { status: 'two-factor'; challengeToken: string };

interface AuthValue {
  session: Session | null;
  /** Password step. Answers "two-factor" when a code is still needed. */
  login: (email: string, password: string) => Promise<SignInStep>;
  /** Second step: a six-digit code or a recovery code. */
  completeTwoFactor: (challengeToken: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Merge fresh data from /me (and a new token after a password change) into the session. */
  updateSession: (data: Partial<Session>) => void;
  can: (permission: string) => boolean;
  /** Lock screen: the session stays, but the app is hidden until the password is entered again. */
  locked: boolean;
  lock: () => void;
  unlock: (password: string) => Promise<void>;
}

const LOCK_KEY = 'atelier.locked';

function toSession(data: Partial<Session>, prev?: Session | null): Session {
  return {
    token: data.token || prev?.token || '',
    id: data.id ?? prev?.id ?? 0,
    username: data.username ?? prev?.username ?? '',
    name: data.name ?? prev?.name ?? '',
    email: data.email ?? prev?.email ?? '',
    phone: data.phone ?? prev?.phone ?? null,
    address: data.address ?? prev?.address ?? null,
    role: data.role ?? prev?.role ?? '',
    roles: data.roles ?? prev?.roles ?? [],
    permissions: data.permissions ?? prev?.permissions ?? [],
    superAdmin: data.superAdmin ?? prev?.superAdmin ?? false,
    emailVerified: data.emailVerified ?? prev?.emailVerified ?? true,
    twoFactorEnabled: data.twoFactorEnabled ?? prev?.twoFactorEnabled ?? false,
  };
}

const AuthContext = createContext<AuthValue | null>(null);

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function readLocked(): boolean {
  try {
    return sessionStorage.getItem(LOCK_KEY) === '1';
  } catch {
    return false;
  }
}

function writeLocked(v: boolean) {
  try {
    if (v) sessionStorage.setItem(LOCK_KEY, '1');
    else sessionStorage.removeItem(LOCK_KEY);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession);
  const [locked, setLocked] = useState(readLocked);

  const update = useCallback((s: Session | null) => {
    writeSession(s);
    setSession(s);
    if (!s) {
      writeLocked(false);
      setLocked(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<SignInStep> => {
      try {
        const data = await unwrap<LoginResult>(api.post('/auth/login', { email, password }));
        if (data.twoFactorRequired && data.challengeToken) return { status: 'two-factor', challengeToken: data.challengeToken };
        update(toSession(data));
        return { status: 'signed-in' };
      } catch (err) {
        throw new AuthError(err, 'Sign in failed');
      }
    },
    [update],
  );

  const completeTwoFactor = useCallback(
    async (challengeToken: string, code: string) => {
      try {
        const data = await unwrap<LoginResult>(api.post('/auth/login/2fa', { challengeToken, code }));
        update(toSession(data));
      } catch (err) {
        throw new AuthError(err, 'That code didn’t work');
      }
    },
    [update],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* token may already be invalid – still sign out locally */
    }
    update(null);
  }, [update]);

  const lock = useCallback(() => {
    writeLocked(true);
    setLocked(true);
  }, []);

  const unlock = useCallback(async (password: string) => {
    try {
      await api.post('/me/verify-password', { password });
    } catch (err) {
      throw new AuthError(err, 'That password isn’t right');
    }
    writeLocked(false);
    setLocked(false);
  }, []);

  // Sign out automatically if any request comes back 401.
  useEffect(() => {
    const onUnauthorized = () => update(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [update]);

  // Keep role/permissions fresh: re-read from the server on load and when the tab regains focus,
  // so a permission change made by an admin applies without signing out.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const me = await unwrap<Partial<Session>>(api.get('/me'));
        if (cancelled) return;
        setSession((prev) => {
          if (!prev) return prev;
          const next = toSession({ ...me, token: undefined }, prev);
          writeSession(next);
          return next;
        });
      } catch {
        /* handled by the 401 interceptor if relevant */
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', refresh);
    };
    // Only re-subscribe when the signed-in identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token]);

  const updateSession = useCallback((data: Partial<Session>) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = toSession(data, prev);
      writeSession(next);
      return next;
    });
  }, []);

  const can = useCallback(
    (permission: string) => {
      if (!session) return false;
      if (session.superAdmin) return true;
      return session.permissions.includes(permission);
    },
    [session],
  );

  const value = useMemo(
    () => ({ session, login, completeTwoFactor, logout, updateSession, can, locked, lock, unlock }),
    [session, login, completeTwoFactor, logout, updateSession, can, locked, lock, unlock],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
