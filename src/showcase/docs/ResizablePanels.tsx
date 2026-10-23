import { ResizablePanels } from '@/components/kit';
import { defineDoc } from '../doc';
import { jsx } from '../Playground';
import raw from './ResizablePanels.tsx?raw';

// #region horizontal
export function Horizontal() {
  return (
    <div className="ex-wide">
      <ResizablePanels defaultSize={32} min={20} max={70} storageKey="demo.panels" height={240} aria-label="Resize sidebar">
        <div className="card-pad">
          <b>Folders</b>
          <p className="muted">Drag the handle, or focus it and use the arrow keys. The size is remembered.</p>
        </div>
        <div className="card-pad">
          <b>Preview</b>
          <p className="muted">Double-click the handle to reset.</p>
        </div>
      </ResizablePanels>
    </div>
  );
}
// #endregion

// #region vertical
export function Vertical() {
  return (
    <div className="ex-wide">
      <ResizablePanels direction="vertical" defaultSize={60} height={300} aria-label="Resize editor and console">
        <div className="card-pad">Editor</div>
        <div className="card-pad mono">Console output…</div>
      </ResizablePanels>
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'ResizablePanels',
  group: 'Layout',
  status: 'new',
  description: 'Two panels with a draggable divider. Sizes can be saved per browser, and the divider works from the keyboard.',
  raw,
  playground: {
    controls: [
      { type: 'select', name: 'direction', options: ['horizontal', 'vertical'], default: 'horizontal' },
      { type: 'number', name: 'defaultSize', default: 40, min: 10, max: 90, step: 5 },
      { type: 'number', name: 'min', default: 20, min: 5, max: 45, step: 5 },
      { type: 'number', name: 'max', default: 80, min: 55, max: 95, step: 5 },
    ],
    render: (v) => (
      <div style={{ width: '100%' }}>
        <ResizablePanels
          key={`${v.direction}-${v.defaultSize}`}
          direction={v.direction as 'horizontal'}
          defaultSize={Number(v.defaultSize)}
          min={Number(v.min)}
          max={Number(v.max)}
          height={220}
          aria-label="Resize panels"
        >
          <div className="demo-box-fill" style={{ height: '100%' }}>
            List
          </div>
          <div className="demo-box-fill" style={{ height: '100%' }}>
            Details
          </div>
        </ResizablePanels>
      </div>
    ),
    code: (p) =>
      jsx('ResizablePanels', p, { direction: 'horizontal', defaultSize: 50, min: 20, max: 80 }, '\n  <List />\n  <Details />\n', [
        'storageKey="inbox-split"',
      ]),
  },
  examples: [
    { id: 'horizontal', title: 'Side by side', description: 'storageKey keeps the size after a reload.', Component: Horizontal },
    { id: 'vertical', title: 'Stacked', description: 'direction="vertical".', Component: Vertical },
  ],
  keyboard: [
    ['← + →', 'Move the divider by 2 % (↑ ↓ when vertical)'],
    ['Shift + →', 'Move by 10 %'],
    ['Home + End', 'Smallest or largest size'],
    ['Enter', 'Back to the default size'],
  ],
  a11y: ['The handle is a focusable role="separator" with aria-valuenow, -min and -max, so screen readers announce its position.'],
  props: [
    { name: 'children', type: '[ReactNode, ReactNode]', description: 'The two panels.' },
    { name: 'direction', type: "'horizontal' | 'vertical'", defaultValue: "'horizontal'", description: 'Layout.' },
    { name: 'defaultSize', type: 'number', defaultValue: '50', description: 'First panel, in %.' },
    { name: 'min / max', type: 'number', defaultValue: '15 / 85', description: 'Limits in %.' },
    { name: 'storageKey', type: 'string', description: 'Remember the size in localStorage.' },
    { name: 'height', type: 'number | string', description: 'Container height.' },
  ],
});
