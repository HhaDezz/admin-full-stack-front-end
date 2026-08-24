import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cx } from './utils';

/* ── Steps ── */

export interface StepItem {
  title: ReactNode;
  description?: ReactNode;
  /** Marks a step as failed. */
  error?: boolean;
}

export interface StepsProps {
  items: StepItem[];
  /** Index of the current step (0-based). Steps before it are complete. */
  current: number;
  orientation?: 'horizontal' | 'vertical';
  /** Lets people jump back to completed steps. */
  onStepClick?: (index: number) => void;
}

export function Steps({ items, current, orientation = 'horizontal', onStepClick }: StepsProps) {
  return (
    <ol className={cx('steps', `is-${orientation}`)} aria-label="Progress">
      {items.map((s, i) => {
        const state = s.error ? 'error' : i < current ? 'done' : i === current ? 'current' : 'todo';
        const clickable = onStepClick && i < current;
        const inner = (
          <>
            <span className="step-dot" aria-hidden="true">
              {state === 'done' ? <Check size={14} strokeWidth={3} /> : state === 'error' ? '!' : i + 1}
            </span>
            <span className="step-text">
              <span className="step-title">{s.title}</span>
              {s.description && <span className="step-desc">{s.description}</span>}
              <span className="sr-only">
                {{ done: ' (completed)', current: ' (current step)', error: ' (has errors)', todo: '' }[state]}
              </span>
            </span>
          </>
        );
        return (
          <li key={i} className={`step is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            {clickable ? (
              <button type="button" className="step-btn" onClick={() => onStepClick(i)}>
                {inner}
              </button>
            ) : (
              <div className="step-btn">{inner}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
