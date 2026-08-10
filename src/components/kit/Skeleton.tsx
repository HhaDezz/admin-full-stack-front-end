import { cx } from './utils';

/* ── Skeleton ── */

export interface SkeletonProps {
  h?: number | string;
  w?: number | string;
  r?: number | string;
  circle?: boolean;
  className?: string;
}

export function Skeleton({ h = 16, w = '100%', r, circle, className }: SkeletonProps) {
  return (
    <div
      className={cx('skeleton', className)}
      aria-hidden="true"
      style={{ height: h, width: circle ? h : w, borderRadius: circle ? '50%' : r }}
    />
  );
}

/** Placeholder paragraph: `lines` bars with a shorter last line. */
export function SkeletonText({ lines = 3, gap = 8 }: { lines?: number; gap?: number }) {
  return (
    <div style={{ display: 'grid', gap }} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} h={12} w={i === lines - 1 && lines > 1 ? '62%' : '100%'} />
      ))}
    </div>
  );
}
