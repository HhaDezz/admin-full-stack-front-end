import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { Check, Pipette } from 'lucide-react';
import { useControlProps } from './_form';
import { Popover } from './Popover';
import { cx, useControllable } from './utils';

/* ── ColorPicker: swatches, a saturation/brightness area, hue, hex and the eyedropper ── */

type HSV = { h: number; s: number; v: number };

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function hexToHsv(hex: string): HSV | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h6 = m[1];
  if (h6.length === 3) h6 = [...h6].map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h6.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

export function hsvToHex({ h, s, v }: HSV): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return (
    '#' +
    [f(5), f(3), f(1)]
      .map((x) =>
        Math.round(x * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

export const DEFAULT_SWATCHES = [
  '#1f4d45',
  '#2f7d54',
  '#0e7490',
  '#3d6b9a',
  '#4f46e5',
  '#7c3aed',
  '#be185d',
  '#b4412f',
  '#c8663a',
  '#dca33a',
  '#334155',
  '#111827',
];

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string) => void;
  /** Preset colours shown as a grid. Pass [] to hide them. */
  swatches?: string[];
  /** Allow any colour (area, hue, hex), not just the swatches. */
  custom?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  size?: 'sm' | 'md';
  id?: string;
  'aria-label'?: string;
  onBlur?: () => void;
}

export function ColorPicker({
  value,
  defaultValue = '#1f4d45',
  onChange,
  swatches = DEFAULT_SWATCHES,
  custom = true,
  disabled,
  invalid,
  size = 'md',
  id,
  'aria-label': label = 'Colour',
  onBlur,
}: ColorPickerProps) {
  const c = useControlProps({ id, disabled, invalid });
  const [color, setColor] = useControllable(value, defaultValue, onChange);
  const hex = color.toLowerCase();
  return (
    <Popover
      label={label}
      width={custom ? 260 : 216}
      className="color-pop"
      onOpenChange={(o) => !o && onBlur?.()}
      trigger={
        <button
          type="button"
          id={c.id}
          className={cx('control', 'color-trigger', `control-${size}`, c.invalid && 'is-invalid', c.disabled && 'is-disabled')}
          disabled={c.disabled}
          aria-label={`${label}: ${hex}`}
          aria-invalid={c['aria-invalid']}
          aria-describedby={c['aria-describedby']}
        >
          <span className="color-chip" style={{ background: hex }} aria-hidden="true" />
          <span className="color-hex mono">{hex}</span>
        </button>
      }
    >
      <ColorPanel hex={hex} onChange={setColor} swatches={swatches} custom={custom} />
    </Popover>
  );
}

/** The panel on its own (for inline use, e.g. inside a settings page). */
export function ColorPanel({
  hex,
  onChange,
  swatches = DEFAULT_SWATCHES,
  custom = true,
}: {
  hex: string;
  onChange: (hex: string) => void;
  swatches?: string[];
  custom?: boolean;
}) {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(hex) ?? { h: 160, s: 0.6, v: 0.3 });
  const [text, setText] = useState(hex);
  const area = useRef<HTMLDivElement>(null);
  // Follow outside changes without losing hue for greys (where hue is undefined).
  useEffect(() => {
    if (hsvToHex(hsv) !== hex) {
      const next = hexToHsv(hex);
      if (next) setHsv((p) => ({ ...next, h: next.s === 0 ? p.h : next.h }));
    }
    setText(hex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hex]);

  const apply = (next: HSV) => {
    setHsv(next);
    onChange(hsvToHex(next));
  };

  const fromPointer = (e: PointerEvent | ReactPointerEvent) => {
    const r = area.current!.getBoundingClientRect();
    apply({ ...hsv, s: clamp01((e.clientX - r.left) / r.width), v: clamp01(1 - (e.clientY - r.top) / r.height) });
  };

  const onAreaDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.focus();
    fromPointer(e);
    const move = (ev: PointerEvent) => fromPointer(ev);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onAreaKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const d: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (!d[e.key]) return;
    e.preventDefault();
    apply({ ...hsv, s: clamp01(hsv.s + d[e.key][0]), v: clamp01(hsv.v + d[e.key][1]) });
  };

  const eyedropper = typeof window !== 'undefined' && 'EyeDropper' in window;
  const pick = async () => {
    try {
      const Ctor = (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
      const r = await new Ctor().open();
      onChange(r.sRGBHex.toLowerCase());
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="color-panel">
      {custom && (
        <>
          <div
            ref={area}
            className="color-area"
            style={{ background: `hsl(${hsv.h} 100% 50%)` }}
            role="slider"
            tabIndex={0}
            aria-label="Saturation and brightness"
            aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
            aria-valuenow={Math.round(hsv.s * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            onPointerDown={onAreaDown}
            onKeyDown={onAreaKey}
          >
            <span className="color-area-thumb" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: hex }} />
          </div>
          <div className="color-row">
            <input
              type="range"
              className="color-hue"
              min={0}
              max={359}
              value={Math.round(hsv.h)}
              aria-label="Hue"
              aria-valuetext={`${Math.round(hsv.h)} degrees`}
              onChange={(e) => apply({ ...hsv, h: Number(e.target.value) })}
            />
          </div>
          <div className="color-row">
            <span className="color-chip is-lg" style={{ background: hex }} aria-hidden="true" />
            <input
              className="control-input color-hex-input mono"
              value={text}
              aria-label="Hex colour"
              maxLength={7}
              spellCheck={false}
              onChange={(e) => {
                const v = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                setText(v);
                if (/^#[0-9a-f]{6}$/i.test(v)) onChange(v.toLowerCase());
              }}
              onBlur={() => setText(hex)}
            />
            {eyedropper && (
              <button
                type="button"
                className="btn btn-icon btn-sm"
                onClick={pick}
                aria-label="Pick a colour from the screen"
                title="Pick from screen"
              >
                <Pipette size={15} />
              </button>
            )}
          </div>
        </>
      )}
      {swatches.length > 0 && (
        <div className="color-swatches" role="group" aria-label="Preset colours">
          {swatches.map((s) => {
            const on = s.toLowerCase() === hex;
            return (
              <button
                key={s}
                type="button"
                className={cx('color-swatch', on && 'is-on')}
                style={{ background: s }}
                aria-label={s}
                aria-pressed={on}
                onClick={() => onChange(s.toLowerCase())}
              >
                {on && <Check size={13} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
