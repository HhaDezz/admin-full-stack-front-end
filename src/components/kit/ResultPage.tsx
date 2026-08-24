import { type ReactNode, useEffect, useState } from 'react';
import { Illustration, type IllustrationName } from './illustrations';
import { cx } from './utils';

/* ── Result page (errors, success, maintenance) ── */

export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '403' | '404' | '500' | 'maintenance' | 'soon';

const RESULT: Record<ResultStatus, { illo: IllustrationName; code?: string }> = {
  success: { illo: 'success' },
  error: { illo: 'error' },
  info: { illo: 'inbox' },
  warning: { illo: 'error' },
  '403': { illo: 'lock', code: '403' },
  '404': { illo: 'lost', code: '404' },
  '500': { illo: 'error', code: '500' },
  maintenance: { illo: 'tools' },
  soon: { illo: 'rocket' },
};

export interface ResultPageProps {
  status: ResultStatus;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Extra content under the actions (e.g. a countdown or a subscribe form). */
  children?: ReactNode;
  /** Fill the viewport (for pages shown outside the app shell). */
  fullScreen?: boolean;
  /** Heading level of the title (default 1; use 2 or 3 inside a card or panel). */
  headingLevel?: 1 | 2 | 3;
}

export function ResultPage({ status, title, description, actions, children, fullScreen, headingLevel = 1 }: ResultPageProps) {
  const r = RESULT[status];
  const H = `h${headingLevel}` as 'h1';
  // A full-screen result page is the whole document, so it is the main landmark.
  const Root = fullScreen ? 'main' : 'div';
  return (
    <Root className={cx('result', fullScreen && 'is-full', `result-${status}`)}>
      <div className="result-inner">
        <Illustration name={r.illo} />
        {r.code && (
          <div className="result-code display" aria-hidden="true">
            {r.code}
          </div>
        )}
        <H className="result-title">{title}</H>
        {description && <p className="result-text">{description}</p>}
        {actions && <div className="result-actions">{actions}</div>}
        {children}
      </div>
    </Root>
  );
}

/** Live countdown text ("2d 04:12:09") for coming-soon and maintenance pages. */
export function useCountdown(target: Date | number) {
  const end = typeof target === 'number' ? target : target.getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, end - now);
  const s = Math.floor(left / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: left === 0,
  };
}
