import { useState } from 'react';
import { Field, Input, QrCode } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './QrCode.tsx?raw';

// #region basic
export function Basic() {
  const [url, setUrl] = useState('https://example.com/invite/7Q2K');
  return (
    <div className="ex-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <QrCode value={url || ' '} size={160} aria-label={`QR code for ${url}`} />
      <Field label="Link">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} />
      </Field>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'QrCode',
  group: 'Data display',
  status: 'new',
  description:
    'A crisp SVG QR code for links, invites and authenticator setup (it draws the two-step sign-in code). Always dark on a white quiet zone, so every camera reads it, even in dark mode.',
  raw,
  playground: {
    controls: [
      {
        type: 'text',
        name: 'value',
        default: 'otpauth://totp/Anjana%20Admin:demo@anjana.test?secret=JBSWY3DPEHPK3PXP&issuer=Anjana%20Admin',
      },
      { type: 'number', name: 'size', default: 180, min: 96, max: 256, step: 16 },
      { type: 'select', name: 'level', options: ['L', 'M', 'Q', 'H'], default: 'M' },
    ],
    render: (v) => <QrCode value={String(v.value) || ' '} size={Number(v.size)} level={v.level as 'M'} aria-label="Playground QR code" />,
    code: (p) => jsx('QrCode', p, { size: 180, level: 'M' }, undefined, ['aria-label="Scan to set up two-step sign-in"']),
  },
  examples: [{ id: 'basic', title: 'Live link', description: 'Changes as you type.', Component: Basic }],
  a11y: [
    'Rendered as an SVG with role="img"; give it an aria-label that says what scanning does.',
    'Always offer the same thing as text too (the link, or the setup key), for people who can’t scan.',
  ],
  props: [
    { name: 'value', type: 'string', description: 'The text or URL to encode.' },
    { name: 'size', type: 'number', defaultValue: '180', description: 'Width and height in px.' },
    {
      name: 'level',
      type: "'L' | 'M' | 'Q' | 'H'",
      defaultValue: "'M'",
      description: 'Error correction (more is denser but survives damage).',
    },
    { name: 'aria-label', type: 'string', description: 'What scanning it does.' },
  ],
});
