import { CopyButton, Input } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './CopyButton.tsx?raw';

// #region basic
export function Basic() {
  const key = 'atl_live_9f2c4e7b1d';
  return (
    <div className="ex-col">
      <Input readOnly value={key} aria-label="API key" className="mono" suffix={<CopyButton value={key} label="Copy API key" />} />
      <div className="ex-row">
        <CopyButton value="npm install" variant="secondary">
          Copy command
        </CopyButton>
        <CopyButton value="https://example.com/invite/7Hk2" variant="soft">
          Copy invite link
        </CopyButton>
      </div>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'CopyButton',
  group: 'Buttons & actions',
  status: 'new',
  description: 'Copies text to the clipboard and confirms with a tick. Icon-only inside fields, or with a label.',
  raw,
  playground: {
    controls: [
      { type: 'text', name: 'value', default: 'sk_live_51H8xQ2' },
      { type: 'select', name: 'variant', options: ['primary', 'secondary', 'soft', 'ghost'], default: 'secondary' },
      { type: 'select', name: 'size', options: ['sm', 'md', 'lg'], default: 'md' },
      { type: 'text', name: 'label', default: 'Copy' },
      { type: 'text', name: 'copiedLabel', default: 'Copied' },
    ],
    render: (v) => (
      <CopyButton
        value={String(v.value)}
        variant={v.variant as 'secondary'}
        size={v.size as 'md'}
        label={String(v.label)}
        copiedLabel={String(v.copiedLabel)}
      />
    ),
    code: (p) => jsx('CopyButton', p, { variant: 'secondary', size: 'md', label: 'Copy', copiedLabel: 'Copied' }),
  },
  examples: [
    {
      id: 'basic',
      title: 'In a field and on its own',
      description: 'Click to copy; the icon turns into a tick for a moment.',
      Component: Basic,
    },
  ],
  a11y: [
    '“Copied” is announced through a polite live region.',
    'If the browser blocks the clipboard, the label changes to “Press Ctrl+C” rather than failing silently.',
  ],
  props: [
    { name: 'value', type: 'string', description: 'Text to copy.' },
    { name: 'children', type: 'ReactNode', description: 'Visible label; omit for icon-only.' },
    { name: 'label / copiedLabel', type: 'string', defaultValue: "'Copy' / 'Copied'", description: 'Names before and after copying.' },
    { name: 'onCopied', type: '() => void', description: 'Called after a successful copy.' },
    { name: 'size / variant', type: 'as Button', defaultValue: "'sm'", description: 'Appearance.' },
  ],
});
