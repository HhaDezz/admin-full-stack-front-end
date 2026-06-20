import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Users } from 'lucide-react';
import { config } from '../../lib/config';
import './auth.css';

/** The split screen shared by sign-in, sign-up, password reset, email confirmation and the lock screen. */
export function AuthLayout({ children, art }: { children: ReactNode; art?: { title: string; text: string } }) {
  return (
    <div className="login">
      <section className="login-art" aria-hidden="true">
        <div className="brand" style={{ padding: 0 }}>
          <div className="brand-mark">{config.appName.slice(0, 1).toUpperCase()}</div>
          <div>
            <div className="brand-name">{config.appName}</div>
            <div className="brand-sub">Admin</div>
          </div>
        </div>
        <div>
          <h2>{art?.title ?? 'Everyone in. Only what they need.'}</h2>
          <p>{art?.text ?? 'Manage your team, decide exactly what each role can do, and see every change in a tamper-proof audit log.'}</p>
        </div>
        <div className="feats">
          <div className="feat">
            <i>
              <Users size={17} />
            </i>{' '}
            Users, roles and fine-grained permissions
          </div>
          <div className="feat">
            <i>
              <ShieldCheck size={17} />
            </i>{' '}
            Two-step sign-in, device control and instant revocation
          </div>
          <div className="feat">
            <i>
              <LayoutDashboard size={17} />
            </i>{' '}
            Dashboard, notifications and a full audit trail
          </div>
        </div>
      </section>
      <main className="login-form">
        <div className="login-card">
          <Link to="/login" className="auth-brand-sm" aria-label={`${config.appName} sign in`}>
            <span className="brand-mark">{config.appName.slice(0, 1).toUpperCase()}</span>
            <span>{config.appName}</span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}

/** Title block at the top of an auth card. */
export function AuthHeader({ eyebrow, title, children }: { eyebrow?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="auth-head">
      {eyebrow}
      <h1>{title}</h1>
      {children && <p className="muted">{children}</p>}
    </header>
  );
}
