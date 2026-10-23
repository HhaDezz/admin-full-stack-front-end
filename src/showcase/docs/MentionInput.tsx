import { useState } from 'react';
import { MentionInput, mentionedIn, type MentionPerson } from '@/components/kit';
import { defineDoc } from '../doc';
import raw from './MentionInput.tsx?raw';

const TEAM: MentionPerson[] = [
  { id: 'u1', name: 'Amara Perera', description: 'Design' },
  { id: 'u2', name: 'Kasun Silva', description: 'Engineering' },
  { id: 'u3', name: 'Nadia Fernando', description: 'Support' },
  { id: 'u4', name: 'Oliver Grant', description: 'Sales' },
];

// #region comment
export function Comment() {
  const [text, setText] = useState('Thanks @Kasun Silva, can you look at this? ');
  const people = mentionedIn(text, TEAM);
  return (
    <div style={{ width: 'min(460px, 100%)', paddingTop: 120 }}>
      <MentionInput value={text} onChange={setText} people={TEAM} minRows={3} aria-label="Comment" />
      <p className="muted" style={{ fontSize: 13 }}>
        Will notify: {people.length ? people.map((p) => p.name).join(', ') : 'nobody yet'}
      </p>
    </div>
  );
}
// #endregion

// #region send
export function Send() {
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div style={{ width: 'min(460px, 100%)', paddingTop: 120 }}>
      <ul style={{ margin: '0 0 8px', paddingInlineStart: 18, fontSize: 14 }}>
        {sent.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <MentionInput
        value={text}
        onChange={setText}
        people={TEAM}
        submitOnEnter
        onSubmit={(v) => {
          setSent((s) => [...s, v]);
          setText('');
        }}
        placeholder="Type a message and press Enter"
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'MentionInput',
  group: 'Form inputs',
  status: 'new',
  description:
    'A text box that grows as you type, where @ suggests people to mention. Arrow keys pick, Enter or Tab inserts the name, and mentionedIn() tells you who to notify.',
  imports: ['MentionInput', 'mentionedIn', 'type MentionPerson'],
  raw,
  examples: [
    {
      id: 'comment',
      title: 'Comment box',
      description: 'Type @ and a few letters of a name. The list matches any word in the name.',
      Component: Comment,
    },
    {
      id: 'send',
      title: 'Enter to send',
      description: 'submitOnEnter sends on Enter; Shift+Enter adds a line. Enter picks a person while the list is open.',
      Component: Send,
    },
  ],
  keyboard: [
    ['@', 'Start a mention'],
    ['Down / Up', 'Move through the matches'],
    ['Enter / Tab', 'Insert the highlighted person'],
    ['Escape', 'Close the list and keep typing'],
    ['Enter (submitOnEnter)', 'Send; Shift+Enter for a new line'],
  ],
  a11y: [
    'While the list is open, aria-controls and aria-activedescendant point at it, so screen readers read the highlighted person, and a status message says how many people match.',
    'The list is a listbox of options with aria-selected; focus never leaves the text box.',
    'Typing in an IME (e.g. Japanese) doesn’t send early: Enter during composition is ignored.',
  ],
  props: [
    { name: 'value / onChange', type: 'string', description: 'The text.' },
    { name: 'people', type: 'MentionPerson[]', description: '{ id, name, description?, avatar? }' },
    { name: 'onSubmit', type: '(value, mentioned) => void', description: 'With submitOnEnter.' },
    { name: 'submitOnEnter', type: 'boolean', defaultValue: 'false', description: 'Enter sends.' },
    { name: 'minRows / maxRows', type: 'number', defaultValue: '1 / 8', description: 'How far it grows.' },
    { name: 'trailing', type: 'ReactNode', description: 'Inside the box at the end, e.g. a send button.' },
    { name: 'placeholder / disabled / id / aria-label', type: '…', description: 'Passed to the text box.' },
  ],
});
