import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

/* Theme settings: presets, mode, direction, density, radius, fonts, sidebar and width.
 * Saved per browser. Everything lands as CSS variables or data-attributes on <html>, so
 * components never need to know a theme exists. */

export type PresetId = 'atelier' | 'indigo' | 'rose' | 'ocean' | 'graphite' | 'sunset';
export type ThemeMode = 'light' | 'dark' | 'system';
export type FontPair = 'editorial' | 'modern' | 'system';
export type SidebarStyle = 'dark' | 'light' | 'glass';

export interface ThemeSettings {
  preset: PresetId;
  /** Custom brand colour (hex). Overrides the preset's brand. */
  brand: string | null;
  mode: ThemeMode;
  dir: 'ltr' | 'rtl';
  density: 'comfortable' | 'compact';
  /** Multiplier for every corner radius: 0 = square, 1 = default, 1.6 = round. */
  radius: number;
  font: FontPair;
  sidebar: SidebarStyle;
  width: 'fluid' | 'boxed';
}

export const DEFAULT_THEME: ThemeSettings = {
  preset: 'atelier',
  brand: null,
  mode: 'system',
  dir: 'ltr',
  density: 'comfortable',
  radius: 1,
  font: 'editorial',
  sidebar: 'dark',
  width: 'fluid',
};

interface Palette {
  brand: string;
  brandInk: string;
  accent: string;
  side: string;
}

export interface Preset {
  id: PresetId;
  name: string;
  light: Palette;
  dark: Palette;
}

export const PRESETS: Preset[] = [
  {
    id: 'atelier',
    name: 'Anjana',
    light: { brand: '#1f4d45', brandInk: '#ffffff', accent: '#c8663a', side: '#15302a' },
    dark: { brand: '#5fb89f', brandInk: '#0b1613', accent: '#e08455', side: '#0a1210' },
  },
  {
    id: 'indigo',
    name: 'Indigo',
    light: { brand: '#4f46e5', brandInk: '#ffffff', accent: '#db2777', side: '#1e1b4b' },
    dark: { brand: '#8b8cf6', brandInk: '#0f0d2b', accent: '#f472b6', side: '#0d0b24' },
  },
  {
    id: 'rose',
    name: 'Rose',
    light: { brand: '#be185d', brandInk: '#ffffff', accent: '#ea580c', side: '#3b0a22' },
    dark: { brand: '#f472b6', brandInk: '#2a0717', accent: '#fb923c', side: '#1a0510' },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    light: { brand: '#0e7490', brandInk: '#ffffff', accent: '#d97706', side: '#0b2e3a' },
    dark: { brand: '#4fc3d9', brandInk: '#04202a', accent: '#fbbf24', side: '#061a21' },
  },
  {
    id: 'graphite',
    name: 'Graphite',
    light: { brand: '#334155', brandInk: '#ffffff', accent: '#0284c7', side: '#111827' },
    dark: { brand: '#b4c2d6', brandInk: '#0b1220', accent: '#38bdf8', side: '#0a0e16' },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    light: { brand: '#c2410c', brandInk: '#ffffff', accent: '#7c3aed', side: '#3a1a0b' },
    dark: { brand: '#fb923c', brandInk: '#2a1205', accent: '#a78bfa', side: '#1c0d05' },
  },
];

export const FONTS: Record<FontPair, { name: string; body: string; display: string }> = {
  editorial: { name: 'Editorial', body: "'Inter Variable', system-ui, sans-serif", display: "'Fraunces Variable', Georgia, serif" },
  modern: { name: 'Modern', body: "'Inter Variable', system-ui, sans-serif", display: "'Inter Variable', system-ui, sans-serif" },
  system: {
    name: 'System',
    body: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    display: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
};

const KEY = 'atelier.theme.v2';
const HEX = /^#[0-9a-f]{6}$/i;

export function loadTheme(): ThemeSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = { ...DEFAULT_THEME, ...(JSON.parse(raw) as Partial<ThemeSettings>) };
      if (!PRESETS.some((p) => p.id === s.preset)) s.preset = DEFAULT_THEME.preset;
      if (s.brand && !HEX.test(s.brand)) s.brand = null;
      s.radius = Math.min(1.6, Math.max(0, Number(s.radius) || 0));
      return s;
    }
    // Carry over the old light/dark choice.
    const old = localStorage.getItem('atelier.theme');
    if (old === 'light' || old === 'dark') return { ...DEFAULT_THEME, mode: old };
  } catch {
    /* storage blocked or bad JSON */
  }
  return DEFAULT_THEME;
}

function save(s: ThemeSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

const systemDark = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
export const resolveMode = (mode: ThemeMode): 'light' | 'dark' => (mode === 'system' ? (systemDark() ? 'dark' : 'light') : mode);

/** Lighter version of a custom brand colour for dark mode. */
const forDark = (hex: string) => `color-mix(in srgb, ${hex} 62%, #ffffff)`;

function paletteVars(p: Palette, dark: boolean): Record<string, string> {
  return {
    '--brand': p.brand,
    '--brand-ink': p.brandInk,
    '--brand-soft': `color-mix(in srgb, ${p.brand} ${dark ? 22 : 13}%, var(--surface))`,
    '--accent': p.accent,
    '--accent-soft': `color-mix(in srgb, ${p.accent} ${dark ? 20 : 14}%, var(--surface))`,
    '--side-bg': p.side,
  };
}

/** The CSS variables a setting produces, per mode. Used to apply the theme and to export it. */
export function themeVars(s: ThemeSettings): { root: Record<string, string>; light: Record<string, string>; dark: Record<string, string> } {
  const preset = PRESETS.find((p) => p.id === s.preset) ?? PRESETS[0];
  const light = { ...preset.light, ...(s.brand ? { brand: s.brand, brandInk: '#ffffff' } : {}) };
  const dark = { ...preset.dark, ...(s.brand ? { brand: forDark(s.brand), brandInk: '#0b0f0e' } : {}) };
  const custom = s.preset !== 'atelier' || !!s.brand;
  const font = FONTS[s.font];
  return {
    root: { '--radius-scale': String(s.radius), '--font': font.body, '--font-display': font.display },
    light: custom ? paletteVars(light, false) : {},
    dark: custom ? paletteVars(dark, true) : {},
  };
}

const block = (sel: string, vars: Record<string, string>) =>
  Object.keys(vars).length
    ? `${sel} {\n${Object.entries(vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n')}\n}`
    : '';

/** Paste-ready CSS for src/styles/tokens (what the customizer's Export button copies). */
export function exportCss(s: ThemeSettings): string {
  const v = themeVars(s);
  return [
    `/* Anjana Admin theme: ${PRESETS.find((p) => p.id === s.preset)?.name}${s.brand ? `, brand ${s.brand}` : ''}. Paste at the end of src/styles/tokens/index.css. */`,
    block(':root', { ...v.root, ...v.light }),
    block(":root[data-theme='dark']", v.dark),
    `/* Also set on <html>: data-density="${s.density}" data-sidebar="${s.sidebar}" data-width="${s.width}" dir="${s.dir}" */`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** Writes the settings to <html>. Safe to call before React renders, so the first paint is already themed. */
export function applyTheme(s: ThemeSettings) {
  const html = document.documentElement;
  const v = themeVars(s);
  html.dataset.theme = resolveMode(s.mode);
  html.dataset.density = s.density;
  html.dataset.sidebar = s.sidebar;
  html.dataset.width = s.width;
  html.dir = s.dir;
  for (const [k, val] of Object.entries(v.root)) html.style.setProperty(k, val);
  let tag = document.getElementById('atelier-theme') as HTMLStyleElement | null;
  if (!tag) {
    tag = document.createElement('style');
    tag.id = 'atelier-theme';
    document.head.appendChild(tag);
  }
  // Scoped selectors too, so a preview frame with data-theme="dark" picks up the same palette.
  tag.textContent = [block(":root, [data-theme='light']", v.light), block(":root[data-theme='dark'], [data-theme='dark']", v.dark)].join(
    '\n',
  );
}

interface ThemeCtx {
  settings: ThemeSettings;
  /** The mode in effect (system resolved). */
  theme: 'light' | 'dark';
  update: (patch: Partial<ThemeSettings>) => void;
  reset: () => void;
  /** Light ↔ dark. Pass the point that was clicked for a circular reveal from there. */
  toggle: (origin?: { x: number; y: number }) => void;
}

/** Runs `change` as a View Transition that grows a circle from `origin` (when supported and motion is on). */
export function revealChange(change: () => void, origin?: { x: number; y: number }) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  const reduce = document.documentElement.dataset.motion === 'reduce' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!doc.startViewTransition || reduce) return change();
  const x = origin?.x ?? innerWidth - 40;
  const y = origin?.y ?? 32;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const t = doc.startViewTransition(change);
  t.ready
    .then(() =>
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 480, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      ),
    )
    .catch(() => {});
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(loadTheme);
  const [sysDark, setSysDark] = useState(systemDark);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const on = () => setSysDark(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    applyTheme(settings);
    save(settings);
  }, [settings, sysDark]);

  const update = useCallback((patch: Partial<ThemeSettings>) => setSettings((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setSettings(DEFAULT_THEME), []);
  const theme = settings.mode === 'system' ? (sysDark ? 'dark' : 'light') : settings.mode;
  const current = useRef(settings);
  useEffect(() => {
    current.current = settings;
  }, [settings]);
  const toggle = useCallback((origin?: { x: number; y: number }) => {
    const s = current.current;
    const next = { ...s, mode: resolveMode(s.mode) === 'dark' ? ('light' as const) : ('dark' as const) };
    revealChange(() => {
      // Paint the new theme inside the transition, so the circle reveals it.
      applyTheme(next);
      flushSync(() => setSettings(next));
    }, origin);
  }, []);
  const value = useMemo(() => ({ settings, theme, update, reset, toggle }), [settings, theme, update, reset, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTheme must be used inside <ThemeProvider>');
  return c;
}
