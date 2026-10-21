/**
 * Motion system: shared timings, easings and presets for the `motion` library.
 * Numbers match src/styles/tokens/motion.css. Every animated component uses these,
 * and <MotionProvider> turns them into simple fades when reduced motion is on.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LazyMotion, MotionConfig, useReducedMotion, type Transition, type Variants } from 'motion/react';

export const duration = { instant: 0.1, fast: 0.16, base: 0.24, slow: 0.36 } as const;
export const easing = {
  standard: [0.2, 0, 0, 1],
  enter: [0.2, 0.8, 0.2, 1],
  exit: [0.4, 0, 1, 1],
} as const satisfies Record<string, [number, number, number, number]>;

export const spring: Transition = { type: 'spring', stiffness: 520, damping: 40, mass: 0.9 };

/** Opacity only. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.base, ease: easing.enter } },
  exit: { opacity: 0, transition: { duration: duration.fast, ease: easing.exit } },
};

/** Fade + rise 8 px: page content, cards. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: easing.enter } },
  exit: { opacity: 0, y: 4, transition: { duration: duration.fast, ease: easing.exit } },
};

/** Scale from 0.96: menus, popovers, dialogs. Set transform-origin on the element. */
export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: duration.fast, ease: easing.enter } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: duration.instant, ease: easing.exit } },
};

/** Drawers and side panels. */
export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: duration.base, ease: easing.enter } },
  exit: { opacity: 0, x: 24, transition: { duration: duration.fast, ease: easing.exit } },
};

/** Parent variant that staggers its children's `show`. */
export const stagger = (step = 0.04, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

/* ── Preference: follow the system, or always reduce ── */

const loadFeatures = () => import('./motion-features').then((m) => m.default);

type MotionPref = 'system' | 'reduce';
const KEY = 'atelier.motion';
const MotionPrefCtx = createContext<{ pref: MotionPref; setPref: (p: MotionPref) => void }>({ pref: 'system', setPref: () => {} });

function readPref(): MotionPref {
  try {
    return localStorage.getItem(KEY) === 'reduce' ? 'reduce' : 'system';
  } catch {
    return 'system';
  }
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<MotionPref>(readPref);
  const setPref = useCallback((p: MotionPref) => {
    setPrefState(p);
    try {
      localStorage.setItem(KEY, p);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    if (pref === 'reduce') document.documentElement.dataset.motion = 'reduce';
    else delete document.documentElement.dataset.motion;
  }, [pref]);
  const value = useMemo(() => ({ pref, setPref }), [pref, setPref]);
  return (
    <MotionPrefCtx.Provider value={value}>
      <MotionConfig reducedMotion={pref === 'reduce' ? 'always' : 'user'}>
        {/* The engine downloads after first paint; components use `m.*` from motion/react-m. */}
        <LazyMotion features={loadFeatures} strict>
          {children}
        </LazyMotion>
      </MotionConfig>
    </MotionPrefCtx.Provider>
  );
}

export const useMotionPreference = () => useContext(MotionPrefCtx);

/** True when animation should be skipped (system setting or the app's own switch). */
export function useShouldReduceMotion(): boolean {
  const system = useReducedMotion();
  const { pref } = useMotionPreference();
  return pref === 'reduce' || !!system;
}

/** Animates a number from 0 (or its previous value) to `target`. Returns the current value. */
export function useCountUp(target: number, ms = 900): number {
  const reduce = useShouldReduceMotion();
  const [value, setValue] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) {
      setValue(target);
      return;
    }
    // A small requestAnimationFrame tween (ease-out cubic), so counting needs no animation engine.
    const from = value;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / ms);
      setValue(from + (target - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
    // Only restart when the target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reduce, ms]);
  return value;
}
