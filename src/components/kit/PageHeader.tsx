import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cx } from './utils';

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons on the right. */
  actions?: ReactNode;
  /** Breadcrumbs or a small label above the title. */
  eyebrow?: ReactNode;
  /** Shows a back link above the title. */
  back?: { to: string; label: string };
  /** Sticks under the top bar while the page scrolls. */
  sticky?: boolean;
  /** Heading level of the title (default 1: one page header per page). */
  headingLevel?: 1 | 2 | 3;
}

export function PageHeader({ title, description, actions, eyebrow, back, sticky, headingLevel = 1 }: PageHeaderProps) {
  const H = `h${headingLevel}` as 'h1';
  const ref = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    if (!sticky || !ref.current || typeof IntersectionObserver === 'undefined') return;
    // A 1 px sentinel tells us when the header has started sticking, to add its shadow.
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    ref.current.before(sentinel);
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { rootMargin: '-72px 0px 0px 0px' });
    io.observe(sentinel);
    return () => {
      io.disconnect();
      sentinel.remove();
    };
  }, [sticky]);
  return (
    <div ref={ref} className={cx('page-head', 'page-header', sticky && 'is-sticky', stuck && 'is-stuck')}>
      <div className="page-header-main">
        {back && (
          <Link to={back.to} className="kit-back">
            <ArrowLeft size={15} /> {back.label}
          </Link>
        )}
        {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
        <H className="page-header-title">{title}</H>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
