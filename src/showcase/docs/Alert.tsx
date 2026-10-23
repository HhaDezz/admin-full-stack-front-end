import { useState } from 'react';
import { Alert, Button } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Alert.tsx?raw';

// #region tones
export function Tones() {
  return (
    <div className="ex-col" style={{ width: 'min(560px, 100%)' }}>
      <Alert tone="info" title="New version available">
        Refresh to get the latest features.
      </Alert>
      <Alert tone="success" title="Payment received">
        Invoice #1042 is now paid.
      </Alert>
      <Alert tone="warning" title="Your trial ends in 3 days">
        Add a card to keep your data.
      </Alert>
      <Alert tone="danger" title="Couldn’t save">
        The server didn’t respond. Your changes are still here.
      </Alert>
    </div>
  );
}
// #endregion

// #region actions
export function Actions() {
  const [shown, setShown] = useState(true);
  return (
    <div className="ex-col" style={{ width: 'min(560px, 100%)' }}>
      {shown ? (
        <Alert
          tone="warning"
          variant="outline"
          title="Two-step verification is off"
          action={
            <Button size="sm" variant="primary">
              Turn on
            </Button>
          }
          onDismiss={() => setShown(false)}
        >
          Protect admin accounts with a code from an app.
        </Alert>
      ) : (
        <Button onClick={() => setShown(true)}>Show the alert again</Button>
      )}
      <Alert tone="brand" variant="solid">
        Solid variant for the one message that matters most.
      </Alert>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Alert',
  group: 'Feedback',
  status: 'new',
  imports: ['Alert'],
  description:
    'An inline message about the page or a form: info, success, warning or danger, in soft, outline or solid style, with an action and a close button.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'tone', options: ['neutral', 'brand', 'info', 'success', 'warning', 'danger'], default: 'warning' },
      { type: 'select', name: 'variant', options: ['soft', 'outline', 'solid'], default: 'soft' },
      { type: 'text', name: 'title', default: 'Your trial ends in 3 days' },
      { type: 'text', name: 'children', label: 'text', default: 'Add a card to keep your data.' },
      { type: 'boolean', name: 'dismiss', label: 'onDismiss', default: true },
    ],
    render: (v) => (
      <div style={{ width: 'min(560px, 100%)' }}>
        <Alert tone={v.tone as 'info'} variant={v.variant as 'soft'} title={String(v.title)} onDismiss={v.dismiss ? () => {} : undefined}>
          {String(v.children)}
        </Alert>
      </div>
    ),
    code: ({ children, dismiss, ...p }) =>
      jsx('Alert', p, { tone: 'info', variant: 'soft' }, String(children), dismiss ? ['onDismiss={() => setShown(false)}'] : []),
  },
  examples: [
    { id: 'tones', title: 'Tones', description: 'Each has its own icon so colour isn’t the only signal.', Component: Tones },
    { id: 'actions', title: 'Action and dismiss', description: 'Close it, then bring it back.', Component: Actions },
  ],
  a11y: ['Warning and danger use role="alert" (announced immediately); info and success use role="status" (polite).'],
  props: [
    {
      name: 'tone',
      type: "'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger'",
      defaultValue: "'info'",
      description: 'Meaning and colour.',
    },
    { name: 'variant', type: "'soft' | 'outline' | 'solid'", defaultValue: "'soft'", description: 'Style.' },
    { name: 'title / children', type: 'ReactNode', description: 'Heading and text.' },
    { name: 'icon', type: 'ReactNode | false', description: 'Replace or hide the icon.' },
    { name: 'action', type: 'ReactNode', description: 'Buttons on the right.' },
    { name: 'onDismiss', type: '() => void', description: 'Shows a close button.' },
  ],
});
