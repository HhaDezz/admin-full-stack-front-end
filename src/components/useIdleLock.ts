import { useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth';

export const LOCK_AFTER_KEY = 'atelier.lockAfter';

/** Locks the screen after the number of idle minutes chosen in Settings → Security (default 15; 0 = never). */
export function useIdleLock() {
  const { session, locked, lock } = useAuth();
  const last = useRef(Date.now());
  useEffect(() => {
    if (!session || locked) return;
    last.current = Date.now();
    const bump = () => (last.current = Date.now());
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const t = setInterval(() => {
      let minutes = 15;
      try {
        const raw = localStorage.getItem(LOCK_AFTER_KEY);
        if (raw != null) minutes = Number(JSON.parse(raw));
      } catch {
        /* keep the default */
      }
      if (minutes > 0 && Date.now() - last.current > minutes * 60_000) lock();
    }, 15_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      clearInterval(t);
    };
  }, [session, locked, lock]);
}
