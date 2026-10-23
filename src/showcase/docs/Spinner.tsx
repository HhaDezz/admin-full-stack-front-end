import { Button, Spinner } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Spinner.tsx?raw';

// #region basic
export function Basic() {
  return (
    <div className="ex-row">
      <Spinner size={16} />
      <Spinner size={24} />
      <Spinner size={36} label="Loading orders" />
      <Button loading>Saving</Button>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Spinner',
  group: 'Feedback',
  status: 'updated',
  description: 'A small loading indicator. Prefer Skeleton when you know the shape of what’s loading.',
  raw,
  playground: {
    controls: [
      { type: 'number', name: 'size', default: 28, min: 12, max: 64, step: 2 },
      { type: 'text', name: 'label', default: 'Loading' },
    ],
    render: (v) => <Spinner size={Number(v.size)} label={String(v.label)} />,
    code: (p) => jsx('Spinner', p, { size: 16, label: 'Loading' }),
  },
  examples: [{ id: 'basic', title: 'Sizes', description: 'Buttons show one automatically with loading.', Component: Basic }],
  a11y: ['role="status" with a label (default “Loading”). Pass label={null} when a parent already announces it.'],
  props: [
    { name: 'size', type: 'number', defaultValue: '16', description: 'Pixels.' },
    { name: 'label', type: 'string | null', defaultValue: "'Loading'", description: 'Accessible name.' },
  ],
});
