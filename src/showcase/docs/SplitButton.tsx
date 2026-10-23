import { Copy, FileDown, Mail, Send, Upload } from 'lucide-react';
import { SplitButton, useToast } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './SplitButton.tsx?raw';

// #region basic
export function Basic() {
  const toast = useToast();
  return (
    <div className="ex-row">
      <SplitButton
        iconStart={<Send size={16} />}
        onClick={() => toast.ok('Invoice sent')}
        items={[
          { label: 'Schedule send', icon: <Mail size={15} />, onSelect: () => toast.info('Scheduled for 9:00 tomorrow') },
          { label: 'Download PDF', icon: <FileDown size={15} />, shortcut: '⌘D', onSelect: () => toast.info('Downloading…') },
          { type: 'separator' },
          { label: 'Duplicate', icon: <Copy size={15} />, onSelect: () => toast.info('Duplicated') },
        ]}
      >
        Send invoice
      </SplitButton>
      <SplitButton
        variant="secondary"
        iconStart={<Upload size={16} />}
        onClick={() => toast.ok('Published')}
        items={[{ label: 'Publish to staging' }, { label: 'Publish to production', danger: true }]}
      >
        Publish
      </SplitButton>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'SplitButton',
  group: 'Buttons & actions',
  status: 'new',
  imports: ['SplitButton'],
  description: 'A main action with related alternatives tucked into a menu on the caret.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'variant', options: ['primary', 'secondary', 'soft', 'danger'], default: 'primary' },
      { type: 'select', name: 'size', options: ['sm', 'md', 'lg'], default: 'md' },
      { type: 'text', name: 'children', label: 'label', default: 'Send' },
      { type: 'boolean', name: 'loading', default: false },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <SplitButton
        variant={v.variant as 'primary'}
        size={v.size as 'md'}
        loading={!!v.loading}
        disabled={!!v.disabled}
        iconStart={<Send size={16} />}
        onClick={() => {}}
        menuLabel="More send options"
        items={[
          { label: 'Schedule send', icon: <Mail size={15} /> },
          { label: 'Send a copy to me', icon: <Copy size={15} /> },
        ]}
      >
        {String(v.children)}
      </SplitButton>
    ),
    code: ({ children, ...p }) =>
      jsx('SplitButton', p, { variant: 'primary', size: 'md', loading: false, disabled: false }, String(children), [
        'onClick={send}',
        'items={options}',
      ]),
  },
  examples: [
    {
      id: 'basic',
      title: 'Main action and alternatives',
      description: 'Click the label for the main action; the caret opens a DropdownMenu (keyboard: ↓ on the caret).',
      Component: Basic,
    },
  ],
  a11y: ['Two real buttons inside a group: the caret is labelled “More options” and announces aria-haspopup="menu" and aria-expanded.'],
  props: [
    { name: 'onClick', type: '() => void', description: 'The main action.' },
    { name: 'items', type: 'MenuEntry[]', description: 'Menu entries (see DropdownMenu).' },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'soft' | 'danger'",
      defaultValue: "'primary'",
      description: 'Style for both halves.',
    },
    { name: 'iconStart / size / loading / disabled', type: '…', description: 'As Button.' },
    { name: 'menuLabel', type: 'string', defaultValue: "'More options'", description: 'Name of the caret button.' },
  ],
});
