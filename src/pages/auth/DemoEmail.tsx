import { useEffect, useState } from 'react';
import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { latestDemoEmail } from '../../lib/demoInbox';
import type { DemoEmail as Mail } from '../../lib/mock-account';

/** Demo mode only: shows the link that would have been emailed, so the flow can be finished. */
export function DemoEmail({ to, subject, refresh = 0 }: { to: string; subject: string; refresh?: number }) {
  const [mail, setMail] = useState<Mail | null>(null);
  useEffect(() => {
    let live = true;
    void latestDemoEmail(to, subject).then((m) => live && setMail(m));
    return () => {
      live = false;
    };
  }, [to, subject, refresh]);
  if (!mail) return null;
  return (
    <div className="demo-box demo-inbox">
      <b>
        <Inbox size={14} /> Demo inbox
      </b>{' '}
      There’s no real email in demo mode. This is the message sent to {to}:
      <Link className="btn btn-sm btn-soft" to={mail.link.replace(location.origin, '')}>
        {subject}
      </Link>
    </div>
  );
}
