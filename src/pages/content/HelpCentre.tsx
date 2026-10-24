import { useMemo, useState } from 'react';
import { BookOpen, CreditCard, LifeBuoy, Mail, MessageCircle, Search, ShieldCheck, Users } from 'lucide-react';
import { Accordion, Button, Card, EmptyState, Grid, Input, PageHeader } from '../../components/kit';
import { FAQ } from '../../blocks/marketing/FaqSection';

/* Help centre: search, topics, frequent questions and ways to get in touch. */

const TOPICS = [
  {
    id: 'start',
    icon: <BookOpen size={20} />,
    title: 'Getting started',
    text: 'Create a workspace, invite your team, set up roles.',
    count: 12,
  },
  {
    id: 'people',
    icon: <Users size={20} />,
    title: 'People and roles',
    text: 'Permissions, custom roles and who can see what.',
    count: 18,
  },
  { id: 'security', icon: <ShieldCheck size={20} />, title: 'Security', text: 'Two-step sign-in, devices, the audit log.', count: 9 },
  { id: 'billing', icon: <CreditCard size={20} />, title: 'Billing', text: 'Plans, invoices, tax and payment methods.', count: 11 },
];
const MORE = [
  {
    q: 'How do I reset someone’s two-step sign-in?',
    a: 'Open Users, find the person and choose “Reset two-step sign-in”. They set it up again the next time they sign in.',
  },
  {
    q: 'Why can’t a user see a page?',
    a: 'Pages and buttons appear only when one of the person’s roles holds the permission. Check their roles under Users, then the role’s permissions under Roles.',
  },
  {
    q: 'How long is the audit log kept?',
    a: 'Three months by default. Change audit.retention-months in the API settings to keep it longer.',
  },
];
const ALL = [...FAQ, ...MORE];
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function HelpCentre() {
  const [q, setQ] = useState('');
  const hits = useMemo(() => {
    const n = norm(q.trim());
    return n ? ALL.filter((f) => norm(`${f.q} ${f.a}`).includes(n)) : ALL;
  }, [q]);
  return (
    <div className="content-page">
      <header className="content-hero help-hero">
        <PageHeader title="How can we help?" description="Search the guides, or browse by topic." />
        <div className="help-search">
          <Input
            size="lg"
            aria-label="Search help"
            placeholder="Search for “two-step”, “invoice”, “roles”…"
            prefix={<Search size={18} />}
            clearable
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </header>

      {!q && (
        <section aria-labelledby="topics-title" className="content-section">
          <h2 id="topics-title" className="content-h2">
            Browse by topic
          </h2>
          <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} as="ul" className="help-topics">
            {TOPICS.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="card help-topic">
                  <span className="blk-feat-icon" aria-hidden="true">
                    {t.icon}
                  </span>
                  <b>{t.title}</b>
                  <span className="muted">{t.text}</span>
                  <span className="help-count">{t.count} articles</span>
                </a>
              </li>
            ))}
          </Grid>
        </section>
      )}

      <section aria-labelledby="faq-title" className="content-section">
        <h2 id="faq-title" className="content-h2">
          {q ? `${hits.length} ${hits.length === 1 ? 'answer' : 'answers'} for “${q.trim()}”` : 'Frequently asked'}
        </h2>
        {hits.length ? (
          <Accordion
            key={q}
            variant="separated"
            items={hits.map((f, i) => ({ value: String(i), title: f.q, content: <p>{f.a}</p> }))}
            defaultOpen={q ? ['0'] : []}
          />
        ) : (
          <Card>
            <EmptyState
              illustration="search"
              headingLevel={3}
              title="No answers for that"
              description="Try fewer words, or ask us directly below."
            />
          </Card>
        )}
      </section>

      <section aria-labelledby="contact-title" className="content-section">
        <h2 id="contact-title" className="content-h2">
          Still stuck?
        </h2>
        <Grid columns={{ base: 1, md: 3 }} gap={4}>
          <Card headingLevel={3} title="Email us" description="We reply within one working day.">
            <Button variant="secondary" iconStart={<Mail size={16} />}>
              support@example.com
            </Button>
          </Card>
          <Card headingLevel={3} title="Chat" description="Weekdays, 9:00 to 18:00 UTC.">
            <Button variant="secondary" iconStart={<MessageCircle size={16} />}>
              Start a chat
            </Button>
          </Card>
          <Card headingLevel={3} title="System status" description="All systems working normally.">
            <Button variant="secondary" iconStart={<LifeBuoy size={16} />}>
              Status page
            </Button>
          </Card>
        </Grid>
      </section>
    </div>
  );
}
