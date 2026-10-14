import { useEffect, useId, useMemo, useState } from 'react';
import { Check, Copy, WrapText } from 'lucide-react';
import { highlight, normaliseLang } from './_highlight';
import { cx } from './utils';

/* ── CodeBlock: highlighted code with a copy button, file tabs, line numbers and marked lines ── */

export interface CodeFile {
  name: string;
  code: string;
  /** tsx, ts, js, jsx, json, css, html, bash, java, sql, yaml, properties or text. */
  lang?: string;
}

export interface CodeBlockProps {
  code?: string;
  lang?: string;
  /** Shown above the code. */
  filename?: string;
  /** Several files as tabs (instead of code). */
  files?: CodeFile[];
  showLineNumbers?: boolean;
  /** Lines to mark, counting from 1, e.g. [3, 4, 5]. */
  highlightLines?: number[];
  /** Taller code scrolls inside the block. */
  maxHeight?: number;
  /** Start with long lines wrapped (there's a button to switch). */
  wrap?: boolean;
  copyable?: boolean;
  className?: string;
}

export function CodeBlock({
  code = '',
  lang = 'tsx',
  filename,
  files,
  showLineNumbers,
  highlightLines,
  maxHeight = 480,
  wrap: wrapDefault = false,
  copyable = true,
  className,
}: CodeBlockProps) {
  const list = useMemo<CodeFile[]>(() => files ?? [{ name: filename ?? '', code, lang }], [files, filename, code, lang]);
  const [tab, setTab] = useState(0);
  const file = list[Math.min(tab, list.length - 1)];
  const text = file.code.replace(/\n$/, '');
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(wrapDefault);
  const id = useId();

  useEffect(() => {
    let live = true;
    setHtml(null);
    highlight(text, file.lang ?? lang)
      .then((h) => live && setHtml(h))
      .catch(() => live && setHtml(null));
    return () => {
      live = false;
    };
  }, [text, file.lang, lang]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the code is still selectable */
    }
  };

  // Line numbers and marks are added around Shiki's lines with CSS counters and a data attribute.
  const marked = useMemo(() => new Set(highlightLines ?? []), [highlightLines]);
  const decorate = (h: string) => {
    // The scroll box is the tab stop, not Shiki's <pre>.
    h = h.replace(' tabindex="0"', '');
    return marked.size
      ? h.replace(
          /<span class="line">/g,
          (() => {
            let n = 0;
            return () => `<span class="line${marked.has(++n) ? ' is-marked' : ''}">`;
          })(),
        )
      : h;
  };

  const hasHead = list.length > 1 || !!list[0].name;
  return (
    <figure className={cx('codeblock', showLineNumbers && 'has-numbers', wrap && 'is-wrapped', className)} dir="ltr">
      {hasHead && (
        <div className="codeblock-head">
          {list.length > 1 ? (
            <div role="tablist" aria-label="Files" className="codeblock-tabs">
              {list.map((f, i) => (
                <button
                  key={f.name}
                  role="tab"
                  id={`${id}-t${i}`}
                  aria-selected={i === tab}
                  aria-controls={`${id}-p`}
                  tabIndex={i === tab ? 0 : -1}
                  onClick={() => setTab(i)}
                  onKeyDown={(e) => {
                    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                    if (!d) return;
                    e.preventDefault();
                    const next = (tab + d + list.length) % list.length;
                    setTab(next);
                    (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          ) : (
            <figcaption className="codeblock-name">{list[0].name}</figcaption>
          )}
          <span className="codeblock-lang">{normaliseLang(file.lang ?? lang)}</span>
        </div>
      )}
      <div className="codeblock-tools">
        <button
          type="button"
          className="codeblock-btn"
          aria-pressed={wrap}
          aria-label="Wrap long lines"
          title="Wrap long lines"
          onClick={() => setWrap(!wrap)}
        >
          <WrapText size={14} />
        </button>
        {copyable && (
          <button type="button" className="codeblock-btn" aria-label={copied ? 'Copied' : 'Copy code'} onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>
      <div
        className="codeblock-body"
        id={`${id}-p`}
        role={list.length > 1 ? 'tabpanel' : undefined}
        aria-labelledby={list.length > 1 ? `${id}-t${tab}` : undefined}
        style={{ maxHeight }}
        tabIndex={0}
      >
        {html ? (
          <div className="codeblock-html" dangerouslySetInnerHTML={{ __html: decorate(html) }} />
        ) : (
          <pre className="codeblock-plain">
            <code>
              {text.split('\n').map((line, i) => (
                <span key={i} className={cx('line', marked.has(i + 1) && 'is-marked')}>
                  {line}
                  {'\n'}
                </span>
              ))}
            </code>
          </pre>
        )}
      </div>
    </figure>
  );
}
