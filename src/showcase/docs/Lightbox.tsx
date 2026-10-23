import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button, Lightbox, type LightboxItem } from '@/components/kit';
import { defineDoc } from '../doc';
import raw from './Lightbox.tsx?raw';

/** Sample pictures drawn as SVG, so the docs work offline. */
const art = (hue: number, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 45% 62%)"/><stop offset="1" stop-color="hsl(${hue + 40} 40% 32%)"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="880" cy="260" r="120" fill="hsl(${hue + 20} 70% 85% / .5)"/><path d="M0 640 L300 420 L520 600 L780 380 L1200 680 L1200 800 L0 800Z" fill="hsl(${hue} 30% 20% / .45)"/><text x="60" y="740" font-family="sans-serif" font-size="44" fill="white" opacity=".85">${label}</text></svg>`,
  )}`;

// #region gallery
const PHOTOS: LightboxItem[] = [
  {
    src: art(160, 'Summer collection'),
    alt: 'Green hills under a pale sky',
    title: 'Summer collection',
    caption: 'Lookbook cover · 1200 × 800',
  },
  { src: art(20, 'Studio'), alt: 'Warm orange landscape', title: 'Studio', caption: 'Shot on location' },
  { src: art(220, 'Night shift'), alt: 'Blue mountains at dusk', title: 'Night shift', downloadUrl: '#' },
  { src: art(290, 'Launch'), alt: 'Purple hills with a pale moon', title: 'Launch' },
];

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, width: 'min(560px, 100%)' }}>
        {PHOTOS.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(i)}
            style={{ padding: 0, border: 0, borderRadius: 10, overflow: 'hidden', cursor: 'zoom-in' }}
            aria-label={`Open ${p.title}`}
          >
            <img src={p.src} alt="" style={{ display: 'block', width: '100%', aspectRatio: '3 / 2', objectFit: 'cover' }} />
          </button>
        ))}
      </div>
      <Lightbox items={PHOTOS} open={open !== null} index={open ?? 0} onIndexChange={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
// #endregion

// #region preview
const FILES: LightboxItem[] = [
  {
    alt: 'Invoice INV-2041',
    title: 'INV-2041.pdf',
    content: (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          gap: 10,
          padding: 40,
          background: 'var(--surface)',
          borderRadius: 12,
          color: 'var(--ink)',
        }}
      >
        <FileText size={48} aria-hidden="true" />
        <b>INV-2041.pdf</b>
        <span className="muted">No preview for PDFs in this demo</span>
      </div>
    ),
    downloadUrl: '#',
  },
  { src: art(100, 'Receipt photo'), alt: 'Photo of a receipt', title: 'receipt.jpg' },
];

export function Preview() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Preview attachments</Button>
      <Lightbox items={FILES} open={open} onClose={() => setOpen(false)} thumbnails={false} />
    </>
  );
}
// #endregion

export default defineDoc({
  name: 'Lightbox',
  group: 'Data display',
  status: 'new',
  description:
    'Pictures (or any preview) full screen over the page, with next and previous, swipe on touch screens, click to zoom, a thumbnail strip and a download button.',
  imports: ['Lightbox', 'type LightboxItem'],
  raw,
  examples: [
    {
      id: 'gallery',
      title: 'Image gallery',
      description: 'Click a picture to open it. Arrow keys or the side buttons move between them, the strip jumps to any one.',
      Component: Gallery,
    },
    {
      id: 'preview',
      title: 'File previews',
      description: 'Items without src show their content instead, e.g. a file card or a PDF frame.',
      Component: Preview,
    },
  ],
  keyboard: [
    ['Right / Left', 'Next or previous (swapped in right-to-left)'],
    ['+ / -', 'Zoom in or out'],
    ['Tab', 'Move between the buttons; focus stays in the viewer'],
    ['Escape', 'Close and return focus to what opened it'],
  ],
  a11y: [
    'A modal dialog with aria-roledescription="image viewer", named after the current picture.',
    'The counter (“2 / 4”) is a polite live region, so moving between pictures is announced.',
    'Every picture needs alt text; thumbnails are buttons named after their picture.',
    'With reduced motion the slide becomes a plain fade.',
  ],
  props: [
    { name: 'items', type: 'LightboxItem[]', description: '{ src?, alt, title?, caption?, content?, downloadUrl? }' },
    { name: 'open / onClose', type: 'boolean / () => void', description: 'Show it.' },
    { name: 'index / onIndexChange', type: 'number', defaultValue: '0', description: 'Which item is shown.' },
    { name: 'thumbnails', type: 'boolean', defaultValue: 'true', description: 'The strip along the bottom.' },
  ],
});
