import type { ReactElement } from 'react';

/**
 * Small line illustrations for empty and result states. They draw with the theme's
 * colours (brand, gold, line), so they follow light, dark and custom brand colours.
 */
export type IllustrationName = 'search' | 'inbox' | 'folder' | 'lock' | 'error' | 'success' | 'tools' | 'rocket' | 'lost';

const base = { fill: 'none', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function Frame({ children, label }: { children: ReactElement | ReactElement[]; label?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      width="160"
      height="120"
      className="illo"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <ellipse cx="80" cy="104" rx="52" ry="7" className="illo-shadow" />
      <circle cx="80" cy="56" r="44" className="illo-disc" />
      {/* Stitch line: the template's tailoring motif */}
      <path d="M22 30 C 40 6, 120 6, 138 30" className="illo-stitch" {...base} strokeWidth={1.6} strokeDasharray="4 5" />
      <g {...base} className="illo-ink">
        {children}
      </g>
    </svg>
  );
}

const DRAW: Record<IllustrationName, () => ReactElement[]> = {
  search: () => [
    <rect key="a" x="46" y="34" width="56" height="44" rx="8" className="illo-card" />,
    <path key="b" d="M56 48h30M56 58h20" />,
    <circle key="c" cx="98" cy="70" r="13" className="illo-card" />,
    <path key="d" d="M107 79l10 10" className="illo-accent" />,
  ],
  inbox: () => [
    <path key="a" d="M44 60l10-24h52l10 24v20a6 6 0 0 1-6 6H50a6 6 0 0 1-6-6z" className="illo-card" />,
    <path key="b" d="M44 60h22l4 8h20l4-8h22" />,
    <path key="c" d="M70 46h20" className="illo-accent" />,
  ],
  folder: () => [
    <path key="a" d="M44 42a6 6 0 0 1 6-6h16l8 8h36a6 6 0 0 1 6 6v30a6 6 0 0 1-6 6H50a6 6 0 0 1-6-6z" className="illo-card" />,
    <path key="b" d="M70 64h20M80 54v20" className="illo-accent" />,
  ],
  lock: () => [
    <rect key="a" x="54" y="52" width="52" height="38" rx="8" className="illo-card" />,
    <path key="b" d="M64 52v-8a16 16 0 0 1 32 0v8" />,
    <path key="c" d="M80 66v10" className="illo-accent" />,
  ],
  error: () => [
    <path key="a" d="M80 28l34 58H46z" className="illo-card" />,
    <path key="b" d="M80 50v16" className="illo-accent" />,
    <circle key="c" cx="80" cy="75" r="1.6" className="illo-accent" />,
  ],
  success: () => [
    <circle key="a" cx="80" cy="58" r="26" className="illo-card" />,
    <path key="b" d="M68 58l8 8 16-17" className="illo-accent" />,
  ],
  tools: () => [
    <rect key="a" x="46" y="40" width="68" height="44" rx="8" className="illo-card" />,
    <path key="b" d="M46 52h68" />,
    <circle key="c" cx="80" cy="68" r="8" className="illo-accent" />,
    <path key="d" d="M80 56v4M80 76v4M68 68h4M88 68h4" className="illo-accent" />,
  ],
  rocket: () => [
    <path key="a" d="M80 26c14 10 18 28 14 46H66c-4-18 0-36 14-46z" className="illo-card" />,
    <circle key="b" cx="80" cy="50" r="6" className="illo-accent" />,
    <path key="c" d="M66 72l-8 12 14-4M94 72l8 12-14-4M76 80l4 10 4-10" />,
  ],
  lost: () => [
    <path key="a" d="M48 84V44a6 6 0 0 1 6-6h52a6 6 0 0 1 6 6v40" className="illo-card" />,
    <path key="b" d="M40 84h80" />,
    <path key="c" d="M66 56l8 8M74 56l-8 8M86 56l8 8M94 56l-8 8" className="illo-accent" />,
    <path key="d" d="M70 76c6-4 14-4 20 0" />,
  ],
};

export function Illustration({ name, label }: { name: IllustrationName; label?: string }) {
  return <Frame label={label}>{DRAW[name]()}</Frame>;
}
