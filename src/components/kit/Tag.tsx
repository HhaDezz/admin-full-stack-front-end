import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from './utils';
import type { BadgeTone } from './Badge';

/* ── Tag ── */

export interface TagProps {
  children: ReactNode;
  icon?: ReactNode;
  tone?: BadgeTone;
  /** Shows × and calls this when pressed. */
  onRemove?: () => void;
  /** Makes the tag a toggle button. */
  onClick?: () => void;
  selected?: boolean;
  removeLabel?: string;
}

export function Tag({ children, icon, tone = 'neutral', onRemove, onClick, selected, removeLabel }: TagProps) {
  const body = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );
  return (
    <span className={cx('tag', `tag-${tone}`, selected && 'is-selected', onClick && 'is-clickable')}>
      {onClick ? (
        <button type="button" className="tag-main" aria-pressed={selected} onClick={onClick}>
          {body}
        </button>
      ) : (
        <span className="tag-main">{body}</span>
      )}
      {onRemove && (
        <button
          type="button"
          className="tag-x"
          onClick={onRemove}
          aria-label={removeLabel ?? `Remove ${typeof children === 'string' ? children : 'tag'}`}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
