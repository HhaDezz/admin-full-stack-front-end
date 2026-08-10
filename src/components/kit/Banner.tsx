import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from './utils';
import type { Tone } from './types';
import { TONE_ICON } from './_feedback';

/* ── Banner ── */

export interface BannerProps {
  tone?: Tone;
  children: ReactNode;
  icon?: ReactNode | false;
  action?: ReactNode;
  onDismiss?: () => void;
  /** Sticks to the top of the scrolling area. */
  sticky?: boolean;
  /** Name of the region (default "Announcement"); make it unique when a page has several banners. */
  'aria-label'?: string;
}

export function Banner({
  tone = 'brand',
  children,
  icon,
  action,
  onDismiss,
  sticky,
  'aria-label': ariaLabel = 'Announcement',
}: BannerProps) {
  const Icon = TONE_ICON[tone];
  return (
    <div className={cx('banner', `tone-${tone}`, sticky && 'is-sticky')} role="region" aria-label={ariaLabel}>
      {icon !== false && <span className="banner-icon">{icon ?? <Icon size={17} />}</span>}
      <div className="banner-text">{children}</div>
      {action}
      {onDismiss && (
        <button className="banner-close" onClick={onDismiss} aria-label="Dismiss announcement">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
