import { lazy, Suspense } from 'react';
import { useControlProps } from './_form';
import { useField } from './Field';
import { cx } from './utils';

/* ── RichTextEditor: formatted text (headings, lists, links, quotes, code) that saves as HTML.
 * The editor (Tiptap) loads the first time one is shown, so it costs nothing on other pages. ── */

export type RichTextTool =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'h2'
  | 'h3'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'codeBlock'
  | 'link'
  | 'undo'
  | 'redo';

export interface RichTextEditorProps {
  /** HTML. An empty editor gives ''. */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Which buttons to show, in order; '|' adds a divider. Default: all of them. */
  tools?: (RichTextTool | '|')[];
  /** Editor height before it grows, in px. */
  minHeight?: number;
  /** Most characters allowed; shows a counter. */
  maxLength?: number;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  onBlur?: () => void;
  className?: string;
}

export const DEFAULT_TOOLS: (RichTextTool | '|')[] = [
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  '|',
  'h2',
  'h3',
  '|',
  'bulletList',
  'orderedList',
  'blockquote',
  'codeBlock',
  '|',
  'link',
  '|',
  'undo',
  'redo',
];

const Impl = lazy(() => import('./_RichTextEditorImpl'));

export function RichTextEditor(props: RichTextEditorProps) {
  const c = useControlProps(props);
  // The editor isn't a form control, so a Field's <label for> can't name it: point at the label instead.
  const field = useField();
  const labelledBy = !props['aria-label'] && field ? `${field.id}-label` : undefined;
  const minHeight = props.minHeight ?? 160;
  return (
    <Suspense
      fallback={
        <div className={cx('rte is-loading', c.invalid && 'is-invalid', props.className)} aria-busy="true">
          <div className="rte-toolbar" aria-hidden="true">
            <span className="skeleton" style={{ width: 220, height: 24 }} />
          </div>
          <div className="rte-content rte-placeholder" style={{ minHeight }}>
            {props.value ? <div dangerouslySetInnerHTML={{ __html: props.value }} /> : <p>{props.placeholder}</p>}
          </div>
        </div>
      }
    >
      <Impl {...props} minHeight={minHeight} control={c} labelledBy={labelledBy} />
    </Suspense>
  );
}
