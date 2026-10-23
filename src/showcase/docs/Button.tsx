import { useState } from 'react';
import { ArrowRight, Download, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Button.tsx?raw';

// #region variants
export function Variants() {
  return (
    <div className="ex-row">
      <Button variant="primary">Primary</Button>
      <Button>Secondary</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}
// #endregion

// #region sizes
export function Sizes() {
  return (
    <div className="ex-row">
      <Button variant="primary" size="sm">
        Small
      </Button>
      <Button variant="primary">Medium</Button>
      <Button variant="primary" size="lg">
        Large
      </Button>
    </div>
  );
}
// #endregion

// #region icons
export function Icons() {
  return (
    <div className="ex-row">
      <Button variant="primary" iconStart={<Plus size={16} />}>
        New user
      </Button>
      <Button iconStart={<Download size={16} />}>Export CSV</Button>
      <Button variant="soft" iconEnd={<ArrowRight size={16} className="flip-rtl" />}>
        Continue
      </Button>
      <Button variant="danger" iconStart={<Trash2 size={16} />}>
        Delete
      </Button>
    </div>
  );
}
// #endregion

// #region loading
export function Loading() {
  const [saving, setSaving] = useState(false);
  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1800);
  };
  return (
    <div className="ex-row">
      <Button variant="primary" iconStart={<Save size={16} />} loading={saving} loadingText="Saving…" onClick={save}>
        Save changes
      </Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}
// #endregion

// #region block
export function FullWidth() {
  return (
    <div className="ex-col">
      <Button variant="primary" size="lg" fullWidth>
        Sign in
      </Button>
      <Button fullWidth>Create an account</Button>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Button',
  group: 'Buttons & actions',
  status: 'new',
  description:
    'Six variants in three sizes, with icon slots, a loading state that keeps its width, and press feedback that doesn’t ripple.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'variant', options: ['primary', 'secondary', 'soft', 'ghost', 'danger', 'link'], default: 'primary' },
      { type: 'select', name: 'size', options: ['sm', 'md', 'lg'], default: 'md' },
      { type: 'text', name: 'children', label: 'label', default: 'Save changes' },
      { type: 'boolean', name: 'icon', label: 'iconStart', default: false },
      { type: 'boolean', name: 'loading', default: false },
      { type: 'boolean', name: 'disabled', default: false },
      { type: 'boolean', name: 'fullWidth', default: false },
    ],
    render: (v) => (
      <div style={{ width: v.fullWidth ? 'min(420px, 100%)' : undefined }}>
        <Button
          variant={v.variant as 'primary'}
          size={v.size as 'md'}
          loading={!!v.loading}
          disabled={!!v.disabled}
          fullWidth={!!v.fullWidth}
          iconStart={v.icon ? <Save size={16} /> : undefined}
        >
          {String(v.children)}
        </Button>
      </div>
    ),
    code: ({ children, icon, ...p }) =>
      jsx(
        'Button',
        p,
        { variant: 'secondary', size: 'md', loading: false, disabled: false, fullWidth: false },
        String(children),
        icon ? ['iconStart={<Save size={16} />}'] : [],
      ),
  },
  examples: [
    {
      id: 'variants',
      title: 'Variants',
      description: 'Primary for the main action on a screen; secondary for everything else; danger only for destructive actions.',
      Component: Variants,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: 'Heights follow the density tokens, so compact mode shrinks them all at once.',
      Component: Sizes,
    },
    {
      id: 'icons',
      title: 'With icons',
      description: 'Start and end slots take any icon. End icons flip in right-to-left layouts when you add flip-rtl.',
      Component: Icons,
    },
    {
      id: 'loading',
      title: 'Loading',
      description: 'Click to see it: a spinner replaces the start icon and the button is disabled with aria-busy.',
      Component: Loading,
    },
    { id: 'block', title: 'Full width', description: 'For forms and narrow panels.', Component: FullWidth },
  ],
  a11y: [
    'Renders a native <button> with type="button" by default, so it never submits a form by accident (pass type="submit" when it should).',
    'Loading sets aria-busy and disables the button; the spinner itself is hidden from screen readers.',
    'Focus ring uses the brand colour at 2 px with an offset, visible in both themes.',
  ],
  props: [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'link'",
      defaultValue: "'secondary'",
      description: 'Visual style.',
    },
    { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", description: 'Height and padding.' },
    { name: 'iconStart / iconEnd', type: 'ReactNode', description: 'Icons before or after the label.' },
    { name: 'loading', type: 'boolean', defaultValue: 'false', description: 'Spinner, disabled, aria-busy.' },
    { name: 'loadingText', type: 'ReactNode', description: 'Label while loading (defaults to the children).' },
    { name: 'fullWidth', type: 'boolean', defaultValue: 'false', description: 'Stretch to the container.' },
    { name: '…rest', type: 'ButtonHTMLAttributes', description: 'Any native button prop, including ref.' },
  ],
});
