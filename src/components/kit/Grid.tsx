import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cx } from './utils';
import type { Responsive, Space } from './types';
import { space, vars } from './_layout';

export interface GridProps {
  children: ReactNode;
  /** Fixed column count per breakpoint… */
  columns?: Responsive<number>;
  /** …or as many columns as fit, each at least this wide (e.g. 240). */
  minChildWidth?: number;
  gap?: Responsive<Space>;
  align?: CSSProperties['alignItems'];
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

export function Grid({ children, columns = 1, minChildWidth, gap = 4, align, as: Tag = 'div', className, style }: GridProps) {
  const cols = minChildWidth
    ? { '--cols': `repeat(auto-fill, minmax(min(${minChildWidth}px, 100%), 1fr))` }
    : vars('cols', columns, (n) => `repeat(${n}, minmax(0, 1fr))`);
  return (
    <Tag className={cx('grid', className)} style={{ ...cols, ...vars('gap', gap, space), alignItems: align, ...style } as CSSProperties}>
      {children}
    </Tag>
  );
}
