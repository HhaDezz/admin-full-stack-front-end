import { useEffect, useRef, useState } from 'react';
import { Phone, Video } from 'lucide-react';
import { Avatar, ChatPanel, IconButton, type ChatMessage, type MentionPerson } from '@/components/kit';
import { defineDoc } from '../doc';
import raw from './ChatPanel.tsx?raw';

// #region conversation
const ME = { id: 'me', name: 'You' };
const AMARA = { id: 'u1', name: 'Amara Perera' };
const KASUN = { id: 'u2', name: 'Kasun Silva' };
const PEOPLE: MentionPerson[] = [
  { ...AMARA, description: 'Design' },
  { ...KASUN, description: 'Engineering' },
];
const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

const START: ChatMessage[] = [
  { id: 'm1', author: AMARA, text: 'Morning! The lookbook photos are in the shared folder.', at: ago(60 * 26) },
  {
    id: 'm2',
    author: AMARA,
    text: 'Cover options are on page 3.',
    at: ago(60 * 26 - 1),
    attachments: [{ name: 'lookbook-v2.pdf', size: '4.2 MB' }],
  },
  { id: 'm3', author: ME, text: 'Great, I’ll pick one after lunch.', at: ago(60 * 25), status: 'read' },
  { id: 'm4', author: KASUN, text: '@Amara Perera can you export them at 2x for the site? https://example.com/specs', at: ago(14) },
  { id: 'm5', author: ME, text: 'I like the second cover best.', at: ago(3), status: 'read' },
];

export function Conversation() {
  const [messages, setMessages] = useState(START);
  const [typing, setTyping] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const send = (text: string) => {
    const id = `m${Date.now()}`;
    setMessages((m) => [...m, { id, author: ME, text, at: new Date().toISOString(), status: 'sending' }]);
    timer.current = setTimeout(() => {
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, status: 'sent' } : x)));
      setTyping(['Amara Perera']);
      timer.current = setTimeout(() => {
        setTyping([]);
        setMessages((m) => [...m, { id: `r${Date.now()}`, author: AMARA, text: 'Sounds good 👍', at: new Date().toISOString() }]);
      }, 1600);
    }, 500);
  };

  return (
    <div style={{ height: 480, width: 'min(560px, 100%)' }}>
      <ChatPanel
        messages={messages}
        me={ME.id}
        people={PEOPLE}
        typing={typing}
        onSend={send}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name="Spring launch" shape="square" size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ display: 'block' }}>Spring launch</b>
              <span className="muted" style={{ fontSize: 12 }}>
                3 people
              </span>
            </div>
            <IconButton label="Call" icon={<Phone size={16} />} variant="ghost" />
            <IconButton label="Video call" icon={<Video size={16} />} variant="ghost" />
          </div>
        }
      />
    </div>
  );
}
// #endregion

export default defineDoc({
  name: 'ChatPanel',
  group: 'Apps & advanced',
  status: 'new',
  description:
    'A conversation: messages grouped by person and day, @mentions and links, files, typing dots, sent and read ticks, a “new messages” button when you’ve scrolled up, and a composer with mentions.',
  imports: ['ChatPanel', 'type ChatMessage', 'type MentionPerson'],
  raw,
  examples: [
    {
      id: 'conversation',
      title: 'Group conversation',
      description: 'Send a message: it shows “Sending”, then “Sent”, then Amara types a reply. Type @ to mention someone.',
      Component: Conversation,
    },
  ],
  keyboard: [
    ['Enter', 'Send'],
    ['Shift+Enter', 'New line'],
    ['@', 'Mention someone (Up / Down, Enter)'],
    ['Tab', 'From the message list (it scrolls with the arrow keys) to the composer'],
  ],
  a11y: [
    'The message list is a log (a polite live region), so new messages are read out as they arrive.',
    'Grouped messages still carry the sender and time for screen readers; ticks have words (“Read”), not only icons.',
    'Typing dots are not announced, so they don’t interrupt.',
    'The list stays pinned to the newest message unless you’ve scrolled up; then a button counts what arrived.',
  ],
  props: [
    { name: 'messages', type: 'ChatMessage[]', description: '{ id, author, text, at, status?, attachments? } in time order.' },
    { name: 'me', type: 'string', description: 'Your id: your messages sit on the right.' },
    { name: 'people', type: 'MentionPerson[]', description: 'Who can be mentioned (and highlighted).' },
    { name: 'onSend', type: '(text, mentioned) => void', description: 'Shows the composer.' },
    { name: 'typing', type: 'string[]', description: 'Names typing now.' },
    { name: 'header', type: 'ReactNode', description: 'Above the messages.' },
    { name: 'hasOlder / onLoadOlder', type: 'boolean / () => void', description: 'Load earlier messages at the top; the view stays put.' },
    { name: 'placeholder / empty / aria-label', type: '…', description: 'Composer hint, empty text, region name.' },
  ],
});
