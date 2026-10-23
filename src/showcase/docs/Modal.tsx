import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button, Field, Input, Modal, SearchSelect, useToast } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Modal.tsx?raw';

// #region form
export function FormModal() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<string | null>('editor');
  const toast = useToast();
  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setOpen(false);
      toast.ok('Invitation sent');
    }, 1200);
  };
  return (
    <>
      <Button variant="primary" iconStart={<UserPlus size={16} />} onClick={() => setOpen(true)}>
        Invite member
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite a member"
        subtitle="They’ll get an email with a sign-in link."
        icon={<UserPlus size={20} />}
        locked={saving}
        footer={
          <>
            <Button onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={save}>
              Send invite
            </Button>
          </>
        }
      >
        <Field label="Email" required>
          <Input type="email" placeholder="name@company.com" />
        </Field>
        <Field label="Role">
          <SearchSelect
            fullWidth
            value={role}
            onChange={setRole}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'editor', label: 'Editor' },
              { value: 'viewer', label: 'Viewer' },
            ]}
          />
        </Field>
      </Modal>
    </>
  );
}
// #endregion

// #region sizes
export function Sizes() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | null>(null);
  return (
    <div className="ex-row">
      {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Button key={s} onClick={() => setSize(s)}>
          {s.toUpperCase()}
        </Button>
      ))}
      <Modal
        open={size !== null}
        size={size ?? 'md'}
        title={`Size ${size ?? ''}`}
        onClose={() => setSize(null)}
        footer={<Button onClick={() => setSize(null)}>Close</Button>}
      >
        <p className="muted">sm 420 px · md 520 px · lg 760 px · xl 1040 px. All shrink to fit small screens.</p>
      </Modal>
    </div>
  );
}
// #endregion

// #region nested
export function Nested() {
  const [outer, setOuter] = useState(false);
  const [inner, setInner] = useState(false);
  return (
    <>
      <Button onClick={() => setOuter(true)}>Open nested modals</Button>
      <Modal
        open={outer}
        title="Order #1042"
        onClose={() => setOuter(false)}
        footer={
          <Button variant="danger" onClick={() => setInner(true)}>
            Cancel order…
          </Button>
        }
      >
        <p className="muted">Esc closes only the top-most dialog.</p>
        <Modal
          open={inner}
          size="sm"
          tone="danger"
          title="Cancel this order?"
          onClose={() => setInner(false)}
          footer={<Button onClick={() => setInner(false)}>Keep it</Button>}
        >
          <p className="muted">Press Esc: this one closes, the order stays open.</p>
        </Modal>
      </Modal>
    </>
  );
}
// #endregion

function ModalPlayground(v: Record<string, string | number | boolean>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={String(v.title)}
        subtitle={String(v.subtitle) || undefined}
        icon={v.icon ? <UserPlus size={20} /> : undefined}
        size={v.size as 'md'}
        tone={v.tone as 'brand'}
        locked={!!v.locked}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Send
            </Button>
          </>
        }
      >
        <Field label="Email">
          <Input type="email" placeholder="name@company.com" />
        </Field>
      </Modal>
    </>
  );
}

export default defineDoc({
  name: 'Modal',
  group: 'Overlays',
  status: 'updated',
  description:
    'Accessible dialog in five sizes with an icon, subtitle, sticky header and footer, and a locked state while saving. Animates in and out.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'size', options: ['sm', 'md', 'lg', 'xl', 'full'], default: 'md' },
      { type: 'select', name: 'tone', options: ['brand', 'danger', 'gold'], default: 'brand' },
      { type: 'text', name: 'title', default: 'Invite people' },
      { type: 'text', name: 'subtitle', default: 'They’ll get an email with a link.' },
      { type: 'boolean', name: 'icon', default: true },
      { type: 'boolean', name: 'locked', default: false },
    ],
    render: (v) => <ModalPlayground {...v} />,
    code: ({ icon, ...p }) =>
      jsx('Modal', p, { size: 'md', tone: 'brand', subtitle: '', locked: false }, '\n  …\n', [
        ...(icon ? ['icon={<UserPlus size={20} />}'] : []),
        'open={open}',
        'onClose={() => setOpen(false)}',
        'footer={…}',
      ]),
  },
  examples: [
    {
      id: 'form',
      title: 'Form in a modal',
      description: 'Focus moves to the first field; while saving, Esc and the backdrop are disabled.',
      Component: FormModal,
    },
    { id: 'sizes', title: 'Sizes', description: 'Plus size="full" for nearly full-screen.', Component: Sizes },
    { id: 'nested', title: 'Nested', description: 'Overlays stack; only the top one reacts to Esc.', Component: Nested },
  ],
  keyboard: [
    ['Esc', 'Close (unless locked)'],
    ['Tab', 'Move between controls; focus stays inside the dialog'],
  ],
  a11y: [
    'role="dialog" with aria-modal, labelled by its title and described by its subtitle.',
    'Focus is trapped inside and returns to the button that opened it.',
    'Page scroll is locked while any overlay is open.',
  ],
  props: [
    { name: 'open', type: 'boolean', description: 'Pass it to animate closing; or render conditionally.' },
    { name: 'onClose', type: '() => void', description: 'Esc, backdrop or × pressed.' },
    { name: 'title / subtitle', type: 'string / ReactNode', description: 'Header text.' },
    { name: 'icon / tone', type: "ReactNode / 'brand' | 'danger' | 'gold'", description: 'Tinted icon tile.' },
    { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", defaultValue: "'md'", description: 'Width.' },
    { name: 'footer', type: 'ReactNode', description: 'Sticky footer (buttons).' },
    { name: 'locked', type: 'boolean', defaultValue: 'false', description: 'Block closing, e.g. while saving.' },
  ],
});
