import type { ReactNode } from 'react';
import { Tooltip } from './Tooltip';
import { cx } from './utils';
import { Button, type ButtonProps } from './Button';

export interface IconButtonProps extends Omit<ButtonProps, 'iconStart' | 'iconEnd' | 'children' | 'loadingText' | 'fullWidth'> {
  /** Required: icon-only buttons need a name for screen readers. Also used as the tooltip. */
  label: string;
  icon: ReactNode;
  /** Show `label` in a tooltip on hover and focus (default true). */
  tooltip?: boolean;
  round?: boolean;
}

export function IconButton({ label, icon, tooltip = true, round, variant = 'ghost', size = 'md', className, ...rest }: IconButtonProps) {
  const btn = (
    <Button
      variant={variant}
      size={size}
      aria-label={label}
      className={cx('btn-icon', size !== 'md' && `btn-icon-${size}`, round && 'btn-round', className)}
      {...rest}
    >
      {icon}
    </Button>
  );
  return tooltip ? <Tooltip content={label}>{btn}</Tooltip> : btn;
}
