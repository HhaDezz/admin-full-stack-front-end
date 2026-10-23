import { useState } from 'react';
import { Button, Field, RichTextEditor } from '@/components/kit';
import { defineDoc } from '../doc';
import raw from './RichTextEditor.tsx?raw';

// #region post
export function Post() {
  const [html, setHtml] = useState(
    '<h2>Spring drop</h2><p>The <strong>linen range</strong> lands on <em>Friday</em>. Highlights:</p><ul><li>Six new colours</li><li>Free returns for 60 days</li></ul>',
  );
  return (
    <div style={{ width: 'min(640px, 100%)', display: 'grid', gap: 10 }}>
      <Field label="Announcement">
        <RichTextEditor value={html} onChange={setHtml} />
      </Field>
      <details>
        <summary className="muted" style={{ fontSize: 13, cursor: 'pointer' }}>
          Saved HTML
        </summary>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{html}</pre>
      </details>
    </div>
  );
}
// #endregion

// #region short
export function Short() {
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');
  return (
    <form
      style={{ width: 'min(520px, 100%)', display: 'grid', gap: 10 }}
      onSubmit={(e) => {
        e.preventDefault();
        setError(html ? '' : 'Write a short note before saving.');
      }}
    >
      <Field label="Note for the customer" error={error} required>
        <RichTextEditor
          value={html}
          onChange={setHtml}
          tools={['bold', 'italic', 'link', '|', 'bulletList']}
          minHeight={90}
          maxLength={280}
          placeholder="Keep it short and friendly"
        />
      </Field>
      <div>
        <Button type="submit" size="sm">
          Save note
        </Button>
      </div>
    </form>
  );
}
// #endregion

export default defineDoc({
  name: 'RichTextEditor',
  group: 'Apps & advanced',
  status: 'new',
  description:
    'Formatted text — headings, lists, links, quotes and code — saved as HTML. Built on Tiptap and loaded the first time an editor is shown. Markdown shortcuts work as you type (“## ”, “- ”, “> ”).',
  raw,
  examples: [
    {
      id: 'post',
      title: 'Announcement',
      description: 'The full toolbar. Select text and press ⌘K (Ctrl+K) to add a link.',
      Component: Post,
    },
    {
      id: 'short',
      title: 'Short note with a limit',
      description: 'Pick the buttons with tools. maxLength stops typing at the limit and shows a counter; errors come from Field.',
      Component: Short,
    },
  ],
  keyboard: [
    ['⌘B / ⌘I / ⌘U', 'Bold, italic, underline (Ctrl on Windows and Linux)'],
    ['⌘K', 'Add or change a link'],
    ['⌘Z / ⇧⌘Z', 'Undo, redo'],
    ['## + Space, - + Space, 1. + Space, > + Space', 'Heading, bulleted list, numbered list, quote'],
    ['Tab, then Left / Right', 'Into the toolbar, then between its buttons'],
  ],
  a11y: [
    'The text area is a multi-line textbox named by its Field label, with the hint and error attached.',
    'The toolbar is one Tab stop with arrow keys between buttons; toggles use aria-pressed and show their shortcut on hover.',
    'Until the editor loads, the saved text is shown read-only in the same box, so the page doesn’t jump.',
    'Clean the HTML on the server before showing it to other people (for example with OWASP Java HTML Sanitizer).',
  ],
  props: [
    { name: 'value / onChange', type: 'string', description: 'HTML; an empty editor gives "".' },
    { name: 'tools', type: "(RichTextTool | '|')[]", description: 'Buttons in order; "|" adds a divider. Default: all.' },
    { name: 'placeholder', type: 'string', defaultValue: "'Write something…'", description: 'Shown while empty.' },
    { name: 'minHeight', type: 'number', defaultValue: '160', description: 'Height before it grows.' },
    { name: 'maxLength', type: 'number', description: 'Character limit with a counter.' },
    { name: 'disabled / invalid / required / id', type: '…', description: 'Also read from a surrounding Field.' },
    { name: 'onBlur', type: '() => void', description: 'For form libraries.' },
  ],
});
