import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cx } from './utils';
import type { Responsive, Space } from './types';
import { space, vars } from './_layout';

export interface StackProps {
  children: ReactNode;
  direction?: Responsive<'row' | 'column'>;
  gap?: Responsive<Space>;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/** Flex row or column with token gaps. Direction and gap can change per breakpoint. */
export function Stack({ children, direction = 'column', gap = 3, align, justify, wrap, as: Tag = 'div', className, style }: StackProps) {
  return (
    <Tag
      className={cx('stack', wrap && 'is-wrap', className)}
      style={
        {
          ...vars('dir', direction, String),
          ...vars('gap', gap, space),
          alignItems: align,
          justifyContent: justify,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
