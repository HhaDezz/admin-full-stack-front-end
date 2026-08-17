import { cloneElement, isValidElement, type ReactElement, type ReactNode, type Ref, type RefObject } from 'react';

/* ── Shared ── */

export type AnyProps = Record<string, unknown> & { ref?: Ref<HTMLElement> };

export function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/** Clones the trigger element, attaching our ref and props while keeping its own. */
export function withTrigger(child: ReactNode, ref: RefObject<HTMLElement | null>, extra: Record<string, unknown>): ReactNode {
  if (!isValidElement<AnyProps>(child)) return child;
  const own = child.props;
  const merged: Record<string, unknown> = { ...extra };
  for (const [k, v] of Object.entries(extra)) {
    const theirs = own[k];
    if (typeof v === 'function' && typeof theirs === 'function') {
      merged[k] = (...args: unknown[]) => {
        (theirs as (...a: unknown[]) => void)(...args);
        (v as (...a: unknown[]) => void)(...args);
      };
    }
  }
  if (own['aria-describedby'] && extra['aria-describedby'])
    merged['aria-describedby'] = `${own['aria-describedby']} ${extra['aria-describedby']}`;
  merged.ref = (node: HTMLElement | null) => {
    ref.current = node;
    setRef(own.ref, node);
  };
  return cloneElement(child as ReactElement<AnyProps>, merged);
}

export const panelMotion = {
  initial: 'hidden',
  animate: 'show',
  exit: 'exit',
} as const;
