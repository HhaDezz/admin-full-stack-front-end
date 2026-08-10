import { type CSSProperties, useState } from 'react';
import { hue, initials } from '../../lib/format';
import { cx } from './utils';

/* ── Avatar ── */

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

const AV_PX = { xs: 24, sm: 30, md: 36, lg: 48, xl: 64 } as const;

export interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  status?: 'online' | 'away' | 'busy' | 'offline';
  shape?: 'circle' | 'square';
  /** Announce the name (default: decorative, because a name is usually shown next to it). */
  labelled?: boolean;
}

export function Avatar({ name, src, size = 'md', status, shape = 'circle', labelled }: AvatarProps) {
  const px = typeof size === 'number' ? size : AV_PX[size];
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={cx('avatar', shape === 'square' && 'is-square')}
      style={{ '--h': hue(name), '--s': `${px}px` } as CSSProperties}
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? `${name}${status ? `, ${status}` : ''}` : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      {src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : initials(name)}
      {status && <i className={`avatar-status s-${status}`} />}
    </span>
  );
}

export interface AvatarGroupProps {
  people: { name: string; src?: string }[];
  /** Show this many, then "+N". */
  max?: number;
  size?: AvatarSize;
  'aria-label'?: string;
}

export function AvatarGroup({ people, max = 4, size = 'sm', 'aria-label': label }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  const px = typeof size === 'number' ? size : AV_PX[size];
  return (
    <div className="avatar-group" role="group" aria-label={label ?? `${people.length} people: ${people.map((p) => p.name).join(', ')}`}>
      {shown.map((p) => (
        <span key={p.name} className="avatar-group-item" title={p.name}>
          <Avatar name={p.name} src={p.src} size={size} />
        </span>
      ))}
      {rest > 0 && (
        <span className="avatar avatar-more" style={{ '--s': `${px}px` } as CSSProperties} aria-hidden="true">
          +{rest}
        </span>
      )}
    </div>
  );
}
