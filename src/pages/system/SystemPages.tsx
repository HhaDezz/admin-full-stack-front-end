import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Home, LifeBuoy } from 'lucide-react';
import { Button, Input, ResultPage, useCountdown, useToast } from '../../components/kit';

/** Page not found. `fullScreen` when shown outside the app shell. */
export function NotFound({ fullScreen }: { fullScreen?: boolean }) {
  const navigate = useNavigate();
  return (
    <ResultPage
      status="404"
      fullScreen={fullScreen}
      title="This page has slipped its stitches"
      description="The address may be mistyped, or the page has moved. Check the link, or head back to the dashboard."
      actions={
        <>
          <Button variant="primary" iconStart={<Home size={16} />} onClick={() => navigate('/')}>
            Back to dashboard
          </Button>
          <Button iconStart={<ArrowLeft size={16} className="flip-rtl" />} onClick={() => navigate(-1)}>
            Go back
          </Button>
        </>
      }
    />
  );
}

export function Forbidden({ fullScreen, permission }: { fullScreen?: boolean; permission?: string }) {
  return (
    <ResultPage
      status="403"
      fullScreen={fullScreen}
      title="You don’t have access to this page"
      description={
        permission === 'SUPER_ADMIN' ? (
          'Only super admins can open this page.'
        ) : permission ? (
          <>
            Ask an administrator to grant you the <span className="mono">{permission}</span> permission.
          </>
        ) : (
          'Your role doesn’t include this area. Ask an administrator if you need it.'
        )
      }
      actions={
        <Link to="/" className="btn btn-primary">
          <Home size={16} /> Back to dashboard
        </Link>
      }
    />
  );
}

export { ServerError } from './ServerError';

function Countdown({ to }: { to: number }) {
  const t = useCountdown(to);
  const cells: [number, string][] = [
    [t.days, 'days'],
    [t.hours, 'hours'],
    [t.minutes, 'minutes'],
    [t.seconds, 'seconds'],
  ];
  return (
    <div className="countdown" role="timer" aria-label={`${t.days} days, ${t.hours} hours and ${t.minutes} minutes left`}>
      {cells.map(([n, l]) => (
        <div key={l} className="countdown-cell" aria-hidden="true">
          <b>{String(n).padStart(2, '0')}</b>
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}

// Demo targets: a fixed offset from when the page first loads.
const LOADED = Date.now();

export function Maintenance() {
  return (
    <ResultPage
      status="maintenance"
      fullScreen
      title="We’re tailoring a few things"
      description="Scheduled maintenance is under way. Everything will be back shortly; your data is safe."
      actions={
        <a href="mailto:support@example.com" className="btn">
          <LifeBuoy size={16} /> Contact support
        </a>
      }
    >
      <Countdown to={LOADED + 2 * 3600_000 + 15 * 60_000} />
    </ResultPage>
  );
}

export function ComingSoon() {
  const [email, setEmail] = useState('');
  const toast = useToast();
  return (
    <ResultPage
      status="soon"
      fullScreen
      title="Something new is on the cutting table"
      description="We’re putting the finishing touches on it. Leave your email and we’ll tell you when it’s ready."
    >
      <Countdown to={LOADED + 12 * 86400_000 + 6 * 3600_000} />
      <form
        className="soon-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^\S+@\S+\.\S+$/.test(email)) return toast.err('Enter a valid email address');
          toast.ok('You’re on the list', `We’ll write to ${email} at launch.`);
          setEmail('');
        }}
      >
        <Input
          type="email"
          aria-label="Email address"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          prefix={<Bell size={15} />}
        />
        <Button type="submit" variant="primary">
          Notify me
        </Button>
      </form>
    </ResultPage>
  );
}
