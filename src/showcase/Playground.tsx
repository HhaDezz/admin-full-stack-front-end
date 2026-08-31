import { useState, type ReactNode } from 'react';
import { Field, Input, SearchSelect, Slider, Switch, ToggleGroup } from '@/components/kit';
import { CodeView, PreviewFrame, PreviewToolbar, useFrame } from './DocParts';

export type PlaygroundValue = string | number | boolean;
export type PlaygroundValues = Record<string, PlaygroundValue>;

export type Control =
  | { type: 'select'; name: string; label?: string; options: string[]; default: string }
  | { type: 'boolean'; name: string; label?: string; default: boolean }
  | { type: 'text'; name: string; label?: string; default: string }
  | { type: 'number'; name: string; label?: string; default: number; min: number; max: number; step?: number };

export interface PlaygroundSpec {
  controls: Control[];
  render: (v: PlaygroundValues) => ReactNode;
  /** Code for the current values. Use jsx() to build it. */
  code: (v: PlaygroundValues) => string;
}

/** Builds a JSX line, leaving out props that still have their default value. */
export function jsx(tag: string, props: PlaygroundValues, defaults: PlaygroundValues, children?: string, extra: string[] = []): string {
  const attrs = [
    ...Object.entries(props)
      .filter(([k, v]) => v !== defaults[k] && v !== '')
      .map(([k, v]) =>
        v === true
          ? k
          : v === false
            ? `${k}={false}`
            : typeof v === 'number'
              ? `${k}={${v}}`
              : `${k}="${String(v).replace(/"/g, '&quot;')}"`,
      ),
    ...extra,
  ];
  const open = `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
  return children ? `${open}>${children}</${tag}>` : `${open} />`;
}

export function Playground({ spec, name }: { spec: PlaygroundSpec; name: string }) {
  const [values, setValues] = useState<PlaygroundValues>(() => Object.fromEntries(spec.controls.map((c) => [c.name, c.default])));
  const [frame, setFrame] = useFrame();
  const set = (k: string, v: PlaygroundValue) => setValues((s) => ({ ...s, [k]: v }));
  return (
    <div className="card playground">
      <PreviewToolbar state={frame} onChange={setFrame} label={`${name} playground`} />
      <PreviewFrame state={frame} className="playground-stage">
        {spec.render(values)}
      </PreviewFrame>
      <div className="playground-controls" role="group" aria-label={`${name} props`}>
        {spec.controls.map((c) => {
          const label = c.label ?? c.name;
          if (c.type === 'boolean')
            return (
              <div key={c.name} className="pg-control pg-bool">
                <Switch
                  size="sm"
                  label={<span className="mono">{label}</span>}
                  checked={values[c.name] as boolean}
                  onChange={(v) => set(c.name, v)}
                />
              </div>
            );
          if (c.type === 'select')
            return (
              <div key={c.name} className="pg-control">
                <span className="pg-label mono" id={`pg-${name}-${c.name}`}>
                  {label}
                </span>
                {c.options.length <= 4 ? (
                  <ToggleGroup
                    size="sm"
                    aria-label={label}
                    value={values[c.name] as string}
                    onChange={(v) => set(c.name, v)}
                    items={c.options.map((o) => ({ value: o, label: o }))}
                  />
                ) : (
                  <SearchSelect
                    aria-label={label}
                    size="sm"
                    searchable={false}
                    minWidth={130}
                    value={values[c.name] as string}
                    onChange={(v) => v != null && set(c.name, v)}
                    options={c.options.map((o) => ({ value: o, label: o }))}
                  />
                )}
              </div>
            );
          if (c.type === 'number')
            return (
              <div key={c.name} className="pg-control pg-number">
                <span className="pg-label mono">
                  {label} <b>{String(values[c.name])}</b>
                </span>
                <Slider
                  aria-label={label}
                  min={c.min}
                  max={c.max}
                  step={c.step ?? 1}
                  value={values[c.name] as number}
                  onChange={(v) => set(c.name, v)}
                  showValue={false}
                />
              </div>
            );
          return (
            <div key={c.name} className="pg-control pg-text">
              <Field label={<span className="mono">{label}</span>}>
                <Input size="sm" value={values[c.name] as string} onChange={(e) => set(c.name, e.target.value)} />
              </Field>
            </div>
          );
        })}
      </div>
      <CodeView code={spec.code(values)} maxHeight={220} />
    </div>
  );
}
