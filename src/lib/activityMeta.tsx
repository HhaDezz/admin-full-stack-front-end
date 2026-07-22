import type { ReactNode } from 'react';
import {
  BadgeCheck,
  Bell,
  KeyRound,
  LogIn,
  LogOut,
  Megaphone,
  MonitorX,
  Pencil,
  Plus,
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  Trash2,
  UserCog,
  UserPlus,
  UserX,
} from 'lucide-react';
import type { AppNotification } from './types';

/** Icon and tone for a notification type. */
export function notificationLook(n: Pick<AppNotification, 'type' | 'category'>): { icon: ReactNode; tone: string } {
  const by: Record<string, [ReactNode, string]> = {
    NEW_SIGN_IN: [<LogIn size={16} key="i" />, 'blue'],
    PASSWORD_CHANGED: [<KeyRound size={16} key="i" />, 'gold'],
    TWO_FACTOR_ENABLED: [<ShieldCheck size={16} key="i" />, 'green'],
    TWO_FACTOR_DISABLED: [<ShieldOff size={16} key="i" />, 'red'],
    TWO_FACTOR_REMINDER: [<ShieldAlert size={16} key="i" />, 'gold'],
    RECOVERY_CODE_USED: [<ShieldAlert size={16} key="i" />, 'red'],
    ROLES_CHANGED: [<UserCog size={16} key="i" />, 'terra'],
    USER_DISABLED: [<UserX size={16} key="i" />, 'red'],
    WELCOME: [<Megaphone size={16} key="i" />, 'green'],
    RELEASE: [<Megaphone size={16} key="i" />, 'terra'],
  };
  const [icon, tone] = by[n.type] ?? [<Bell size={16} key="i" />, n.category === 'SECURITY' ? 'gold' : 'green'];
  return { icon, tone };
}

/** Plain-language label and icon for an activity (audit) action. */
export function activityLook(
  action: string,
  details?: string | null,
): { label: string; icon: ReactNode; kind: 'signin' | 'security' | 'change' } {
  switch (action) {
    case 'LOGIN':
      return {
        label: details?.includes('recovery')
          ? 'Signed in with a recovery code'
          : details?.includes('two-step')
            ? 'Signed in with a two-step code'
            : 'Signed in',
        icon: <LogIn size={16} />,
        kind: 'signin',
      };
    case 'LOGOUT':
      return { label: 'Signed out', icon: <LogOut size={16} />, kind: 'signin' };
    case 'LOGIN_FAILED':
      return { label: 'Sign-in failed', icon: <ShieldAlert size={16} />, kind: 'signin' };
    case 'REGISTER':
      return { label: 'Created your account', icon: <UserPlus size={16} />, kind: 'security' };
    case 'EMAIL_VERIFIED':
      return { label: 'Confirmed your email', icon: <BadgeCheck size={16} />, kind: 'security' };
    case 'PASSWORD_CHANGED':
      return { label: 'Changed your password', icon: <KeyRound size={16} />, kind: 'security' };
    case 'PASSWORD_RESET_REQUESTED':
      return { label: 'Asked for a password reset link', icon: <KeyRound size={16} />, kind: 'security' };
    case 'PASSWORD_RESET':
      return { label: 'Reset your password', icon: <KeyRound size={16} />, kind: 'security' };
    case 'TWO_FACTOR_ENABLED':
      return { label: 'Turned on two-step sign-in', icon: <ShieldCheck size={16} />, kind: 'security' };
    case 'TWO_FACTOR_DISABLED':
      return { label: 'Turned off two-step sign-in', icon: <ShieldOff size={16} />, kind: 'security' };
    case 'SESSION_REVOKED':
      return { label: details ?? 'Signed out a device', icon: <MonitorX size={16} />, kind: 'security' };
    case 'CREATE':
      return { label: details ?? 'Created a record', icon: <Plus size={16} />, kind: 'change' };
    case 'DELETE':
      return { label: details ?? 'Deleted a record', icon: <Trash2 size={16} />, kind: 'change' };
    default:
      return {
        label: details ?? 'Made a change',
        icon: <Pencil size={16} />,
        kind: details?.toLowerCase().includes('two-step') ? 'security' : 'change',
      };
  }
}

/** "Today", "Yesterday" or a date, for grouping lists by day. */
export function dayLabel(iso: string, lang = navigator.language): string {
  const d = new Date(iso);
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(new Date()) - start(d)) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return new Intl.DateTimeFormat(lang, {
    weekday: diff < 7 ? 'long' : undefined,
    day: 'numeric',
    month: 'long',
    year: diff > 300 ? 'numeric' : undefined,
  }).format(d);
}

export function groupByDay<T>(items: T[], at: (t: T) => string): [string, T[]][] {
  const out = new Map<string, T[]>();
  for (const it of items) {
    const k = dayLabel(at(it));
    out.set(k, [...(out.get(k) ?? []), it]);
  }
  return [...out.entries()];
}
