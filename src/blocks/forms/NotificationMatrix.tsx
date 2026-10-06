/**
 * Notification preferences: a switch per event and channel, with save and discard.
 * Uses: Card, Switch, Button. Plain state; wire onSave to your API.
 */
import { useState } from 'react';
import { Button, Card, Switch, useScrollFocus, useToast } from '@/components/kit';

const EVENTS = [
  { id: 'orders', label: 'New orders', hint: 'Every paid order' },
  { id: 'mentions', label: 'Mentions', hint: 'When someone @mentions you' },
  { id: 'reports', label: 'Weekly report', hint: 'Mondays at 9:00' },
  { id: 'security', label: 'Security alerts', hint: 'New sign-ins and password changes' },
];
const CHANNELS = ['email', 'push', 'slack'] as const;
type Prefs = Record<string, Record<(typeof CHANNELS)[number], boolean>>;
const START: Prefs = {
  orders: { email: false, push: true, slack: true },
  mentions: { email: true, push: true, slack: false },
  reports: { email: true, push: false, slack: false },
  security: { email: true, push: true, slack: false },
};

export default function NotificationMatrix() {
  const scrollRef = useScrollFocus();
  const toast = useToast();
  const [saved, setSaved] = useState(START);
  const [prefs, setPrefs] = useState(START);
  const dirty = JSON.stringify(prefs) !== JSON.stringify(saved);
  return (
    <Card
      headingLevel={2}
      title="Notifications"
      description="Choose where you hear about each event."
      padding="none"
      footer={
        <div className="blk-form-foot">
          <span className="muted" role="status" aria-live="polite">
            {dirty ? 'Unsaved changes' : ''}
          </span>
          <Button variant="ghost" size="sm" disabled={!dirty} onClick={() => setPrefs(saved)}>
            Discard
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!dirty}
            onClick={() => {
              setSaved(prefs);
              toast.ok('Preferences saved');
            }}
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="table-wrap" ref={scrollRef}>
        <table className="table blk-matrix">
          <thead>
            <tr>
              <th scope="col">Event</th>
              {CHANNELS.map((c) => (
                <th key={c} scope="col">
                  {c === 'email' ? 'Email' : c === 'push' ? 'Push' : 'Slack'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((e) => (
              <tr key={e.id}>
                <th scope="row">
                  {e.label}
                  <div className="muted blk-sub">{e.hint}</div>
                </th>
                {CHANNELS.map((c) => (
                  <td key={c}>
                    <Switch
                      size="sm"
                      label={`${e.label} by ${c}`}
                      hideLabel
                      checked={prefs[e.id][c]}
                      onChange={(v) => setPrefs((p) => ({ ...p, [e.id]: { ...p[e.id], [c]: v } }))}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
