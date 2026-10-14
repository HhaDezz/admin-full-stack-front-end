import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  SquareCode,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
} from 'lucide-react';
import { DEFAULT_TOOLS, type RichTextEditorProps, type RichTextTool } from './RichTextEditor';
import { cx } from './utils';

type Control = {
  id?: string;
  disabled?: boolean;
  required?: boolean;
  invalid: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
};

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? '⌘' : 'Ctrl+';

const TOOL: Record<
  RichTextTool,
  { label: string; keys?: string; icon: ReactNode; run: (e: Editor) => void; active?: (e: Editor) => boolean; can?: (e: Editor) => boolean }
> = {
  bold: {
    label: 'Bold',
    keys: `${mod}B`,
    icon: <Bold size={16} />,
    run: (e) => e.chain().focus().toggleBold().run(),
    active: (e) => e.isActive('bold'),
  },
  italic: {
    label: 'Italic',
    keys: `${mod}I`,
    icon: <Italic size={16} />,
    run: (e) => e.chain().focus().toggleItalic().run(),
    active: (e) => e.isActive('italic'),
  },
  underline: {
    label: 'Underline',
    keys: `${mod}U`,
    icon: <Underline size={16} />,
    run: (e) => e.chain().focus().toggleUnderline().run(),
    active: (e) => e.isActive('underline'),
  },
  strike: {
    label: 'Strikethrough',
    icon: <Strikethrough size={16} />,
    run: (e) => e.chain().focus().toggleStrike().run(),
    active: (e) => e.isActive('strike'),
  },
  code: {
    label: 'Inline code',
    keys: `${mod}E`,
    icon: <Code size={16} />,
    run: (e) => e.chain().focus().toggleCode().run(),
    active: (e) => e.isActive('code'),
  },
  h2: {
    label: 'Heading',
    icon: <Heading2 size={16} />,
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    active: (e) => e.isActive('heading', { level: 2 }),
  },
  h3: {
    label: 'Subheading',
    icon: <Heading3 size={16} />,
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    active: (e) => e.isActive('heading', { level: 3 }),
  },
  bulletList: {
    label: 'Bulleted list',
    icon: <List size={16} />,
    run: (e) => e.chain().focus().toggleBulletList().run(),
    active: (e) => e.isActive('bulletList'),
  },
  orderedList: {
    label: 'Numbered list',
    icon: <ListOrdered size={16} />,
    run: (e) => e.chain().focus().toggleOrderedList().run(),
    active: (e) => e.isActive('orderedList'),
  },
  blockquote: {
    label: 'Quote',
    icon: <Quote size={16} />,
    run: (e) => e.chain().focus().toggleBlockquote().run(),
    active: (e) => e.isActive('blockquote'),
  },
  codeBlock: {
    label: 'Code block',
    icon: <SquareCode size={16} />,
    run: (e) => e.chain().focus().toggleCodeBlock().run(),
    active: (e) => e.isActive('codeBlock'),
  },
  link: { label: 'Link', keys: `${mod}K`, icon: <Link2 size={16} />, run: () => undefined, active: (e) => e.isActive('link') },
  undo: {
    label: 'Undo',
    keys: `${mod}Z`,
    icon: <Undo2 size={16} className="flip-rtl" />,
    run: (e) => e.chain().focus().undo().run(),
    can: (e) => e.can().undo(),
  },
  redo: {
    label: 'Redo',
    keys: isMac ? '⇧⌘Z' : 'Ctrl+Y',
    icon: <Redo2 size={16} className="flip-rtl" />,
    run: (e) => e.chain().focus().redo().run(),
    can: (e) => e.can().redo(),
  },
};

export default function RichTextEditorImpl({
  value,
  onChange,
  placeholder = 'Write something…',
  tools = DEFAULT_TOOLS,
  minHeight,
  maxLength,
  onBlur,
  className,
  'aria-label': label,
  control: c,
  labelledBy,
}: RichTextEditorProps & { control: Control; labelledBy?: string }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [href, setHref] = useState('');
  const linkInput = useRef<HTMLInputElement>(null);
  const changeRef = useRef(onChange);
  changeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, defaultProtocol: 'https' } }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: value,
    editable: !c.disabled,
    immediatelyRender: true,
    onUpdate: ({ editor }) => changeRef.current(editor.isEmpty ? '' : editor.getHTML()),
    onBlur: () => onBlur?.(),
    editorProps: {
      attributes: {
        class: 'rte-content',
        role: 'textbox',
        'aria-multiline': 'true',
        ...(label ? { 'aria-label': label } : {}),
        ...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
        ...(c.id ? { id: c.id } : {}),
        ...(c['aria-describedby'] ? { 'aria-describedby': c['aria-describedby'] } : {}),
        ...(c.invalid ? { 'aria-invalid': 'true' } : {}),
        ...(c.required ? { 'aria-required': 'true' } : {}),
        style: `min-height:${minHeight}px`,
      },
      handleKeyDown: (_view, e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          openLink();
          return true;
        }
        return false;
      },
    },
  });

  // Outside changes (a reset, loaded data) replace the content without firing onChange.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const cur = editor.isEmpty ? '' : editor.getHTML();
    if (value !== cur) editor.commands.setContent(value || '', { emitUpdate: false });
  }, [value, editor]);
  useEffect(() => {
    if (editor && !editor.isDestroyed) editor.setEditable(!c.disabled);
  }, [editor, c.disabled]);

  // Clicking the Field's label focuses the editor, like it would an input.
  useEffect(() => {
    const el = labelledBy ? document.getElementById(labelledBy) : null;
    if (!el || !editor) return;
    const focus = () => editor.commands.focus();
    el.addEventListener('click', focus);
    return () => el.removeEventListener('click', focus);
  }, [labelledBy, editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e && !e.isDestroyed
        ? {
            active: Object.fromEntries((Object.keys(TOOL) as RichTextTool[]).map((k) => [k, TOOL[k].active?.(e) ?? false])),
            can: { undo: e.can().undo(), redo: e.can().redo() },
            chars: e.storage.characterCount?.characters?.() ?? 0,
          }
        : null,
  });

  function openLink() {
    if (!editor) return;
    setHref(editor.getAttributes('link').href ?? '');
    setLinkOpen(true);
    requestAnimationFrame(() => linkInput.current?.focus());
  }
  const applyLink = () => {
    if (!editor) return;
    const url = href.trim();
    if (!url) editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: /^(https?:|mailto:|\/|#)/.test(url) ? url : `https://${url}` })
        .run();
    setLinkOpen(false);
  };

  // Toolbar: one tab stop, arrow keys move between buttons.
  const bar = useRef<HTMLDivElement>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const onBarKey = (e: KeyboardEvent) => {
    const btns = [...(bar.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])];
    const i = btns.indexOf(document.activeElement as HTMLButtonElement);
    const rtl = document.documentElement.dir === 'rtl';
    let n = -1;
    if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) n = (i + 1) % btns.length;
    else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) n = (i - 1 + btns.length) % btns.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = btns.length - 1;
    if (n < 0) return;
    e.preventDefault();
    btns[n].focus();
    setFocusIdx(n);
  };

  let btnIndex = -1;
  return (
    <div className={cx('rte', c.invalid && 'is-invalid', c.disabled && 'is-disabled', className)}>
      <div className="rte-toolbar" role="toolbar" aria-label="Formatting" ref={bar} onKeyDown={onBarKey}>
        {tools.map((t, i) => {
          if (t === '|') return <span key={i} className="rte-sep" aria-hidden="true" />;
          const tool = TOOL[t];
          btnIndex++;
          const disabled = c.disabled || (t === 'undo' && !state?.can.undo) || (t === 'redo' && !state?.can.redo);
          const pressed = tool.active ? !!state?.active[t] : undefined;
          return (
            <button
              key={t}
              type="button"
              className={cx('rte-btn', pressed && 'is-on')}
              aria-label={tool.label}
              aria-pressed={pressed}
              title={tool.keys ? `${tool.label} (${tool.keys})` : tool.label}
              disabled={disabled}
              tabIndex={btnIndex === focusIdx ? 0 : -1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => (t === 'link' ? openLink() : editor && tool.run(editor))}
            >
              {tool.icon}
            </button>
          );
        })}
      </div>
      {linkOpen && (
        <div className="rte-link">
          <input
            ref={linkInput}
            className="input input-sm"
            type="url"
            inputMode="url"
            placeholder="https://"
            aria-label="Link address"
            value={href}
            onChange={(e) => setHref(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyLink();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                setLinkOpen(false);
                editor?.commands.focus();
              }
            }}
          />
          <button type="button" className="btn btn-sm btn-primary" onClick={applyLink}>
            Apply
          </button>
          {state?.active.link && (
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => {
                editor?.chain().focus().extendMarkRange('link').unsetLink().run();
                setLinkOpen(false);
              }}
            >
              <Unlink size={14} /> Remove
            </button>
          )}
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setLinkOpen(false)}>
            Cancel
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
      {maxLength != null && (
        <div className={cx('rte-count', (state?.chars ?? 0) >= maxLength && 'is-full')} aria-live="polite">
          {state?.chars ?? 0} / {maxLength}
        </div>
      )}
    </div>
  );
}
