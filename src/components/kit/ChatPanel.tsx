import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, ArrowDown, Check, CheckCheck, Clock3, Paperclip, Send } from 'lucide-react';
import { Avatar } from './Avatar';
import { MentionInput, type MentionPerson } from './MentionInput';
import { cx } from './utils';

/* ── ChatPanel: a conversation with grouped messages, day breaks, mentions, typing and a composer ── */

export interface ChatAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  author: ChatAuthor;
  text: string;
  /** ISO date-time. */
  at: string;
  /** Your own messages: sending, sent, read or failed. */
  status?: 'sending' | 'sent' | 'read' | 'failed';
  /** Files under the text. */
  attachments?: { name: string; size?: string; href?: string }[];
}

export interface ChatPanelProps {
  messages: ChatMessage[];
  /** Your id: your messages sit on the right. */
  me: string;
  /** People who can be @mentioned. */
  people?: MentionPerson[];
  onSend?: (text: string, mentioned: MentionPerson[]) => void;
  /** Names of people typing right now. */
  typing?: string[];
  /** Shown above the messages (title, people, actions). */
  header?: ReactNode;
  /** Load earlier messages when scrolled to the top. */
  onLoadOlder?: () => void;
  hasOlder?: boolean;
  placeholder?: string;
  /** Shown when there are no messages. */
  empty?: ReactNode;
  'aria-label'?: string;
  className?: string;
}

const GROUP_MS = 5 * 60_000;
const dayKey = (iso: string) => new Date(iso).toDateString();
const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
};
const time = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

/** Text with @mentions and links marked up; everything else stays plain text. */
function RichText({ text, people }: { text: string; people: MentionPerson[] }) {
  const names = people.map((p) => p.name).sort((a, b) => b.length - a.length);
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${names.length ? `@(?:${names.map(esc).join('|')})|` : ''}https?://[^\\s]+)`, 'g');
  return (
    <>
      {text.split(re).map((part, i) =>
        part.startsWith('@') && names.includes(part.slice(1)) ? (
          <span key={i} className="chat-mention">
            {part}
          </span>
        ) : /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noreferrer noopener">
            {part}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function ChatPanel({
  messages,
  me,
  people = [],
  onSend,
  typing = [],
  header,
  onLoadOlder,
  hasOlder,
  placeholder,
  empty,
  'aria-label': label = 'Conversation',
  className,
}: ChatPanelProps) {
  const [draft, setDraft] = useState('');
  const scroller = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const [unseen, setUnseen] = useState(0);
  const lastCount = useRef(messages.length);
  const firstId = useRef(messages[0]?.id);
  const prevHeight = useRef(0);
  const lastIdRef = useRef(messages[messages.length - 1]?.id);

  // Group: a new block when the author changes or more than 5 minutes pass.
  const rows = useMemo(
    () =>
      messages.map((m, i) => {
        const prev = messages[i - 1];
        const newDay = !prev || dayKey(prev.at) !== dayKey(m.at);
        const grouped = !!prev && !newDay && prev.author.id === m.author.id && Date.parse(m.at) - Date.parse(prev.at) < GROUP_MS;
        return { m, newDay, grouped };
      }),
    [messages],
  );

  // Keep the view pinned to the bottom when you're there; otherwise count what arrived.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const added = messages.length - lastCount.current;
    const lastId = messages[messages.length - 1]?.id;
    const olderLoaded = added > 0 && messages[0]?.id !== firstId.current && lastId === lastIdRef.current;
    lastIdRef.current = lastId;
    if (olderLoaded) {
      // Older messages went on top: keep what you were reading in place.
      el.scrollTop = el.scrollHeight - prevHeight.current;
    } else if (added > 0) {
      const mine = messages[messages.length - 1]?.author.id === me;
      if (nearBottom.current || mine) el.scrollTop = el.scrollHeight;
      else setUnseen((u) => u + added);
    }
    lastCount.current = messages.length;
    firstId.current = messages[0]?.id;
    prevHeight.current = el.scrollHeight;
  }, [messages, me]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const onScroll = () => {
    const el = scroller.current!;
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom.current) setUnseen(0);
    prevHeight.current = el.scrollHeight;
    if (el.scrollTop < 40 && hasOlder) onLoadOlder?.();
  };

  const send = (text: string, mentioned: MentionPerson[]) => {
    if (!text.trim()) return;
    onSend?.(text.trim(), mentioned);
    setDraft('');
  };

  return (
    <section className={cx('chat', className)} aria-label={label}>
      {header && <div className="chat-header">{header}</div>}
      <div
        className="chat-scroll"
        ref={scroller}
        onScroll={onScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        tabIndex={0}
        aria-label="Messages"
      >
        {hasOlder && (
          <div className="chat-older">
            <button type="button" className="btn btn-sm btn-ghost" onClick={onLoadOlder}>
              Load earlier messages
            </button>
          </div>
        )}
        {messages.length === 0 && <div className="chat-empty">{empty ?? 'No messages yet. Say hello!'}</div>}
        {rows.map(({ m, newDay, grouped }) => {
          const mine = m.author.id === me;
          return (
            <Fragment key={m.id}>
              {newDay && (
                <div className="chat-day" role="separator">
                  <span>{dayLabel(m.at)}</span>
                </div>
              )}
              <div className={cx('chat-msg', mine && 'is-mine', grouped && 'is-grouped', m.status === 'failed' && 'is-failed')}>
                {!mine && (
                  <span className="chat-avatar">{!grouped && <Avatar name={m.author.name} src={m.author.avatar} size="sm" />}</span>
                )}
                <div className="chat-body">
                  {!grouped && (
                    <div className="chat-meta">
                      {!mine && <b>{m.author.name}</b>}
                      <time dateTime={m.at}>{time(m.at)}</time>
                    </div>
                  )}
                  <div className="chat-bubble">
                    <span className="chat-text">
                      {grouped && <span className="sr-only">{`${m.author.name}, ${time(m.at)}: `}</span>}
                      <RichText text={m.text} people={people} />
                    </span>
                    {m.attachments?.map((a) => (
                      <a key={a.name} className="chat-file" href={a.href ?? '#'} download>
                        <Paperclip size={14} aria-hidden="true" /> {a.name} {a.size && <span>{a.size}</span>}
                      </a>
                    ))}
                  </div>
                  {mine && m.status && (
                    <span className="chat-status">
                      {m.status === 'sending' && (
                        <>
                          <Clock3 size={12} aria-hidden="true" /> Sending
                        </>
                      )}
                      {m.status === 'sent' && (
                        <>
                          <Check size={12} aria-hidden="true" /> Sent
                        </>
                      )}
                      {m.status === 'read' && (
                        <>
                          <CheckCheck size={12} aria-hidden="true" /> Read
                        </>
                      )}
                      {m.status === 'failed' && (
                        <>
                          <AlertCircle size={12} aria-hidden="true" /> Not sent
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </Fragment>
          );
        })}
        {typing.length > 0 && (
          <div className="chat-typing" aria-live="off">
            <span className="chat-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {typing.length === 1
              ? `${typing[0]} is typing…`
              : `${typing.slice(0, -1).join(', ')} and ${typing[typing.length - 1]} are typing…`}
          </div>
        )}
      </div>
      {unseen > 0 && (
        <button
          type="button"
          className="chat-jump"
          onClick={() => {
            const el = scroller.current!;
            el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
            setUnseen(0);
          }}
        >
          <ArrowDown size={14} /> {unseen} new {unseen === 1 ? 'message' : 'messages'}
        </button>
      )}
      {onSend && (
        <div className="chat-composer">
          <MentionInput
            value={draft}
            onChange={setDraft}
            people={people}
            submitOnEnter
            onSubmit={send}
            placeholder={placeholder}
            aria-label="Message"
            trailing={
              <button
                type="button"
                className="btn btn-primary btn-icon btn-sm"
                aria-label="Send"
                disabled={!draft.trim()}
                onClick={() =>
                  send(
                    draft,
                    people.filter((p) => draft.includes(`@${p.name}`)),
                  )
                }
              >
                <Send size={15} className="flip-rtl" />
              </button>
            }
          />
          <p className="chat-hint">Enter to send · Shift+Enter for a new line · @ to mention</p>
        </div>
      )}
    </section>
  );
}
