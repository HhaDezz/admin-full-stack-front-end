import type { ComponentType, ReactNode } from 'react';
import { Badge, Kbd } from '@/components/kit';
import { DocSection, ExampleBlock, PropsTable, type PropRow } from './DocParts';
import { Playground, type PlaygroundSpec } from './Playground';

export interface DocExample {
  /** Matches a `// #region <id>` … `// #endregion` block in the doc file. */
  id: string;
  title: string;
  description: string;
  Component: ComponentType;
}

export interface DocSpec {
  name: string;
  group: string;
  description: ReactNode;
  status?: 'new' | 'updated' | 'stable';
  /** Names in the import line (defaults to `name`). */
  imports?: string[];
  /** Module the import line names (default '@/components/kit'). */
  importFrom?: string;
  /** The doc file's own source (`import raw from './x.tsx?raw'`), so the code shown is the code that runs. */
  raw: string;
  examples: DocExample[];
  /** Live controls for the main props, shown above the examples. */
  playground?: PlaygroundSpec;
  /** One table, or several named tables for components made of parts. */
  props?: PropRow[] | { title: string; rows: PropRow[] }[];
  keyboard?: [string, string][];
  a11y?: ReactNode[];
  /** Extra sections after the examples. */
  extra?: { id: string; title: string; content: ReactNode }[];
}

/** Pulls one example's source out of the doc file: the region, plus only the imports it uses. */
export function snippet(raw: string, id: string): string {
  const start = raw.indexOf(`// #region ${id}\n`);
  if (start < 0) return `// region "${id}" not found`;
  const bodyStart = start + `// #region ${id}\n`.length;
  const end = raw.indexOf('// #endregion', bodyStart);
  const body = raw
    .slice(bodyStart, end)
    .replace(/^export function /m, 'export default function ')
    .trimEnd();
  const imports: string[] = [];
  for (const m of raw.matchAll(/^import (type )?\{([^}]+)\} from '([^']+)';$/gm)) {
    const [, typeOnly, names, from] = m;
    if (from.startsWith('.') || from.endsWith('?raw')) continue;
    const used = names
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)
      .filter((n) =>
        new RegExp(
          `\\b${n
            .replace(/^type /, '')
            .split(' as ')
            .pop()}\\b`,
        ).test(body),
      );
    if (used.length) imports.push(`import ${typeOnly ?? ''}{ ${used.join(', ')} } from '${from}';`);
  }
  return `${imports.join('\n')}${imports.length ? '\n\n' : ''}${body}\n`;
}

const ORDER: [string, string][] = [
  ['playground', 'Playground'],
  ['examples', 'Examples'],
  ['keyboard', 'Keyboard'],
  ['accessibility', 'Accessibility'],
  ['props', 'Props'],
];

export type DocComponent = ComponentType & { spec: DocSpec };

export function defineDoc(spec: DocSpec): DocComponent {
  const examples = spec.examples.map((e) => ({ ...e, code: snippet(spec.raw, e.id) }));
  const tables = !spec.props
    ? []
    : 'title' in (spec.props[0] ?? {})
      ? (spec.props as { title: string; rows: PropRow[] }[])
      : [{ title: '', rows: spec.props as PropRow[] }];
  const toc = [
    ...ORDER.filter(([id]) =>
      id === 'playground'
        ? spec.playground
        : id === 'keyboard'
          ? spec.keyboard
          : id === 'accessibility'
            ? spec.a11y
            : id === 'props'
              ? tables.length
              : true,
    ),
    ...(spec.extra ?? []).map((x) => [x.id, x.title] as [string, string]),
  ];

  function DocPage() {
    return (
      <div className="doc">
        <div className="page-head">
          <div>
            <div className="chips" style={{ marginBottom: 10 }}>
              {spec.status === 'new' && <Badge tone="ok">New</Badge>}
              {spec.status === 'updated' && <Badge tone="info">Updated</Badge>}
              <Badge>{spec.group}</Badge>
            </div>
            <h1>{spec.name}</h1>
            <p>{spec.description}</p>
            <code className="doc-import">
              import {'{'} {(spec.imports ?? [spec.name]).join(', ')} {'}'} from &apos;{spec.importFrom ?? '@/components/kit'}&apos;;
            </code>
          </div>
        </div>
        <nav className="doc-toc" aria-label="On this page">
          {toc.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        {spec.playground && (
          <DocSection id="playground" title="Playground">
            <Playground spec={spec.playground} name={spec.name} />
          </DocSection>
        )}
        <DocSection id="examples" title="Examples">
          <div className="ex-list">
            {examples.map((e) => (
              <ExampleBlock key={e.id} example={e} />
            ))}
          </div>
        </DocSection>
        {spec.keyboard && (
          <DocSection id="keyboard" title="Keyboard">
            <div className="card table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {spec.keyboard.map(([k, a]) => (
                    <tr key={k}>
                      <td>
                        <Kbd keys={k.split(' + ')} />
                      </td>
                      <td>{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DocSection>
        )}
        {spec.a11y && (
          <DocSection id="accessibility" title="Accessibility">
            <ul className="doc-list">
              {spec.a11y.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </DocSection>
        )}
        {tables.length > 0 && (
          <DocSection id="props" title="Props">
            <div className="ex-list">
              {tables.map((t) => (
                <div key={t.title}>
                  {t.title && <h3 className="doc-subhead mono">{t.title}</h3>}
                  <PropsTable rows={t.rows} />
                </div>
              ))}
            </div>
          </DocSection>
        )}
        {spec.extra?.map((x) => (
          <DocSection key={x.id} id={x.id} title={x.title}>
            {x.content}
          </DocSection>
        ))}
      </div>
    );
  }
  DocPage.displayName = `${spec.name}Doc`;
  DocPage.spec = spec;
  return DocPage;
}
