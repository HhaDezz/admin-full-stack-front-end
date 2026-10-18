import { useMemo, useState } from 'react';
import {
  Archive,
  ArrowLeft,
  File,
  FileText,
  Forward,
  Inbox,
  MailOpen,
  Paperclip,
  PenSquare,
  Reply,
  Search,
  Send,
  Star,
  Trash2,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  EmptyState,
  Field,
  IconButton,
  Input,
  Modal,
  PageHeader,
  RichTextEditor,
  useToast,
  type BadgeTone,
} from '../../components/kit';
import { cx } from '../../components/kit/utils';
import { MAIL, type Folder, type Mail as MailT } from './data';
import { SampleBadge } from './shared';

/* Mail: folders, a message list with bulk actions, a reading pane and a compose dialog with the
 * rich text editor. On phones the list and the message take turns. */

const FOLDERS: { id: Folder; label: string; icon: React.ReactNode }[] = [
  { id: 'inbox', label: 'Inbox', icon: <Inbox size={17} /> },
  { id: 'starred', label: 'Starred', icon: <Star size={17} /> },
  { id: 'sent', label: 'Sent', icon: <Send size={17} className="flip-rtl" /> },
  { id: 'drafts', label: 'Drafts', icon: <FileText size={17} /> },
  { id: 'archive', label: 'Archive', icon: <Archive size={17} /> },
  { id: 'trash', label: 'Trash', icon: <Trash2 size={17} /> },
];
const LABEL_TONE: Record<NonNullable<MailT['label']>, BadgeTone> = { Orders: 'brand', Team: 'info', Finance: 'gold', Suppliers: 'neutral' };
const when = (iso: string) => {
  const d = new Date(iso);
  return new Date().toDateString() === d.toDateString()
    ? d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

interface Compose {
  to: string;
  subject: string;
  body: string;
}

export default function Mail() {
  const toast = useToast();
  const [mail, setMail] = useState(MAIL);
  const [folder, setFolder] = useState<Folder>('inbox');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [compose, setCompose] = useState<Compose | null>(null);

  const inFolder = (m: MailT, f: Folder) => (f === 'starred' ? m.starred && m.folder !== 'trash' : m.folder === f);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mail
      .filter((m) => inFolder(m, folder))
      .filter((m) => !q || `${m.from.name} ${m.subject} ${m.preview}`.toLowerCase().includes(q))
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  }, [mail, folder, query]);
  const open = mail.find((m) => m.id === openId && inFolder(m, folder));
  const unread = (f: Folder) => mail.filter((m) => inFolder(m, f) && !m.read).length;

  const update = (ids: string[], patch: Partial<MailT>) => setMail((l) => l.map((m) => (ids.includes(m.id) ? { ...m, ...patch } : m)));
  const move = (ids: string[], to: MailT['folder']) => {
    update(ids, { folder: to });
    setChecked(new Set());
    if (openId && ids.includes(openId)) setOpenId(null);
    toast.ok(`${ids.length === 1 ? 'Message' : `${ids.length} messages`} moved to ${FOLDERS.find((f) => f.id === to)?.label}`);
  };
  const remove = (ids: string[]) =>
    folder === 'trash'
      ? (setMail((l) => l.filter((m) => !ids.includes(m.id))), setChecked(new Set()), toast.ok('Deleted for good'))
      : move(ids, 'trash');

  const all = list.length > 0 && list.every((m) => checked.has(m.id));
  const some = list.some((m) => checked.has(m.id));
  const sel = [...checked];

  return (
    <>
      <PageHeader
        title="Mail"
        description="Your team inbox."
        actions={
          <>
            <SampleBadge />
            <Button variant="primary" iconStart={<PenSquare size={16} />} onClick={() => setCompose({ to: '', subject: '', body: '' })}>
              Compose
            </Button>
          </>
        }
      />
      <div className={cx('mail-app', open && 'has-open')}>
        <nav className="card mail-folders" aria-label="Folders">
          <ul>
            {FOLDERS.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className={cx('mail-folder', folder === f.id && 'is-active')}
                  aria-current={folder === f.id || undefined}
                  onClick={() => {
                    setFolder(f.id);
                    setOpenId(null);
                    setChecked(new Set());
                  }}
                >
                  {f.icon}
                  <span>{f.label}</span>
                  {unread(f.id) > 0 && (
                    <span className="mail-count">
                      {unread(f.id)}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <section className="card mail-list" aria-label={`${FOLDERS.find((f) => f.id === folder)?.label} messages`}>
          <div className="mail-tools">
            <Checkbox
              label="Select all"
              hideLabel
              checked={all}
              indeterminate={some && !all}
              onChange={(v) => setChecked(v ? new Set(list.map((m) => m.id)) : new Set())}
              disabled={!list.length}
            />
            {some ? (
              <span className="mail-bulk">
                <span className="muted">{checked.size} selected</span>
                <IconButton
                  size="sm"
                  label="Mark as read"
                  icon={<MailOpen size={15} />}
                  onClick={() => (update(sel, { read: true }), setChecked(new Set()))}
                />
                {folder !== 'archive' && (
                  <IconButton size="sm" label="Archive" icon={<Archive size={15} />} onClick={() => move(sel, 'archive')} />
                )}
                <IconButton
                  size="sm"
                  label={folder === 'trash' ? 'Delete for good' : 'Delete'}
                  icon={<Trash2 size={15} />}
                  onClick={() => remove(sel)}
                />
              </span>
            ) : (
              <Input
                size="sm"
                aria-label="Search mail"
                placeholder="Search mail"
                prefix={<Search size={15} />}
                clearable
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mail-search"
              />
            )}
          </div>
          {list.length === 0 ? (
            <EmptyState
              compact
              headingLevel={2}
              icon={<Inbox size={22} />}
              title={query ? 'Nothing matches' : 'Nothing here'}
              description={query ? `No messages match “${query}”.` : 'Messages you move here show up in this list.'}
            />
          ) : (
            <ul className="mail-rows">
              {list.map((m) => (
                <li
                  key={m.id}
                  className={cx('mail-row', !m.read && 'is-unread', m.id === openId && 'is-active', checked.has(m.id) && 'is-checked')}
                >
                  <Checkbox
                    label={`Select message from ${m.from.name}`}
                    hideLabel
                    checked={checked.has(m.id)}
                    onChange={(v) =>
                      setChecked((c) => {
                        const n = new Set(c);
                        if (v) n.add(m.id);
                        else n.delete(m.id);
                        return n;
                      })
                    }
                  />
                  <button
                    type="button"
                    className={cx('mail-star', m.starred && 'is-on')}
                    aria-pressed={m.starred}
                    aria-label="Starred"
                    onClick={() => update([m.id], { starred: !m.starred })}
                  >
                    <Star size={15} />
                  </button>
                  <button
                    type="button"
                    className="mail-open"
                    onClick={() => {
                      setOpenId(m.id);
                      update([m.id], { read: true });
                    }}
                  >
                    <span className="mail-row-top">
                      {!m.read && <span className="sr-only">Unread, </span>}
                      <b>{folder === 'sent' || folder === 'drafts' ? `To: ${m.to}` : m.from.name}</b>
                      <time dateTime={m.at}>{when(m.at)}</time>
                    </span>
                    <span className="mail-subject">
                      {m.subject}
                      {m.attachments && <Paperclip size={13} aria-label="Has attachments" />}
                    </span>
                    <span className="mail-preview">{m.preview}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card mail-read" aria-label="Message">
          {open ? (
            <article>
              <div className="mail-read-tools">
                <IconButton
                  className="mail-back"
                  label="Back to the list"
                  icon={<ArrowLeft size={18} className="flip-rtl" />}
                  onClick={() => setOpenId(null)}
                />
                <span style={{ flex: 1 }} />
                <IconButton
                  label="Reply"
                  icon={<Reply size={16} />}
                  onClick={() =>
                    setCompose({
                      to: open.from.email,
                      subject: `Re: ${open.subject}`,
                      body: `<p></p><blockquote>${open.body}</blockquote>`,
                    })
                  }
                />
                <IconButton
                  label="Forward"
                  icon={<Forward size={16} />}
                  onClick={() =>
                    setCompose({ to: '', subject: `Fwd: ${open.subject}`, body: `<p></p><blockquote>${open.body}</blockquote>` })
                  }
                />
                {open.folder !== 'archive' && (
                  <IconButton label="Archive" icon={<Archive size={16} />} onClick={() => move([open.id], 'archive')} />
                )}
                <IconButton label="Delete" icon={<Trash2 size={16} />} onClick={() => remove([open.id])} />
              </div>
              <h2 className="mail-read-subject">{open.subject}</h2>
              {open.label && (
                <Badge size="sm" tone={LABEL_TONE[open.label]}>
                  {open.label}
                </Badge>
              )}
              <div className="mail-from">
                <Avatar name={open.from.name} size="md" />
                <span>
                  <b>{open.from.name}</b> <span className="muted">&lt;{open.from.email}&gt;</span>
                  <small className="muted">To {open.to}</small>
                </span>
                <time className="muted" dateTime={open.at}>
                  {new Date(open.at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </time>
              </div>
              {/* Sample HTML written in data.ts. Real mail must be sanitised before it's shown. */}
              <div className="mail-body rte-content" dangerouslySetInnerHTML={{ __html: open.body }} />
              {open.attachments && (
                <ul className="mail-files" aria-label="Attachments">
                  {open.attachments.map((a) => (
                    <li key={a.name}>
                      <File size={18} aria-hidden="true" />
                      <span>
                        <b>{a.name}</b>
                        <small className="muted">{a.size}</small>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                iconStart={<Reply size={15} />}
                onClick={() => setCompose({ to: open.from.email, subject: `Re: ${open.subject}`, body: '' })}
              >
                Reply
              </Button>
            </article>
          ) : (
            <EmptyState
              compact
              headingLevel={2}
              icon={<MailOpen size={22} />}
              title="No message open"
              description="Pick a message from the list to read it here."
            />
          )}
        </section>
      </div>
      {compose && (
        <ComposeDialog
          initial={compose}
          onClose={(draft) => {
            if (draft && (draft.subject || draft.body)) {
              setMail((l) => [
                ...l,
                {
                  id: `d${Date.now()}`,
                  folder: 'drafts',
                  from: { name: 'You', email: 'you@example.com' },
                  to: draft.to || '(no one yet)',
                  subject: draft.subject || '(no subject)',
                  preview: draft.body.replace(/<[^>]+>/g, ' ').slice(0, 90),
                  body: draft.body,
                  at: new Date().toISOString(),
                  read: true,
                  starred: false,
                },
              ]);
              toast.info('Saved to Drafts');
            }
            setCompose(null);
          }}
          onSend={(c) => {
            setMail((l) => [
              ...l,
              {
                id: `s${Date.now()}`,
                folder: 'sent',
                from: { name: 'You', email: 'you@example.com' },
                to: c.to,
                subject: c.subject || '(no subject)',
                preview: c.body
                  .replace(/<[^>]+>/g, ' ')
                  .trim()
                  .slice(0, 90),
                body: c.body,
                at: new Date().toISOString(),
                read: true,
                starred: false,
              },
            ]);
            setCompose(null);
            toast.ok('Message sent');
          }}
        />
      )}
    </>
  );
}

function ComposeDialog({
  initial,
  onClose,
  onSend,
}: {
  initial: Compose;
  onClose: (draft?: Compose) => void;
  onSend: (c: Compose) => void;
}) {
  const [c, setC] = useState(initial);
  const [error, setError] = useState('');
  const changed = c.to !== initial.to || c.subject !== initial.subject || c.body !== initial.body;
  return (
    <Modal
      open
      size="lg"
      title={initial.subject ? initial.subject : 'New message'}
      onClose={() => onClose(changed ? c : undefined)}
      footer={
        <>
          <span className="muted" style={{ marginInlineEnd: 'auto', fontSize: 13 }}>
            {changed ? 'Closing saves a draft' : ''}
          </span>
          <Button onClick={() => onClose()}>Discard</Button>
          <Button
            variant="primary"
            iconStart={<Send size={15} className="flip-rtl" />}
            onClick={() => {
              const ok = c.to.split(',').every((a) => /^\S+@\S+\.\S+$/.test(a.trim()));
              if (!ok) return setError('Enter an email address, or several separated by commas.');
              onSend(c);
            }}
          >
            Send
          </Button>
        </>
      }
    >
      <div className="app-form">
        <Field label="To" required error={error}>
          <Input
            type="email"
            multiple
            value={c.to}
            onChange={(e) => (setC({ ...c, to: e.target.value }), setError(''))}
            autoFocus={!initial.to}
            placeholder="name@example.com"
          />
        </Field>
        <Field label="Subject">
          <Input value={c.subject} onChange={(e) => setC({ ...c, subject: e.target.value })} />
        </Field>
        <Field label="Message">
          <RichTextEditor
            value={c.body}
            onChange={(body) => setC((o) => ({ ...o, body }))}
            minHeight={200}
            placeholder="Write your message"
          />
        </Field>
      </div>
    </Modal>
  );
}
