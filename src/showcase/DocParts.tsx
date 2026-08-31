import { useState, type ComponentType, type ReactNode } from 'react';
import { Code2, Eye, Monitor, Moon, Smartphone, Sun, Tablet } from 'lucide-react';
import { CodeBlock, ToggleGroup } from '@/components/kit';
import { useTheme } from '../lib/theme';
import './showcase.css';

export interface Example {
  id: string;
  title: string;
  description: string;
  Component: ComponentType;
  code: string;
}

type Width = 'full' | 'tablet' | 'phone';
const WIDTHS: Record<Width, string | undefined> = { full: undefined, tablet: '768px', phone: '390px' };

export interface FrameState {
  theme: 'light' | 'dark';
  dir: 'ltr' | 'rtl';
  width: Width;
}

/** Light/dark, LTR/RTL and device-width switches for a preview. Menus and dialogs portal to the page,
 * so they follow the page theme; everything rendered inline follows the frame. */
export function PreviewToolbar({ state, onChange, label }: { state: FrameState; onChange: (s: FrameState) => void; label: string }) {
  return (
    <div className="ex-tools" role="toolbar" aria-label={`${label} preview settings`}>
      <ToggleGroup
        size="sm"
        aria-label="Preview theme"
        value={state.theme}
        onChange={(theme) => onChange({ ...state, theme })}
        items={[
          { value: 'light', label: '', icon: <Sun size={14} />, 'aria-label': 'Light' },
          { value: 'dark', label: '', icon: <Moon size={14} />, 'aria-label': 'Dark' },
        ]}
      />
      <ToggleGroup
        size="sm"
        aria-label="Preview direction"
        value={state.dir}
        onChange={(dir) => onChange({ ...state, dir })}
        items={[
          { value: 'ltr', label: 'LTR' },
          { value: 'rtl', label: 'RTL' },
        ]}
      />
      <ToggleGroup<Width>
        size="sm"
        aria-label="Preview width"
        value={state.width}
        onChange={(width) => onChange({ ...state, width })}
        items={[
          { value: 'full', label: '', icon: <Monitor size={14} />, 'aria-label': 'Full width' },
          { value: 'tablet', label: '', icon: <Tablet size={14} />, 'aria-label': 'Tablet, 768 pixels' },
          { value: 'phone', label: '', icon: <Smartphone size={14} />, 'aria-label': 'Phone, 390 pixels' },
        ]}
      />
    </div>
  );
}

export function useFrame(): [FrameState, (s: FrameState) => void] {
  const { theme } = useTheme();
  const [own, setOwn] = useState<Partial<FrameState>>({});
  const dir = typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
  return [{ theme: own.theme ?? theme, dir: own.dir ?? dir, width: own.width ?? 'full' }, (s) => setOwn(s)];
}

/** The framed stage a preview renders in. */
export function PreviewFrame({ state, className, children }: { state: FrameState; className?: string; children: ReactNode }) {
  const w = WIDTHS[state.width];
  return (
    <div className={`ex-canvas ${w ? 'is-device' : ''}`}>
      <div className={`ex-frame ${className ?? ''}`} data-theme={state.theme} dir={state.dir} style={w ? { width: w } : undefined}>
        {children}
      </div>
    </div>
  );
}

/** One live example with Preview / Code tabs, preview settings and a copy button. */
export function ExampleBlock({ example }: { example: Example }) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [frame, setFrame] = useFrame();
  const { Component } = example;
  return (
    <section className="ex card" id={example.id} aria-labelledby={`${example.id}-title`}>
      <header className="ex-head">
        <div>
          <h3 id={`${example.id}-title`}>
            <a href={`#${example.id}`}>{example.title}</a>
          </h3>
          <p>{example.description}</p>
        </div>
        <div className="seg" role="tablist" aria-label={`${example.title} view`}>
          <button role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')}>
            <Eye size={15} /> Preview
          </button>
          <button role="tab" aria-selected={tab === 'code'} onClick={() => setTab('code')}>
            <Code2 size={15} /> Code
          </button>
        </div>
      </header>
      {tab === 'preview' ? (
        <>
          <PreviewToolbar state={frame} onChange={setFrame} label={example.title} />
          <PreviewFrame state={frame} className="ex-stage">
            <Component />
          </PreviewFrame>
        </>
      ) : (
        <CodeView code={example.code} />
      )}
    </section>
  );
}

/** Highlighted code with a copy button (the kit's CodeBlock). */
export function CodeView({ code, lang = 'tsx', maxHeight = 560 }: { code: string; lang?: string; maxHeight?: number }) {
  return <CodeBlock code={code} lang={lang} maxHeight={maxHeight} className="ex-codeblock" />;
}

export interface PropRow {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="card table-wrap">
      <table className="table props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="mono">{r.name}</td>
              <td className="mono props-type">{r.type}</td>
              <td className="mono muted">{r.defaultValue ?? '—'}</td>
              <td>{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="doc-section" id={id} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`}>{title}</h2>
      {children}
    </section>
  );
}
