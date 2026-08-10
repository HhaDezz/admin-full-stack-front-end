import type { ReactNode } from 'react';
import { cx } from './utils';

export interface ButtonGroupProps {
  children: ReactNode;
  /** Joined edges (default) or separate buttons with a gap. */
  attached?: boolean;
  orientation?: 'horizontal' | 'vertical';
  'aria-label'?: string;
}

export function ButtonGroup({ children, attached = true, orientation = 'horizontal', 'aria-label': label }: ButtonGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cx('btn-group', attached && 'is-attached', orientation === 'vertical' && 'is-vertical')}
    >
      {children}
    </div>
  );
}
