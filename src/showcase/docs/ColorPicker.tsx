import { useState } from 'react';
import { ColorPicker, Field } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './ColorPicker.tsx?raw';

// #region brand
export function Brand() {
  const [color, setColor] = useState('#1f4d45');
  return (
    <div className="ex-col" style={{ alignItems: 'flex-start' }}>
      <Field label="Brand colour" hint="Pick a preset or any colour.">
        <ColorPicker value={color} onChange={setColor} />
      </Field>
      <div className="ex-row">
        <span style={{ width: 48, height: 28, borderRadius: 8, background: color, display: 'inline-block' }} aria-hidden="true" />
        <code>{color}</code>
      </div>
    </div>
  );
}
// #endregion

// #region swatches
export function Swatches() {
  return (
    <div className="ex-col" style={{ alignItems: 'flex-start' }}>
      <Field label="Label colour" hint="Only these colours (custom={false}).">
        <ColorPicker
          custom={false}
          swatches={['#2f7d54', '#3d6b9a', '#7c3aed', '#be185d', '#c8663a', '#dca33a']}
          defaultValue="#3d6b9a"
          size="sm"
        />
      </Field>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'ColorPicker',
  group: 'Form inputs',
  status: 'new',
  description: 'A colour field with preset swatches, a saturation area, hue slider and hex input. Works fully from the keyboard.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'size', options: ['sm', 'md'], default: 'md' },
      { type: 'boolean', name: 'custom', default: true },
      { type: 'boolean', name: 'invalid', default: false },
      { type: 'boolean', name: 'disabled', default: false },
    ],
    render: (v) => (
      <div style={{ width: 'min(220px, 100%)' }}>
        <ColorPicker
          aria-label="Playground colour"
          size={v.size as 'md'}
          custom={!!v.custom}
          invalid={!!v.invalid}
          disabled={!!v.disabled}
        />
      </div>
    ),
    code: (p) =>
      jsx('ColorPicker', p, { size: 'md', custom: true, invalid: false, disabled: false }, undefined, [
        'value={color}',
        'onChange={setColor}',
      ]),
  },
  examples: [
    { id: 'brand', title: 'Any colour', description: 'Swatches first, then the area, hue and hex for anything else.', Component: Brand },
    {
      id: 'swatches',
      title: 'Presets only',
      description: 'For labels and categories where colours should match the system.',
      Component: Swatches,
    },
  ],
  keyboard: [
    ['Enter / Space', 'Open the picker'],
    ['Arrow keys', 'Move in the colour area or along the hue slider (Shift for bigger steps in the area)'],
    ['Esc', 'Close and return focus to the field'],
  ],
  a11y: [
    'The colour area is a 2D slider that announces saturation and brightness; hue is a regular slider.',
    'Swatches are toggle buttons (aria-pressed) named by their hex value. Chromium browsers also get an eyedropper.',
    'The hex field accepts #abc, abc and #aabbcc.',
  ],
  props: [
    { name: 'value / defaultValue', type: 'string', defaultValue: "'#1f4d45'", description: 'Hex colour.' },
    { name: 'onChange', type: '(hex: string) => void', description: 'New colour.' },
    { name: 'swatches', type: 'string[]', defaultValue: 'DEFAULT_SWATCHES', description: 'Presets; [] hides them.' },
    { name: 'custom', type: 'boolean', defaultValue: 'true', description: 'Allow colours outside the swatches.' },
    { name: 'size', type: "'sm' | 'md'", defaultValue: "'md'", description: 'Field height.' },
    { name: 'disabled / invalid', type: 'boolean', description: 'States.' },
  ],
  extra: [
    {
      id: 'helpers',
      title: 'Helpers',
      content: (
        <p>
          <code>hexToHsv</code> and <code>hsvToHex</code> are exported too, for building your own colour tools.
        </p>
      ),
    },
  ],
});
