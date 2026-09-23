import { type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode, useRef, useState } from 'react';
import { cx, isRtl } from './utils';
import { useField } from './Field';
import { clamp } from './_form';

/* ── Slider: one value or a range, with marks ── */

export interface SliderMark {
  value: number;
  label?: ReactNode;
}

interface SliderBase {
  min?: number;
  max?: number;
  step?: number;
  /** Large step for Page Up / Page Down (defaults to a tenth of the range). */
  pageStep?: number;
  marks?: SliderMark[] | boolean;
  /** Show the value above the thumb while it is dragged or focused. */
  showValue?: boolean;
  formatValue?: (v: number) => string;
  disabled?: boolean;
  tone?: 'brand' | 'accent' | 'danger';
  'aria-label'?: string;
  /** Names for each thumb in a range (default "Minimum", "Maximum"). */
  thumbLabels?: [string, string];
  id?: string;
}

export interface SliderSingleProps extends SliderBase {
  value?: number;
  defaultValue?: number;
  onChange?: (v: number) => void;
  /** Fires once when the user lets go. */
  onChangeEnd?: (v: number) => void;
}

export interface SliderRangeProps extends SliderBase {
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?: (v: [number, number]) => void;
  onChangeEnd?: (v: [number, number]) => void;
}

export function Slider(props: SliderRangeProps): ReactNode;

export function Slider(props: SliderSingleProps): ReactNode;

export function Slider(props: SliderSingleProps | SliderRangeProps) {
  const {
    min = 0,
    max = 100,
    step = 1,
    marks,
    showValue = true,
    formatValue = (v: number) => String(v),
    disabled,
    tone = 'brand',
    thumbLabels = ['Minimum', 'Maximum'],
    id,
  } = props;
  const field = useField();
  const isRange = Array.isArray(props.value ?? props.defaultValue);
  const toArr = (v: number | [number, number] | undefined): number[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
  const fallback = isRange ? [min, max] : [min];
  const [inner, setInner] = useState<number[]>(() => (toArr(props.defaultValue).length ? toArr(props.defaultValue) : fallback));
  const controlled = props.value !== undefined;
  const values = controlled ? toArr(props.value) : inner;
  const latest = useRef(values);
  latest.current = values;
  const track = useRef<HTMLDivElement>(null);
  const thumbs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const pageStep = props.pageStep ?? Math.max(step, (max - min) / 10);
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const snap = (v: number) => clamp(Math.round((v - min) / step) * step + min, min, max);
  const decimals = (String(step).split('.')[1] ?? '').length;
  const fix = (v: number) => Number(v.toFixed(decimals));

  const emit = (next: number[], end = false) => {
    if (!controlled) setInner(next);
    latest.current = next;
    const out = (isRange ? [next[0], next[1]] : next[0]) as never;
    (end ? props.onChangeEnd : props.onChange)?.(out);
  };
  const setAt = (i: number, raw: number, end = false) => {
    const v = fix(snap(raw));
    const next = [...latest.current];
    if (isRange) next[i] = i === 0 ? Math.min(v, next[1]) : Math.max(v, next[0]);
    else next[0] = v;
    if (next.some((x, k) => x !== latest.current[k])) emit(next);
    if (end) emit(next, true);
  };

  const fromPointer = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const rtl = isRtl(track.current!);
    let ratio = (clientX - r.left) / r.width;
    if (rtl) ratio = 1 - ratio;
    return min + clamp(ratio, 0, 1) * (max - min);
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    const v = fromPointer(e.clientX);
    const cur = latest.current;
    const i = !isRange ? 0 : Math.abs(v - cur[0]) < Math.abs(v - cur[1]) || v < cur[0] ? 0 : 1;
    setActive(i);
    thumbs.current[i]?.focus();
    setAt(i, v);
    const move = (ev: PointerEvent) => setAt(i, fromPointer(ev.clientX));
    const up = (ev: PointerEvent) => {
      setAt(i, fromPointer(ev.clientX), true);
      setActive(null);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    const rtl = isRtl(e.currentTarget);
    const cur = latest.current[i];
    const map: Record<string, number> = {
      ArrowUp: cur + step,
      ArrowDown: cur - step,
      ArrowRight: rtl ? cur - step : cur + step,
      ArrowLeft: rtl ? cur + step : cur - step,
      PageUp: cur + pageStep,
      PageDown: cur - pageStep,
      Home: min,
      End: max,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    setAt(i, map[e.key], true);
  };

  const markList: SliderMark[] =
    marks === true ? Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, k) => ({ value: min + k * step })) : marks || [];
  const lo = isRange ? pct(values[0]) : 0;
  const hi = pct(isRange ? values[1] : values[0]);
  const labelledBy = field ? `${field.id}-label` : undefined;

  return (
    <div className={cx('slider', `tone-${tone}`, disabled && 'is-disabled', markList.some((mk) => mk.label) && 'has-labels')} id={id}>
      <div className="slider-track" ref={track} onPointerDown={onPointerDown}>
        <div className="slider-range" style={{ insetInlineStart: `${lo}%`, width: `${hi - lo}%` }} />
        {markList.map((mk) => (
          <span
            key={mk.value}
            className={cx(
              'slider-mark',
              mk.value >= (isRange ? values[0] : min) && mk.value <= (isRange ? values[1] : values[0]) && 'is-in',
            )}
            style={{ insetInlineStart: `${pct(mk.value)}%` }}
            aria-hidden="true"
          />
        ))}
        {values.map((v, i) => (
          <div
            key={i}
            ref={(el) => {
              thumbs.current[i] = el;
            }}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            className={cx('slider-thumb', active === i && 'is-active')}
            style={{ insetInlineStart: `${pct(v)}%` }}
            aria-valuemin={isRange && i === 1 ? values[0] : min}
            aria-valuemax={isRange && i === 0 ? values[1] : max}
            aria-valuenow={v}
            aria-valuetext={formatValue(v)}
            aria-disabled={disabled || undefined}
            aria-orientation="horizontal"
            aria-label={isRange ? `${props['aria-label'] ?? ''} ${thumbLabels[i]}`.trim() : props['aria-label']}
            aria-labelledby={!props['aria-label'] && !isRange ? labelledBy : undefined}
            aria-describedby={field?.describedBy}
            onKeyDown={(e) => onKey(e, i)}
          >
            {showValue && (
              <span className="slider-value" aria-hidden="true">
                {formatValue(v)}
              </span>
            )}
          </div>
        ))}
      </div>
      {markList.some((mk) => mk.label) && (
        <div className="slider-labels" aria-hidden="true">
          {markList.map(
            (mk) =>
              mk.label && (
                <span key={mk.value} style={{ insetInlineStart: `${pct(mk.value)}%` }}>
                  {mk.label}
                </span>
              ),
          )}
        </div>
      )}
    </div>
  );
}
