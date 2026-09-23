import { useId, useState, type ReactNode } from 'react';
import { Star } from 'lucide-react';
import { cx, useControllable } from './utils';

/* ── Rating: stars as a radio group; read-only mode shows fractions ── */

export interface RatingProps {
  value?: number;
  defaultValue?: number;
  onChange?: (v: number) => void;
  max?: number;
  /** Shows the value and fractions (4.3), no input. */
  readOnly?: boolean;
  size?: number;
  /** Words for each value, read out and shown on hover (e.g. Poor … Excellent). */
  labels?: string[];
  showLabel?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  'aria-label'?: string;
  name?: string;
}

export function Rating({
  value,
  defaultValue = 0,
  onChange,
  max = 5,
  readOnly,
  size = 22,
  labels,
  showLabel,
  icon,
  disabled,
  'aria-label': label = 'Rating',
  name,
}: RatingProps) {
  const [current, set] = useControllable(value, defaultValue, onChange);
  const [hover, setHover] = useState<number | null>(null);
  const group = useId();
  const shown = hover ?? current;
  const words = (n: number) => labels?.[n - 1] ?? `${n} ${n === 1 ? 'star' : 'stars'}`;
  const star = icon ?? <Star size={size} strokeWidth={1.6} />;

  if (readOnly) {
    return (
      <span className="rating is-readonly" role="img" aria-label={`${label}: ${current.toFixed(1).replace(/\.0$/, '')} out of ${max}`}>
        {Array.from({ length: max }, (_, i) => {
          const fill = Math.max(0, Math.min(1, current - i));
          return (
            <span key={i} className="rating-star" style={{ width: size, height: size }} aria-hidden="true">
              <span className="rating-empty">{star}</span>
              <span className="rating-fill" style={{ width: `${fill * 100}%` }}>
                {star}
              </span>
            </span>
          );
        })}
        {showLabel && <span className="rating-label">{current.toFixed(1)}</span>}
      </span>
    );
  }

  return (
    <div className={cx('rating', disabled && 'is-disabled')} role="radiogroup" aria-label={label} onMouseLeave={() => setHover(null)}>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const id = `${group}-${n}`;
        return (
          <label
            key={n}
            htmlFor={id}
            className={cx('rating-star', n <= shown && 'is-on')}
            style={{ width: size, height: size }}
            onMouseEnter={() => !disabled && setHover(n)}
          >
            <input
              type="radio"
              id={id}
              name={name ?? group}
              value={n}
              className="sr-only"
              checked={current === n}
              disabled={disabled}
              aria-label={words(n)}
              onChange={() => set(n)}
              onClick={() => {
                // Clicking the chosen star again clears the rating.
                if (current === n) set(0);
              }}
            />
            <span className="rating-empty" aria-hidden="true">
              {star}
            </span>
            <span className="rating-fill" aria-hidden="true" style={{ width: n <= shown ? '100%' : '0%' }}>
              {star}
            </span>
          </label>
        );
      })}
      {showLabel && (
        <span className="rating-label" aria-hidden="true">
          {shown ? words(shown) : 'Not rated'}
        </span>
      )}
    </div>
  );
}
