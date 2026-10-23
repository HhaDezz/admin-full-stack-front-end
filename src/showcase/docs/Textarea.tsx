import { Field, Textarea } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Textarea.tsx?raw';

// #region autosize
export function Autosize() {
  return (
    <div className="ex-col">
      <Field label="Comment" hint="Grows from 2 to 6 lines as you type.">
        <Textarea autosize minRows={2} maxRows={6} placeholder="Write something…" />
      </Field>
    </div>
  );
}
// #endregion

// #region count
export function Count() {
  return (
    <div className="ex-col">
      <Field label="Bio">
        <Textarea showCount maxLength={160} defaultValue="Pattern cutter and part-time potter." />
      </Field>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Textarea',
  group: 'Form inputs',
  status: 'new',
  description: 'Multi-line text that can grow with its content and count characters.',
  raw,
  playground: {
    controls: [
      { type: 'boolean', name: 'autosize', default: true },
      { type: 'number', name: 'minRows', default: 3, min: 1, max: 6 },
      { type: 'number', name: 'maxRows', default: 8, min: 3, max: 16 },
      { type: 'number', name: 'maxLength', default: 200, min: 0, max: 500, step: 20 },
      { type: 'boolean', name: 'showCount', default: true },
      { type: 'boolean', name: 'invalid', default: false },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(420px, 100%)' }}>
        <Textarea
          key={`${v.autosize}-${v.minRows}`}
          aria-label="Playground note"
          placeholder="Write a note…"
          autosize={!!v.autosize}
          minRows={Number(v.minRows)}
          maxRows={Number(v.maxRows)}
          maxLength={Number(v.maxLength) || undefined}
          showCount={!!v.showCount}
          invalid={!!v.invalid}
          disabled={!!v.disabled}
        />
      </div>
    ),
    code: (p) =>
      jsx('Textarea', p, { autosize: false, minRows: 3, maxRows: 8, maxLength: 0, showCount: false, invalid: false, disabled: false }),
  },
  examples: [
    { id: 'autosize', title: 'Autosize', description: 'No scrollbar until maxRows.', Component: Autosize },
    { id: 'count', title: 'Character count', description: 'Turns red at the limit.', Component: Count },
  ],
  props: [
    { name: 'autosize', type: 'boolean', defaultValue: 'false', description: 'Grow with the content.' },
    { name: 'minRows / maxRows', type: 'number', defaultValue: '3 / 10', description: 'Height limits in lines.' },
    { name: 'showCount', type: 'boolean', defaultValue: 'false', description: 'Show “n / max”.' },
    { name: '…rest', type: 'TextareaHTMLAttributes', description: 'Native props, including maxLength and ref.' },
  ],
});
