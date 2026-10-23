import { useState } from 'react';
import { Bold, Italic, LayoutGrid, List, Rows3, Underline } from 'lucide-react';
import { ToggleGroup } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './ToggleGroup.tsx?raw';

// #region single
export function Single() {
  const [view, setView] = useState<'grid' | 'list' | 'rows'>('grid');
  return (
    <div className="ex-col" style={{ alignItems: 'center' }}>
      <ToggleGroup
        aria-label="View"
        value={view}
        onChange={setView}
        items={[
          { value: 'grid', label: 'Grid', icon: <LayoutGrid size={15} /> },
          { value: 'list', label: 'List', icon: <List size={15} /> },
          { value: 'rows', label: 'Rows', icon: <Rows3 size={15} /> },
        ]}
      />
      <span className="muted">Showing: {view}</span>
    </div>
  );
}
// #endregion

// #region multi
export function Multi() {
  const [marks, setMarks] = useState<('b' | 'i' | 'u')[]>(['b']);
  return (
    <ToggleGroup
      multiple
      aria-label="Text style"
      size="sm"
      value={marks}
      onChange={setMarks}
      items={[
        { value: 'b', label: null, icon: <Bold size={15} />, 'aria-label': 'Bold' },
        { value: 'i', label: null, icon: <Italic size={15} />, 'aria-label': 'Italic' },
        { value: 'u', label: null, icon: <Underline size={15} />, 'aria-label': 'Underline' },
      ]}
    />
  );
}
// #endregion

// #region full
export function Full() {
  return (
    <div className="ex-col">
      <ToggleGroup
        aria-label="Billing"
        fullWidth
        defaultValue="year"
        items={[
          { value: 'month', label: 'Monthly' },
          { value: 'year', label: 'Yearly · save 20%' },
        ]}
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'ToggleGroup',
  group: 'Buttons & actions',
  status: 'new',
  description:
    'Segmented control for switching views or settings. Single choice slides a highlight between options; multiple choice toggles each one.',
  raw,
  playground: {
    controls: [
      { type: 'boolean', name: 'multiple', default: false },
      { type: 'select', name: 'size', options: ['sm', 'md'], default: 'md' },
      { type: 'boolean', name: 'fullWidth', default: false },
      { type: 'boolean', name: 'iconsOnly', default: false },
    ],
    render: (v) => (
      <div style={{ width: v.fullWidth ? 'min(420px, 100%)' : undefined }}>
        {v.multiple ? (
          <ToggleGroup
            multiple
            aria-label="Text style"
            size={v.size as 'md'}
            fullWidth={!!v.fullWidth}
            defaultValue={['bold']}
            items={[
              { value: 'bold', label: v.iconsOnly ? <Bold size={16} /> : 'Bold', 'aria-label': v.iconsOnly ? 'Bold' : undefined },
              { value: 'italic', label: v.iconsOnly ? <Italic size={16} /> : 'Italic', 'aria-label': v.iconsOnly ? 'Italic' : undefined },
              {
                value: 'underline',
                label: v.iconsOnly ? <Underline size={16} /> : 'Underline',
                'aria-label': v.iconsOnly ? 'Underline' : undefined,
              },
            ]}
          />
        ) : (
          <ToggleGroup
            aria-label="View"
            size={v.size as 'md'}
            fullWidth={!!v.fullWidth}
            defaultValue="grid"
            items={[
              { value: 'grid', label: v.iconsOnly ? <LayoutGrid size={16} /> : 'Grid', 'aria-label': v.iconsOnly ? 'Grid' : undefined },
              { value: 'list', label: v.iconsOnly ? <List size={16} /> : 'List', 'aria-label': v.iconsOnly ? 'List' : undefined },
              { value: 'rows', label: v.iconsOnly ? <Rows3 size={16} /> : 'Rows', 'aria-label': v.iconsOnly ? 'Rows' : undefined },
            ]}
          />
        )}
      </div>
    ),
    code: ({ iconsOnly: _i, ...p }) =>
      jsx('ToggleGroup', p, { multiple: false, size: 'md', fullWidth: false }, undefined, [
        'aria-label="View"',
        'items={items}',
        'value={value}',
        'onChange={setValue}',
      ]),
  },
  examples: [
    {
      id: 'single',
      title: 'Single choice',
      description: 'The highlight springs to the new option. Use the arrow keys once it has focus.',
      Component: Single,
    },
    { id: 'multi', title: 'Multiple choice', description: 'Independent toggles, e.g. text formatting.', Component: Multi },
    { id: 'full', title: 'Full width', description: 'Stretches each option evenly.', Component: Full },
  ],
  keyboard: [
    ['Tab', 'Move into the group (to the selected option), then out of it'],
    ['← + →', 'Single choice: select the previous or next option'],
    ['Home + End', 'Single choice: first or last option'],
    ['Space', 'Multiple choice: toggle the focused option'],
  ],
  a11y: [
    'Single choice is a radiogroup with roving tabindex and aria-checked; multiple choice is a group of buttons with aria-pressed.',
    'Icon-only options need an aria-label on the item.',
    'Arrow keys follow reading direction in right-to-left layouts.',
  ],
  props: [
    { name: 'items', type: 'ToggleItem[]', description: '{ value, label, icon?, disabled?, aria-label? }' },
    { name: 'multiple', type: 'boolean', defaultValue: 'false', description: 'Allow several on at once (value becomes an array).' },
    { name: 'value / defaultValue', type: 'V | V[]', description: 'Controlled or starting value.' },
    { name: 'onChange', type: '(v) => void', description: 'Called with the new value.' },
    { name: 'size', type: "'sm' | 'md'", defaultValue: "'md'", description: 'Height.' },
    { name: 'fullWidth', type: 'boolean', defaultValue: 'false', description: 'Stretch to the container.' },
    { name: 'aria-label', type: 'string', description: 'Required name of the group.' },
  ],
});
