import { Button, useToast } from '@/components/kit';
import { defineDoc } from '../doc';
import raw from './Toast.tsx?raw';

// #region tones
export function Tones() {
  const toast = useToast();
  return (
    <div className="ex-row">
      <Button onClick={() => toast.ok('Changes saved')}>Success</Button>
      <Button onClick={() => toast.err('Couldn’t reach the server', 'Check your connection and try again.')}>Error</Button>
      <Button onClick={() => toast.info('Export started', 'We’ll email you when it’s ready.')}>Info</Button>
      <Button onClick={() => toast.show({ tone: 'warning', title: 'Storage almost full', description: '92% of 10 GB used.' })}>
        Warning
      </Button>
    </div>
  );
}
// #endregion

// #region action
export function WithAction() {
  const toast = useToast();
  return (
    <Button
      variant="danger"
      onClick={() =>
        toast.show({
          tone: 'success',
          title: '3 users disabled',
          action: { label: 'Undo', onClick: () => toast.info('Restored 3 users') },
          duration: 6000,
        })
      }
    >
      Disable 3 users
    </Button>
  );
}
// #endregion

// #region promise
export function PromiseToast() {
  const toast = useToast();
  const save = () =>
    new Promise<number>((resolve, reject) => setTimeout(() => (Math.random() > 0.3 ? resolve(48) : reject(new Error('timeout'))), 1500));
  return (
    <Button
      variant="primary"
      onClick={() =>
        toast
          .promise(save(), {
            loading: 'Publishing collection…',
            success: (n) => `Published ${n} patterns`,
            error: 'Publishing failed. Try again.',
          })
          .catch(() => {})
      }
    >
      Publish (fails 30% of the time)
    </Button>
  );
}
// #endregion

function ToastPlayground(v: Record<string, string | number | boolean>) {
  const toast = useToast();
  return (
    <Button
      onClick={() =>
        toast.show({
          tone: v.tone as 'success',
          title: String(v.title),
          description: String(v.description) || undefined,
          action: v.action ? { label: 'Undo', onClick: () => toast.info('Undone') } : undefined,
          duration: Number(v.duration) ? Number(v.duration) * 1000 : undefined,
        })
      }
    >
      Show toast
    </Button>
  );
}

export default defineDoc({
  name: 'Toast',
  group: 'Feedback',
  status: 'updated',
  imports: ['useToast', 'ToastProvider'],
  description:
    'Short notifications in the corner: four tones, a description, an action like Undo, and promise toasts that turn from loading into success or error. Up to four stack; hovering pauses them.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'tone', options: ['success', 'info', 'warning', 'error', 'loading'], default: 'success' },
      { type: 'text', name: 'title', default: 'Changes saved' },
      { type: 'text', name: 'description', default: 'Your team sees them now.' },
      { type: 'boolean', name: 'action', label: 'action (Undo)', default: false },
      { type: 'number', name: 'duration', label: 'duration (s, 0 = default)', default: 0, min: 0, max: 15 },
    ],
    render: (v) => <ToastPlayground {...v} />,
    code: ({ tone, title, description, action, duration }) =>
      `toast.show({ tone: '${tone}', title: '${title}'${description ? `, description: '${description}'` : ''}${
        action ? ", action: { label: 'Undo', onClick: undo }" : ''
      }${Number(duration) ? `, duration: ${Number(duration) * 1000}` : ''} });`,
  },
  examples: [
    { id: 'tones', title: 'Tones', description: 'ok(), err(), info() or show() for full control.', Component: Tones },
    { id: 'action', title: 'With an action', description: 'Clicking the action also dismisses the toast.', Component: WithAction },
    { id: 'promise', title: 'Promise', description: 'One toast follows the whole request.', Component: PromiseToast },
  ],
  a11y: [
    'The stack is a labelled region; success and info are polite (role="status"), errors and warnings assertive (role="alert").',
    'Timers pause while the pointer or keyboard focus is in the stack, so people can reach the action. Each toast has a labelled close button.',
  ],
  props: [
    { name: 'show(options)', type: '{ tone, title, description?, action?, duration? } → id', description: 'Show a toast.' },
    { name: 'ok / err / info', type: '(title, description?) → id', description: 'Shorthands.' },
    { name: 'promise', type: '(promise, { loading, success, error }) → promise', description: 'Loading → success / error.' },
    { name: 'update / dismiss', type: '(id, options?) => void', description: 'Change or close one.' },
  ],
});
