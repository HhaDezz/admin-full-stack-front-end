import { Link } from 'react-router-dom';
import { ResultPage } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './ResultPage.tsx?raw';

// #region success
export function Success() {
  return (
    <div className="card ex-wide">
      <ResultPage
        headingLevel={3}
        status="success"
        title="Payment complete"
        description="We’ve emailed the receipt to billing@acme.com."
        actions={
          <>
            <Link className="btn btn-primary" to="/">
              Go to dashboard
            </Link>
            <button className="btn">View receipt</button>
          </>
        }
      />
    </div>
  );
}
// #endregion

// #region pages
export function Pages() {
  return (
    <div className="ex-row">
      {[
        ['/404', '404 Not found'],
        ['/403', '403 Forbidden'],
        ['/500', '500 Server error'],
        ['/maintenance', 'Maintenance'],
        ['/coming-soon', 'Coming soon'],
      ].map(([to, label]) => (
        <Link key={to} to={to} className="btn">
          {label}
        </Link>
      ))}
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'ResultPage',
  group: 'Feedback',
  status: 'new',
  imports: ['ResultPage', 'useCountdown'],
  description:
    'Full-page outcomes: success, errors (403, 404, 500), maintenance and coming soon. The template’s system pages are built with it.',
  raw,
  playground: {
    controls: [
      {
        type: 'select',
        name: 'status',
        options: ['success', 'error', 'info', 'warning', '403', '404', '500', 'maintenance', 'soon'],
        default: 'success',
      },
      { type: 'text', name: 'title', default: 'Payment received' },
      { type: 'text', name: 'description', default: 'We’ve emailed you a receipt.' },
      { type: 'boolean', name: 'actions', default: true },
    ],
    render: (v) => (
      <ResultPage
        status={v.status as 'success'}
        title={String(v.title)}
        description={String(v.description) || undefined}
        headingLevel={2}
        actions={
          v.actions ? (
            <Link className="btn btn-primary" to="/ui">
              Back to the kit
            </Link>
          ) : undefined
        }
      />
    ),
    code: ({ actions, ...p }) =>
      jsx(
        'ResultPage',
        p,
        { description: '' },
        undefined,
        actions ? ['actions={<Link className="btn btn-primary" to="/">Home</Link>}'] : [],
      ),
  },
  examples: [
    { id: 'success', title: 'Success', description: 'Inside a card, after a flow finishes.', Component: Success },
    {
      id: 'pages',
      title: 'Ready-made system pages',
      description: 'Open each one. They work without signing in, and unknown URLs inside the app show the 404 page.',
      Component: Pages,
    },
  ],
  a11y: ['The title is an <h1>; the large code (404) is decorative.'],
  props: [
    {
      name: 'status',
      type: "'success' | 'error' | 'info' | 'warning' | '403' | '404' | '500' | 'maintenance' | 'soon'",
      description: 'Picks the illustration and code.',
    },
    { name: 'title / description', type: 'ReactNode', description: 'Text.' },
    { name: 'actions / children', type: 'ReactNode', description: 'Buttons; extra content (countdown, form).' },
    { name: 'fullScreen', type: 'boolean', defaultValue: 'false', description: 'Fill the viewport.' },
  ],
});
