import type { ReactNode } from 'react';
import { cx } from './utils';

/* ── Card ── */

export interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Buttons at the top right. */
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  /** Image or chart that fills the top edge to edge. */
  media?: ReactNode;
  /** Lifts on hover (for cards that contain a link or open something). */
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Heading level of the title, to fit the page outline. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function Card({
  title,
  description,
  actions,
  footer,
  children,
  media,
  interactive,
  padding = 'md',
  headingLevel = 3,
  className,
}: CardProps) {
  const H = `h${headingLevel}` as 'h3';
  return (
    <div className={cx('card', 'kcard', interactive && 'is-interactive', className)}>
      {media && <div className="kcard-media">{media}</div>}
      {(title || actions) && (
        <div className="kcard-head">
          <div>
            {title && <H>{title}</H>}
            {description && <p>{description}</p>}
          </div>
          {actions && <div className="kcard-actions">{actions}</div>}
        </div>
      )}
      {children != null && <div className={cx('kcard-body', `pad-${padding}`)}>{children}</div>}
      {footer && <div className="kcard-foot">{footer}</div>}
    </div>
  );
}
