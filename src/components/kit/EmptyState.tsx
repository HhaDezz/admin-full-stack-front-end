import type { ReactNode } from 'react';
import { Illustration, type IllustrationName } from './illustrations';
import { cx } from './utils';

/* ── Empty state ── */

export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  /** A small icon in a tile… */
  icon?: ReactNode;
  /** …or a larger line illustration. */
  illustration?: IllustrationName;
  actions?: ReactNode;
  compact?: boolean;
  /** Heading level for the title, to fit the page outline. */
  headingLevel?: 2 | 3 | 4;
}

export function EmptyState({ title, description, icon, illustration, actions, compact, headingLevel = 4 }: EmptyStateProps) {
  const H = `h${headingLevel}` as 'h4';
  return (
    <div className={cx('empty', compact && 'is-compact')}>
      {illustration ? <Illustration name={illustration} /> : icon && <div className="ico">{icon}</div>}
      <H className="empty-title">{title}</H>
      {description && <p>{description}</p>}
      {actions && <div className="empty-actions">{actions}</div>}
    </div>
  );
}

/** Older name kept for existing screens. */
export function Empty({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return <EmptyState icon={icon} title={title} description={children} />;
}
