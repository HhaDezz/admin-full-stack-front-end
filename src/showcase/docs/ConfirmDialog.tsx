import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, ConfirmDialog, useToast } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './ConfirmDialog.tsx?raw';

// #region basic
export function Basic() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  return (
    <>
      <Button variant="danger" iconStart={<Trash2 size={16} />} onClick={() => setOpen(true)}>
        Delete project
      </Button>
      <ConfirmDialog
        open={open}
        title="Delete “Spring collection”?"
        message="Its 48 patterns and 3 shared links will be removed. This can’t be undone."
        confirmLabel="Delete project"
        busy={busy}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setBusy(true);
          setTimeout(() => {
            setBusy(false);
            setOpen(false);
            toast.show({ tone: 'success', title: 'Project deleted', action: { label: 'Undo', onClick: () => toast.info('Restored') } });
          }, 1000);
        }}
      />
    </>
  );
}
// #endregion

// #region neutral
export function Neutral() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Publish changes</Button>
      <ConfirmDialog
        open={open}
        tone="brand"
        title="Publish to everyone?"
        message="Members will see the new prices straight away."
        confirmLabel="Publish"
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      />
    </>
  );
}
// #endregion

function ConfirmPlayground(v: Record<string, string | number | boolean>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={v.tone === 'danger' ? 'danger' : 'primary'} onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <ConfirmDialog
        open={open}
        tone={v.tone as 'danger'}
        title={String(v.title)}
        message="They lose access straight away."
        confirmLabel={String(v.confirmLabel)}
        cancelLabel={String(v.cancelLabel)}
        busy={!!v.busy}
        onConfirm={() => setOpen(false)}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export default defineDoc({
  name: 'ConfirmDialog',
  group: 'Overlays',
  status: 'updated',
  description: 'A ready-made “are you sure?” dialog for destructive or important actions, with a busy state.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'tone', options: ['danger', 'brand'], default: 'danger' },
      { type: 'text', name: 'title', default: 'Delete 3 users?' },
      { type: 'text', name: 'confirmLabel', default: 'Delete' },
      { type: 'text', name: 'cancelLabel', default: 'Cancel' },
      { type: 'boolean', name: 'busy', default: false },
    ],
    render: (v) => <ConfirmPlayground {...v} />,
    code: (p) =>
      jsx('ConfirmDialog', p, { tone: 'danger', confirmLabel: 'Confirm', cancelLabel: 'Cancel', busy: false }, undefined, [
        'message="They lose access straight away."',
        'open={open}',
        'onConfirm={remove}',
        'onClose={() => setOpen(false)}',
      ]),
  },
  examples: [
    {
      id: 'basic',
      title: 'Destructive',
      description: 'Red button and warning icon; locked while busy, then a toast with Undo.',
      Component: Basic,
    },
    { id: 'neutral', title: 'Neutral', description: 'tone="brand" for confirmations that aren’t destructive.', Component: Neutral },
  ],
  a11y: [
    'Built on Modal, so focus, Esc and labelling behave the same.',
    'Name the thing being changed in the title and say what will happen in the message.',
  ],
  props: [
    { name: 'title / message', type: 'string / ReactNode', description: 'What and why.' },
    { name: 'confirmLabel / cancelLabel', type: 'string', defaultValue: "'Delete' / 'Cancel'", description: 'Button labels.' },
    { name: 'tone', type: "'danger' | 'brand'", defaultValue: "'danger'", description: 'Style.' },
    { name: 'busy', type: 'boolean', description: 'Spinner and locked.' },
    { name: 'open / onConfirm / onClose', type: '…', description: 'State and callbacks.' },
  ],
});
