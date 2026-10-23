import { useState } from 'react';
import { Hash } from 'lucide-react';
import { Tag } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './Tag.tsx?raw';

// #region removable
export function Removable() {
  const [tags, setTags] = useState(['React', 'TypeScript', 'Spring Boot', 'PostgreSQL']);
  return (
    <div className="ex-row">
      {tags.map((t) => (
        <Tag key={t} icon={<Hash size={13} />} onRemove={() => setTags((x) => x.filter((y) => y !== t))}>
          {t}
        </Tag>
      ))}
      {tags.length === 0 && <span className="muted">All removed. Reload the page to get them back.</span>}
    </div>
  );
}
// #endregion

// #region filters
export function Filters() {
  const [on, setOn] = useState<string[]>(['Active']);
  const flip = (t: string) => setOn((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]));
  return (
    <div className="ex-row">
      {['Active', 'Invited', 'Disabled', 'Admins only'].map((t) => (
        <Tag key={t} selected={on.includes(t)} onClick={() => flip(t)} tone="brand">
          {t}
        </Tag>
      ))}
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'Tag',
  group: 'Data display',
  status: 'new',
  description: 'Compact labels people can remove or toggle: keywords, filters, selected values.',
  raw,
  playground: {
    controls: [
      { type: 'text', name: 'children', label: 'text', default: 'Spring Boot' },
      { type: 'select', name: 'tone', options: ['neutral', 'brand', 'ok', 'warn', 'danger', 'info', 'gold'], default: 'neutral' },
      { type: 'boolean', name: 'removable', label: 'onRemove', default: true },
      { type: 'boolean', name: 'icon', default: true },
    ],
    render: (v) => (
      <Tag tone={v.tone as 'neutral'} icon={v.icon ? <Hash size={13} /> : undefined} onRemove={v.removable ? () => {} : undefined}>
        {String(v.children)}
      </Tag>
    ),
    code: ({ children, removable, icon, ...p }) =>
      jsx('Tag', p, { tone: 'neutral' }, String(children), [
        ...(icon ? ['icon={<Hash size={13} />}'] : []),
        ...(removable ? ['onRemove={() => remove(tag)}'] : []),
      ]),
  },
  examples: [
    { id: 'removable', title: 'Removable', description: 'The × is its own button with a label like “Remove React”.', Component: Removable },
    { id: 'filters', title: 'Toggle filters', description: 'With onClick the tag is a toggle button (aria-pressed).', Component: Filters },
  ],
  props: [
    { name: 'tone', type: 'BadgeTone', defaultValue: "'neutral'", description: 'Colour.' },
    { name: 'icon', type: 'ReactNode', description: 'Leading icon.' },
    { name: 'onRemove', type: '() => void', description: 'Shows a remove button.' },
    { name: 'removeLabel', type: 'string', description: 'Screen-reader name for ×; defaults to “Remove <text>”.' },
    { name: 'onClick / selected', type: '() => void / boolean', description: 'Toggle behaviour.' },
  ],
});
