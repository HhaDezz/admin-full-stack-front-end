import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, type MenuEntry } from './DropdownMenu';
import { Button, type ButtonSize, type ButtonVariant } from './Button';
import { ButtonGroup } from './ButtonGroup';

export interface SplitButtonProps {
  children: ReactNode;
  onClick: () => void;
  /** Other actions in the menu. */
  items: MenuEntry[];
  variant?: Extract<ButtonVariant, 'primary' | 'secondary' | 'soft' | 'danger'>;
  size?: ButtonSize;
  iconStart?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  menuLabel?: string;
}

export function SplitButton({
  children,
  onClick,
  items,
  variant = 'primary',
  size = 'md',
  iconStart,
  loading,
  disabled,
  menuLabel = 'More options',
}: SplitButtonProps) {
  return (
    <ButtonGroup>
      <Button variant={variant} size={size} iconStart={iconStart} loading={loading} disabled={disabled} onClick={onClick}>
        {children}
      </Button>
      <DropdownMenu
        align="end"
        label={menuLabel}
        items={items}
        trigger={
          <Button variant={variant} size={size} className="btn-split-caret" aria-label={menuLabel} disabled={disabled || loading}>
            <ChevronDown size={16} />
          </Button>
        }
      />
    </ButtonGroup>
  );
}
