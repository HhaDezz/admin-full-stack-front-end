import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2, X } from 'lucide-react';
import { duration, easing } from '../../lib/motion';
import { isRtl } from './utils';

export type ToastTone = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastOptions {
  tone?: ToastTone;
  title: ReactNode;
  description?: ReactNode;
  /** One button on the toast, e.g. "Undo". Clicking it also dismisses the toast. */
  action?: { label: string; onClick: () => void };
  /** Milliseconds before it closes. `Infinity` keeps it until dismissed. */
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastOptions, 'tone' | 'title'>>, Omit<ToastOptions, 'tone' | 'title'> {
  id: number;
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  show: (t: ToastOptions) => number;
  /** Changes a toast in place (e.g. loading → success). */
  update: (id: number, t: Partial<ToastOptions>) => void;
  dismiss: (id: number) => void;
  /** Shorthands. */
  ok: (title: ReactNode, description?: ReactNode) => number;
  err: (title: ReactNode, description?: ReactNode) => number;
  info: (title: ReactNode, description?: ReactNode) => number;
  /** Loading toast that turns into success or error when the promise settles. */
  promise: <T>(
    p: Promise<T>,
    msgs: { loading: ReactNode; success: ReactNode | ((v: T) => ReactNode); error: ReactNode | ((e: unknown) => ReactNode) },
  ) => Promise<T>;
}

const Ctx = createContext<ToastApi | null>(null);
const MAX = 4;
const DEFAULT_MS: Record<ToastTone, number> = { success: 3500, info: 4500, warning: 6000, error: 6500, loading: Infinity };
const ICON = { success: CheckCircle2, error: AlertCircle, info: Info, warning: AlertTriangle, loading: Loader2 } as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, { left: number; started: number; handle?: ReturnType<typeof setTimeout> }>());
  const seq = useRef(1);

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t?.handle) clearTimeout(t.handle);
    timers.current.delete(id);
    setItems((s) => s.filter((x) => x.id !== id));
  }, []);

  const arm = useCallback(
    (id: number, ms: number) => {
      const old = timers.current.get(id);
      if (old?.handle) clearTimeout(old.handle);
      if (!Number.isFinite(ms)) {
        timers.current.set(id, { left: Infinity, started: Date.now() });
        return;
      }
      timers.current.set(id, { left: ms, started: Date.now(), handle: setTimeout(() => dismiss(id), ms) });
    },
    [dismiss],
  );

  const show = useCallback(
    (t: ToastOptions) => {
      const id = seq.current++;
      const tone = t.tone ?? 'info';
      setItems((s) => {
        const next = [...s, { ...t, tone, id }];
        // Oldest go first when the stack is full.
        next.slice(0, Math.max(0, next.length - MAX)).forEach((x) => timers.current.delete(x.id));
        return next.slice(-MAX);
      });
      arm(id, t.duration ?? DEFAULT_MS[tone]);
      return id;
    },
    [arm],
  );

  const update = useCallback(
    (id: number, t: Partial<ToastOptions>) => {
      setItems((s) => s.map((x) => (x.id === id ? { ...x, ...t, tone: t.tone ?? x.tone, title: t.title ?? x.title } : x)));
      if (t.tone || t.duration) arm(id, t.duration ?? DEFAULT_MS[t.tone ?? 'info']);
    },
    [arm],
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      update,
      dismiss,
      ok: (title, description) => show({ tone: 'success', title, description }),
      err: (title, description) => show({ tone: 'error', title, description }),
      info: (title, description) => show({ tone: 'info', title, description }),
      promise: async (p, msgs) => {
        const id = show({ tone: 'loading', title: msgs.loading });
        try {
          const v = await p;
          update(id, { tone: 'success', title: typeof msgs.success === 'function' ? msgs.success(v) : msgs.success });
          return v;
        } catch (e) {
          update(id, { tone: 'error', title: typeof msgs.error === 'function' ? msgs.error(e) : msgs.error });
          throw e;
        }
      },
    }),
    [show, update, dismiss],
  );

  // Hovering the stack pauses every timer so people can read and reach the action.
  const pause = () => {
    timers.current.forEach((t) => {
      if (t.handle) {
        clearTimeout(t.handle);
        t.left -= Date.now() - t.started;
        t.handle = undefined;
      }
    });
  };
  const resume = () => {
    timers.current.forEach((t, id) => {
      if (!t.handle && Number.isFinite(t.left)) {
        t.started = Date.now();
        t.handle = setTimeout(() => dismiss(id), Math.max(800, t.left));
      }
    });
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <section className="toasts" aria-label="Notifications" onMouseEnter={pause} onMouseLeave={resume} onFocus={pause} onBlur={resume}>
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const Icon = ICON[t.tone];
            return (
              <m.div
                key={t.id}
                layout
                className={`toast t-${t.tone}`}
                role={t.tone === 'error' || t.tone === 'warning' ? 'alert' : 'status'}
                // Swipe toward the edge to dismiss (touch or mouse).
                drag="x"
                dragSnapToOrigin
                dragElastic={isRtl(document.documentElement) ? { left: 0.9, right: 0.1 } : { left: 0.1, right: 0.9 }}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  const toward = isRtl(document.documentElement) ? -1 : 1;
                  if (info.offset.x * toward > 80 || info.velocity.x * toward > 600) dismiss(t.id);
                }}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: duration.base, ease: easing.enter } }}
                exit={{
                  opacity: 0,
                  x: isRtl(document.documentElement) ? -60 : 60,
                  transition: { duration: duration.fast, ease: easing.exit },
                }}
              >
                <Icon size={18} className={t.tone === 'loading' ? 'spin' : undefined} aria-hidden="true" />
                <div className="toast-body">
                  <div className="toast-title">{t.title}</div>
                  {t.description && <div className="toast-desc">{t.description}</div>}
                </div>
                {t.action && (
                  <button
                    className="toast-action"
                    onClick={() => {
                      t.action?.onClick();
                      dismiss(t.id);
                    }}
                  >
                    {t.action.label}
                  </button>
                )}
                <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
                  <X size={15} />
                </button>
              </m.div>
            );
          })}
        </AnimatePresence>
      </section>
    </Ctx.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
