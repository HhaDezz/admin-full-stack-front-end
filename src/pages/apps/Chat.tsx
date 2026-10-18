import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BellOff, Phone, Search, Video } from 'lucide-react';
import { Avatar, AvatarGroup, ChatPanel, IconButton, Input, PageHeader, type ChatMessage } from '../../components/kit';
import { cx } from '../../components/kit/utils';
import { CONVERSATIONS, ME, MESSAGES, person, REPLIES, TEAM, type Msg } from './data';
import { SampleBadge } from './shared';

/* Chat: conversations on the left, the open one on the right (one at a time on phones).
 * Sending shows Sending → Sent → Read, then someone in the conversation types a reply. */

const timeShort = (iso: string) => {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function Chat() {
  const [convs, setConvs] = useState(CONVERSATIONS);
  const [msgs, setMsgs] = useState<(Msg & { status?: ChatMessage['status'] })[]>(MESSAGES);
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [typing, setTyping] = useState<Record<string, string[]>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));

  // On wide screens the first conversation is open from the start.
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 861px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 861px)');
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const activeId = openId ?? (wide ? convs[0].id : null);
  const active = convs.find((c) => c.id === activeId);

  const lastOf = (id: string) => msgs.filter((m) => m.conv === id).at(-1);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return convs
      .filter((c) => !q || c.name.toLowerCase().includes(q) || msgs.some((m) => m.conv === c.id && m.text.toLowerCase().includes(q)))
      .sort((a, b) => Date.parse(lastOf(b.id)?.at ?? '0') - Date.parse(lastOf(a.id)?.at ?? '0'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convs, msgs, query]);

  const open = (id: string) => {
    setOpenId(id);
    setConvs((l) => l.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };
  useEffect(() => {
    if (activeId)
      setConvs((l) => (l.find((c) => c.id === activeId)?.unread ? l.map((c) => (c.id === activeId ? { ...c, unread: 0 } : c)) : l));
  }, [activeId]);

  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const send = (text: string) => {
    if (!active) return;
    const id = `m${Date.now()}`;
    const conv = active.id;
    const setStatus = (status: ChatMessage['status']) => setMsgs((l) => l.map((m) => (m.id === id ? { ...m, status } : m)));
    setMsgs((l) => [...l, { id, conv, author: 'me', text, at: new Date().toISOString(), status: 'sending' }]);
    later(450, () => setStatus('sent'));
    const replier = person(active.members[Math.floor(Math.random() * active.members.length)]);
    later(1300, () => {
      setStatus('read');
      setTyping((t) => ({ ...t, [conv]: [replier.name] }));
    });
    later(3000, () => {
      setTyping((t) => ({ ...t, [conv]: [] }));
      setMsgs((l) => [
        ...l,
        {
          id: `r${Date.now()}`,
          conv,
          author: replier.id,
          text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
          at: new Date().toISOString(),
        },
      ]);
      setConvs((l) => l.map((c) => (c.id === conv && c.id !== activeIdRef.current ? { ...c, unread: c.unread + 1 } : c)));
    });
  };
  const messages: ChatMessage[] = useMemo(
    () =>
      msgs
        .filter((m) => m.conv === activeId)
        .map((m) => {
          const p = m.author === 'me' ? ME : person(m.author);
          return {
            id: m.id,
            author: { id: p.id, name: p.name },
            text: m.text,
            at: m.at,
            attachments: m.attachments,
            status: m.author === 'me' ? (m.status ?? 'read') : undefined,
          };
        }),
    [msgs, activeId],
  );

  return (
    <>
      <PageHeader title="Chat" description="Team conversations." actions={<SampleBadge />} />
      <div className={cx('chat-app', activeId && 'has-open')}>
        <aside className="card chat-list" aria-label="Conversations">
          <div className="chat-list-search">
            <Input
              size="sm"
              aria-label="Search conversations"
              placeholder="Search"
              prefix={<Search size={15} />}
              clearable
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul>
            {list.map((c) => {
              const last = lastOf(c.id);
              const people = c.members.map((id) => person(id));
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    className={cx('chat-conv', c.id === activeId && 'is-active', c.unread > 0 && 'is-unread')}
                    aria-current={c.id === activeId || undefined}
                    onClick={() => open(c.id)}
                  >
                    {c.group ? (
                      <Avatar name={c.name} shape="square" size="md" />
                    ) : (
                      <Avatar name={c.name} size="md" status={people[0].online ? 'online' : 'offline'} />
                    )}
                    <span className="chat-conv-text">
                      <span className="chat-conv-top">
                        <b>{c.name}</b>
                        {c.muted && <BellOff size={12} aria-label="Muted" />}
                        {last && <time dateTime={last.at}>{timeShort(last.at)}</time>}
                      </span>
                      <span className="chat-conv-last">
                        {last
                          ? `${last.author === 'me' ? 'You: ' : c.group ? `${person(last.author).name.split(' ')[0]}: ` : ''}${last.text}`
                          : 'No messages yet'}
                      </span>
                    </span>
                    {c.unread > 0 && (
                      <span className="chat-conv-badge">
                        {c.unread}
                        <span className="sr-only"> unread</span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
            {list.length === 0 && <li className="muted chat-list-empty">No conversations match “{query}”.</li>}
          </ul>
        </aside>
        {active ? (
          <ChatPanel
            key={active.id}
            className="chat-main"
            aria-label={active.name}
            messages={messages}
            me={ME.id}
            people={active.members.map((id) => ({ id, name: person(id).name, description: person(id).role }))}
            typing={typing[active.id] ?? []}
            onSend={send}
            placeholder={`Message ${active.name}`}
            header={
              <div className="chat-head">
                <IconButton
                  className="chat-back"
                  label="All conversations"
                  icon={<ArrowLeft size={18} className="flip-rtl" />}
                  variant="ghost"
                  onClick={() => setOpenId(null)}
                />
                {active.group ? (
                  <AvatarGroup people={active.members.map((id) => ({ name: person(id).name }))} size="sm" max={3} />
                ) : (
                  <Avatar name={active.name} size="sm" />
                )}
                <span className="chat-head-text">
                  <b>{active.name}</b>
                  <small className="muted">
                    {active.group
                      ? `${active.members.length + 1} people`
                      : TEAM.find((p) => p.id === active.members[0])?.online
                        ? 'Online'
                        : 'Offline'}
                  </small>
                </span>
                <IconButton label="Start a call" icon={<Phone size={16} />} variant="ghost" />
                <IconButton label="Start a video call" icon={<Video size={16} />} variant="ghost" />
              </div>
            }
          />
        ) : (
          <div className="card chat-main chat-none">Pick a conversation</div>
        )}
      </div>
    </>
  );
}
