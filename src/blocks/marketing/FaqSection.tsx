/**
 * FAQ: questions in an accordion, with a contact prompt for anything else.
 * Uses: Accordion, Button. Questions live in FAQ, so the help centre can reuse them.
 */
import { Mail } from 'lucide-react';
import { Accordion, Button } from '@/components/kit';

export const FAQ = [
  {
    q: 'Can I change plans later?',
    a: 'Yes. Upgrades apply straight away and are prorated; downgrades apply at the end of the billing period.',
  },
  { q: 'Do you offer a free trial?', a: 'The Team plan has a 14-day trial with every feature. No card is needed to start.' },
  {
    q: 'How does two-step sign-in work?',
    a: 'People add the workspace to an authenticator app by scanning a QR code, then enter a six-digit code when they sign in. Each person also gets ten one-time recovery codes.',
  },
  {
    q: 'Where is my data stored?',
    a: 'In the region you choose when you create the workspace (EU or US). Backups stay in the same region.',
  },
  {
    q: 'Can I export everything?',
    a: 'Users, roles, permissions and the audit log can be exported as CSV at any time, and the API returns the same data.',
  },
];

export default function FaqSection() {
  return (
    <div className="blk-faq">
      <div>
        <h2 className="blk-h2">Questions, answered</h2>
        <p className="muted">Can’t find what you’re looking for? We reply within a working day.</p>
        <Button variant="secondary" iconStart={<Mail size={16} />}>
          Contact support
        </Button>
      </div>
      <Accordion
        items={FAQ.map((f, i) => ({ value: String(i), title: f.q, content: <p>{f.a}</p> }))}
        defaultOpen={['0']}
        variant="separated"
      />
    </div>
  );
}
