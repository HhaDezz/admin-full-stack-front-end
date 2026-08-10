import type { ReactNode } from 'react';
import { cx } from './utils';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  /** Text in the middle of a horizontal divider ("or"). */
  label?: ReactNode;
  dashed?: boolean;
}

export function Divider({ orientation = 'horizontal', label, dashed }: DividerProps) {
  if (orientation === 'vertical')
    return <span className={cx('divider-v', dashed && 'is-dashed')} role="separator" aria-orientation="vertical" />;
  if (label)
    return (
      <div className={cx('divider', 'has-label', dashed && 'is-dashed')} role="separator">
        <span>{label}</span>
      </div>
    );
  return <hr className={cx('divider', dashed && 'is-dashed')} />;
}
