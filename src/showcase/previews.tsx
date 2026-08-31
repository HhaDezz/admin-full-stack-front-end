import type { ReactNode } from 'react';
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Copy,
  FileText,
  Folder,
  Inbox,
  Info,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  UploadCloud,
  User,
} from 'lucide-react';
import {
  Accordion,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumbs,
  Button,
  Checkbox,
  Divider,
  Kbd,
  Progress,
  QrCode,
  ProgressRing,
  Skeleton,
  Slider,
  Sparkline,
  Spinner,
  Steps,
  Switch,
  Tag,
} from '@/components/kit';

/* Small, static pictures of each component for the UI Kit overview. They use the real
 * components where they are cheap to render; overlays are drawn with their real CSS classes
 * so they look right without opening anything. Every preview is inert (no focus, no clicks). */

const L = ({ w = '100%', h = 8, tone }: { w?: number | string; h?: number; tone?: 'brand' | 'soft' }) => (
  <span className={`pv-line ${tone ? `is-${tone}` : ''}`} style={{ width: w, height: h }} />
);

const noop = () => {};

export const PREVIEWS: Record<string, ReactNode> = {
  /* Layout */
  stack: (
    <div className="pv-col" style={{ width: 120 }}>
      <span className="pv-box" />
      <span className="pv-box" />
      <span className="pv-box" />
    </div>
  ),
  grid: (
    <div className="pv-grid">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="pv-box" />
      ))}
    </div>
  ),
  'page-header': (
    <div className="pv-col" style={{ width: 190 }}>
      <L w={50} h={6} />
      <div className="pv-row" style={{ justifyContent: 'space-between' }}>
        <L w={100} h={14} tone="brand" />
        <span className="pv-btn is-primary" />
      </div>
      <L w={150} h={6} />
    </div>
  ),
  section: (
    <div className="pv-card" style={{ width: 190 }}>
      <L w={80} h={9} />
      <L w={130} h={6} />
      <span className="pv-box" style={{ height: 28, marginTop: 6 }} />
    </div>
  ),
  divider: (
    <div style={{ width: 180 }}>
      <Divider label="or" />
    </div>
  ),
  'scroll-area': (
    <div className="pv-card pv-scroll" style={{ width: 150, height: 76 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <L key={i} w={`${90 - (i % 3) * 15}%`} />
      ))}
    </div>
  ),
  'resizable-panels': (
    <div className="pv-split">
      <span className="pv-box" />
      <span className="pv-handle" />
      <span className="pv-box" />
    </div>
  ),

  /* Buttons */
  button: (
    <div className="pv-row">
      <Button variant="primary" size="sm">
        Save
      </Button>
      <Button size="sm">Cancel</Button>
    </div>
  ),
  'icon-button': (
    <div className="pv-row">
      {[<Pencil key="a" size={15} />, <Copy key="b" size={15} />, <Trash2 key="c" size={15} />].map((ic, i) => (
        <span key={i} className={`btn btn-icon btn-sm ${i === 2 ? 'btn-ghost' : ''}`}>
          {ic}
        </span>
      ))}
    </div>
  ),
  'button-group': (
    <div className="btn-group is-attached">
      <span className="btn btn-sm">Day</span>
      <span className="btn btn-sm">Week</span>
      <span className="btn btn-sm">Month</span>
    </div>
  ),
  'split-button': (
    <div className="btn-group is-attached">
      <span className="btn btn-primary btn-sm">Publish</span>
      <span className="btn btn-primary btn-sm btn-icon">
        <ChevronDown size={14} />
      </span>
    </div>
  ),
  'toggle-group': (
    <div className="pv-seg">
      <span className="is-on">List</span>
      <span>Board</span>
      <span>Calendar</span>
    </div>
  ),
  'copy-button': (
    <div className="pv-row">
      <code className="pv-code">npm i atelier</code>
      <span className="btn btn-sm">
        <Check size={13} /> Copied
      </span>
    </div>
  ),

  /* Form inputs */
  input: (
    <div className="pv-input" style={{ width: 180 }}>
      <Search size={14} /> <span className="muted">Search users</span>
    </div>
  ),
  textarea: (
    <div className="pv-input pv-textarea" style={{ width: 180 }}>
      <span>Write a note…</span>
      <small>12 / 200</small>
    </div>
  ),
  'number-input': (
    <div className="pv-input" style={{ width: 130, justifyContent: 'space-between' }}>
      <span className="pv-num">−</span>
      <b>12</b>
      <span className="pv-num">+</span>
    </div>
  ),
  'password-input': (
    <div className="pv-col" style={{ width: 180 }}>
      <div className="pv-input">••••••••••</div>
      <div className="pv-meter">
        <i className="is-on" />
        <i className="is-on" />
        <i className="is-on" />
        <i />
      </div>
    </div>
  ),
  checkbox: (
    <div className="pv-col">
      <Checkbox checked onChange={noop} label="Email alerts" />
      <Checkbox checked={false} onChange={noop} label="SMS alerts" />
    </div>
  ),
  'radio-group': (
    <div className="pv-col">
      <span className="pv-radio is-on">Monthly</span>
      <span className="pv-radio">Yearly</span>
    </div>
  ),
  switch: <Switch checked onChange={noop} label="Dark mode" />,
  slider: (
    <div style={{ width: 170 }}>
      <Slider aria-label="Preview" defaultValue={[25, 70]} showValue={false} />
    </div>
  ),
  'search-select': (
    <div className="pv-col" style={{ width: 180 }}>
      <div className="pv-input" style={{ justifyContent: 'space-between' }}>
        <span>
          <span className="pv-chip">Admin</span> <span className="pv-chip">Support</span>
        </span>
        <ChevronDown size={14} />
      </div>
      <div className="pv-menu">
        <span className="is-on">
          <b>Adm</b>in
        </span>
        <span>Auditor</span>
      </div>
    </div>
  ),

  /* Form inputs (Phase 2) */
  'pin-input': (
    <div className="pv-row" style={{ gap: 5 }}>
      {['4', '8', '1', '', '', ''].map((d, i) => (
        <span key={i} className={`pv-pin ${i === 3 ? 'is-on' : ''}`} style={i === 3 ? { marginInlineStart: 6 } : undefined}>
          {d}
        </span>
      ))}
    </div>
  ),
  'tag-input': (
    <div className="pv-input" style={{ width: 190, gap: 4 }}>
      <span className="pv-chip">linen ×</span>
      <span className="pv-chip">summer ×</span>
      <span className="muted">Add…</span>
    </div>
  ),
  rating: (
    <div className="pv-row" style={{ gap: 3, color: 'var(--gold, #dca33a)' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={20} fill={n <= 4 ? 'currentColor' : 'none'} />
      ))}
    </div>
  ),
  'color-picker': (
    <div className="pv-col" style={{ width: 150 }}>
      <div className="pv-sv" />
      <div className="pv-hue" />
      <div className="pv-row" style={{ gap: 4 }}>
        {['#1f4d45', '#3d6b9a', '#7c3aed', '#be185d', '#c8663a', '#dca33a'].map((c) => (
          <span key={c} className="pv-swatch" style={{ background: c }} />
        ))}
      </div>
    </div>
  ),
  'radio-cards': (
    <div className="pv-row" style={{ gap: 6 }}>
      {['Solo', 'Team', 'Org'].map((t) => (
        <span key={t} className={`pv-rcard ${t === 'Team' ? 'is-on' : ''}`}>
          <i />
          {t}
        </span>
      ))}
    </div>
  ),

  /* Forms (Phase 2) */
  form: (
    <div className="pv-col" style={{ width: 180 }}>
      <L w={50} h={6} />
      <div className="pv-input">Grace Hopper</div>
      <L w={40} h={6} />
      <div className="pv-input is-error">grace@</div>
      <div className="pv-row" style={{ justifyContent: 'flex-end' }}>
        <span className="pv-btn is-primary" />
      </div>
    </div>
  ),
  wizard: (
    <div className="pv-col" style={{ width: 200 }}>
      <Steps items={[{ title: 'Company' }, { title: 'Team' }, { title: 'Done' }]} current={1} />
      <div className="pv-card" style={{ gap: 6 }}>
        <L w={90} h={8} />
        <L w="100%" h={6} />
      </div>
    </div>
  ),
  'file-upload': (
    <div className="pv-col" style={{ width: 190 }}>
      <div className="pv-drop">
        <UploadCloud size={18} />
        <small>Drop files or browse</small>
      </div>
      <div className="pv-row" style={{ fontSize: 11 }}>
        <FileText size={13} />
        <span style={{ flex: 1 }}>
          <span className="pv-bar">
            <i style={{ width: '64%' }} />
          </span>
        </span>
        64%
      </div>
    </div>
  ),

  /* Date & time */
  calendar: (
    <div className="pv-cal">
      {Array.from({ length: 21 }, (_, i) => (
        <span key={i} className={i === 9 ? 'is-on' : i === 12 ? 'is-today' : ''}>
          {i + 6}
        </span>
      ))}
    </div>
  ),
  'date-picker': (
    <div className="pv-input" style={{ width: 170 }}>
      <CalendarDays size={14} /> Oct 27, 2026
    </div>
  ),
  'date-range-picker': (
    <div className="pv-col" style={{ width: 190 }}>
      <div className="pv-input">
        <CalendarDays size={14} /> Oct 1 – Oct 27
      </div>
      <div className="pv-row" style={{ gap: 4 }}>
        <span className="pv-chip">7 days</span>
        <span className="pv-chip">30 days</span>
        <span className="pv-chip">This month</span>
      </div>
    </div>
  ),
  'time-picker': (
    <div className="pv-input" style={{ width: 140 }}>
      <Clock size={14} /> <b>09</b>:<b>30</b> <span className="muted">AM</span>
    </div>
  ),

  /* Forms */
  field: (
    <div className="pv-col" style={{ width: 180 }}>
      <L w={60} h={7} />
      <div className="pv-input is-error">name@</div>
      <span style={{ fontSize: 11, color: 'var(--danger)' }}>Enter a valid email.</span>
    </div>
  ),

  /* Overlays */
  modal: (
    <div className="pv-window">
      <L w={90} h={9} />
      <L w="80%" h={6} />
      <L w="60%" h={6} />
      <div className="pv-row" style={{ justifyContent: 'flex-end', marginTop: 4 }}>
        <span className="pv-btn" />
        <span className="pv-btn is-primary" />
      </div>
    </div>
  ),
  'confirm-dialog': (
    <div className="pv-window" style={{ alignItems: 'center', textAlign: 'center' }}>
      <span className="pv-ico is-danger">
        <Trash2 size={14} />
      </span>
      <L w={100} h={8} />
      <div className="pv-row">
        <span className="pv-btn" />
        <span className="pv-btn is-danger" />
      </div>
    </div>
  ),
  drawer: (
    <div className="pv-screen">
      <span className="pv-drawer">
        <L w="70%" h={8} />
        <L w="90%" h={6} />
        <L w="50%" h={6} />
      </span>
    </div>
  ),
  popover: (
    <div className="pv-col" style={{ alignItems: 'center' }}>
      <div className="pv-pop">
        <L w={90} h={8} />
        <L w={120} h={6} />
      </div>
      <span className="btn btn-sm">Filters</span>
    </div>
  ),
  tooltip: (
    <div className="pv-col" style={{ alignItems: 'center', gap: 6 }}>
      <span className="pv-tip">Copy link</span>
      <span className="btn btn-icon btn-sm">
        <Copy size={14} />
      </span>
    </div>
  ),
  'dropdown-menu': (
    <div className="pv-menu" style={{ width: 150 }}>
      <span className="is-on">
        <Pencil size={12} /> Edit
      </span>
      <span>
        <Copy size={12} /> Duplicate
      </span>
      <span style={{ color: 'var(--danger)' }}>
        <Trash2 size={12} /> Delete
      </span>
    </div>
  ),

  'context-menu': (
    <div className="pv-col" style={{ alignItems: 'flex-start' }}>
      <div className="pv-menu" style={{ width: 130, marginInlineStart: 40 }}>
        <span className="is-on">
          <Pencil size={12} /> Rename
        </span>
        <span>
          <Copy size={12} /> Duplicate
        </span>
      </div>
    </div>
  ),
  'hover-card': (
    <div className="pv-col" style={{ alignItems: 'flex-start', gap: 6 }}>
      <span style={{ textDecoration: 'underline', fontSize: 12.5 }}>Priya Shah</span>
      <div className="pv-pop pv-row" style={{ gap: 8 }}>
        <Avatar name="Priya Shah" size="sm" />
        <span className="pv-col" style={{ gap: 4 }}>
          <L w={80} h={7} />
          <L w={110} h={5} />
        </span>
      </div>
    </div>
  ),
  'command-palette': (
    <div className="pv-menu" style={{ width: 190 }}>
      <span style={{ borderBottom: '1px solid var(--line)', borderRadius: 0 }}>
        <Search size={12} /> perm
        <span style={{ marginInlineStart: 'auto', padding: 0 }}>
          <Kbd keys={['mod', 'K']} />
        </span>
      </span>
      <span className="is-on">
        <b>Perm</b>issions
      </span>
      <span>Audit log</span>
    </div>
  ),

  /* Navigation */
  breadcrumbs: <Breadcrumbs items={[{ label: 'Home', to: '#' }, { label: 'Users', to: '#' }, { label: 'Grace' }]} />,
  'nav-menu': (
    <div className="pv-nav">
      <span className="is-on">
        <User size={13} /> Users
      </span>
      <span>
        <Bell size={13} /> Alerts <i>3</i>
      </span>
      <span>
        <Inbox size={13} /> Inbox
      </span>
    </div>
  ),
  pagination: (
    <div className="pv-row" style={{ gap: 4 }}>
      {['‹', '1', '2', '3', '…', '9', '›'].map((p, i) => (
        <span key={i} className={`pv-page ${p === '2' ? 'is-on' : ''}`}>
          {p}
        </span>
      ))}
    </div>
  ),
  steps: (
    <div style={{ width: 220 }}>
      <Steps current={1} items={[{ title: 'Account' }, { title: 'Team' }, { title: 'Done' }]} />
    </div>
  ),
  tabs: (
    <div className="pv-tabs">
      <span className="is-on">Profile</span>
      <span>Security</span>
      <span>Billing</span>
    </div>
  ),

  /* Feedback */
  alert: (
    <div style={{ width: 210 }}>
      <Alert tone="success" title="Saved" />
    </div>
  ),
  banner: (
    <div className="pv-banner">
      <Info size={13} /> Maintenance on Sunday <b>Details</b>
    </div>
  ),
  progress: (
    <div className="pv-row" style={{ gap: 16 }}>
      <div style={{ width: 110 }}>
        <Progress value={64} aria-label="Preview" />
      </div>
      <ProgressRing value={72} size={44} thickness={5} aria-label="Preview" />
    </div>
  ),
  spinner: (
    <div className="pv-row">
      <Spinner size={22} />
      <Button size="sm" variant="primary" loading>
        Saving
      </Button>
    </div>
  ),
  skeleton: (
    <div className="pv-row" style={{ width: 190 }}>
      <Skeleton circle h={34} w={34} />
      <div className="pv-col" style={{ flex: 1 }}>
        <Skeleton h={10} w="80%" />
        <Skeleton h={8} w="55%" />
      </div>
    </div>
  ),
  'empty-state': (
    <div className="pv-col" style={{ alignItems: 'center' }}>
      <span className="pv-ico">
        <Inbox size={16} />
      </span>
      <L w={90} h={8} />
      <span className="pv-btn is-primary" />
    </div>
  ),
  'result-page': (
    <div className="pv-col" style={{ alignItems: 'center' }}>
      <b className="display" style={{ fontSize: 30, lineHeight: 1, color: 'var(--brand)' }}>
        404
      </b>
      <L w={90} h={7} />
    </div>
  ),
  toast: (
    <div className="pv-toast">
      <Check size={14} /> User created <b>Undo</b>
    </div>
  ),

  /* Data display */
  accordion: (
    <div style={{ width: 200, pointerEvents: 'none' }}>
      <Accordion
        items={[
          { value: 'a', title: 'Shipping', content: 'Two to four days.' },
          { value: 'b', title: 'Returns', content: '' },
        ]}
        defaultOpen={['a']}
      />
    </div>
  ),
  avatar: (
    <div className="pv-row">
      <Avatar name="Ada Lovelace" size="lg" status="online" />
      <AvatarGroup
        people={['Grace Hopper', 'Alan Turing', 'Linus Torvalds', 'Ken Thompson', 'Radia Perlman'].map((name) => ({ name }))}
        max={3}
      />
    </div>
  ),
  badge: (
    <div className="pv-row">
      <Badge tone="ok" dot>
        Active
      </Badge>
      <Badge tone="warn">Pending</Badge>
      <Badge tone="gold" variant="solid">
        Pro
      </Badge>
    </div>
  ),
  card: (
    <div className="pv-card" style={{ width: 180 }}>
      <div className="pv-row" style={{ justifyContent: 'space-between' }}>
        <L w={70} h={9} />
        <Badge size="sm">New</Badge>
      </div>
      <L w="90%" h={6} />
      <L w="70%" h={6} />
    </div>
  ),
  'data-table': (
    <div className="pv-table">
      {[0, 1, 2, 3].map((r) => (
        <div key={r} className={r === 0 ? 'is-head' : ''}>
          <i className="pv-cb" />
          <L w={r ? 60 : 40} h={6} />
          <L w={r ? 40 : 30} h={6} />
          {r ? (
            <Badge size="sm" tone={r === 2 ? 'warn' : 'ok'}>
              {r === 2 ? 'Invited' : 'Active'}
            </Badge>
          ) : (
            <L w={30} h={6} />
          )}
        </div>
      ))}
    </div>
  ),
  'description-list': (
    <div className="pv-dl">
      {['Name', 'Role', 'Status', 'Joined'].map((t) => (
        <div key={t}>
          <small>{t}</small>
          <L w={60} h={7} />
        </div>
      ))}
    </div>
  ),
  kbd: <Kbd keys={['mod', 'shift', 'K']} />,
  timeline: (
    <div className="pv-col" style={{ gap: 10, width: 170 }}>
      {['brand', 'soft', 'soft'].map((t, i) => (
        <div key={i} className="pv-row" style={{ gap: 8, alignItems: 'flex-start' }}>
          <span className={`pv-tl-dot ${i === 0 ? 'is-on' : ''}`} />
          <span className="pv-col" style={{ gap: 4, flex: 1 }}>
            <L w={i ? 90 : 110} h={7} tone={t === 'brand' ? 'brand' : undefined} />
            <L w={70} h={5} />
          </span>
        </div>
      ))}
    </div>
  ),
  'tree-view': (
    <div className="pv-col" style={{ gap: 6, width: 160, fontSize: 12 }}>
      <span className="pv-row" style={{ gap: 5 }}>
        <ChevronDown size={12} /> <Folder size={13} /> src
      </span>
      <span className="pv-row" style={{ gap: 5, paddingInlineStart: 16 }}>
        <ChevronDown size={12} /> <Folder size={13} /> components
      </span>
      <span className="pv-row pv-tree-on" style={{ gap: 5, paddingInlineStart: 34 }}>
        <FileText size={13} /> Button.tsx
      </span>
      <span className="pv-row" style={{ gap: 5, paddingInlineStart: 34 }}>
        <FileText size={13} /> Modal.tsx
      </span>
    </div>
  ),
  'qr-code': <QrCode value="https://example.com/invite" size={84} aria-label="Preview" />,
  list: (
    <div className="pv-list">
      {['Ada Lovelace', 'Alan Turing', 'Grace Hopper'].map((n) => (
        <div key={n}>
          <Avatar name={n} size="xs" />
          <span>{n}</span>
          <L w={24} h={6} />
        </div>
      ))}
    </div>
  ),
  'stat-card': (
    <div className="pv-card" style={{ width: 170 }}>
      <small className="muted">Revenue</small>
      <div className="pv-row" style={{ justifyContent: 'space-between' }}>
        <b className="display" style={{ fontSize: 22 }}>
          $48.2k
        </b>
        <Sparkline data={[3, 5, 4, 7, 6, 9]} width={60} height={24} />
      </div>
      <small style={{ color: 'var(--ok)', fontWeight: 600 }}>+12.4%</small>
    </div>
  ),
  tag: (
    <div className="pv-row">
      <Tag onRemove={noop}>React</Tag>
      <Tag tone="brand" selected onClick={noop}>
        Active
      </Tag>
    </div>
  ),
  /* Charts */
  'line-chart': (
    <svg width="180" height="70" viewBox="0 0 180 70" aria-hidden="true">
      <path d="M0 50 C 30 40, 45 55, 70 38 S 120 20, 180 14" fill="none" stroke="var(--chart-1)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M0 60 C 35 58, 60 52, 90 50 S 140 40, 180 36" fill="none" stroke="var(--chart-2)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  'area-chart': (
    <svg width="180" height="70" viewBox="0 0 180 70" aria-hidden="true">
      <path d="M0 48 C 30 36, 50 50, 80 32 S 140 18, 180 12 L180 70 L0 70Z" fill="var(--chart-1)" opacity="0.15" />
      <path d="M0 48 C 30 36, 50 50, 80 32 S 140 18, 180 12" fill="none" stroke="var(--chart-1)" strokeWidth="2.5" />
    </svg>
  ),
  'bar-chart': (
    <div className="pv-bars">
      {[30, 44, 26, 52, 38, 60, 46, 64].map((h, i) => (
        <i key={i} style={{ height: h }} />
      ))}
    </div>
  ),
  'donut-chart': (
    <svg width="80" height="80" viewBox="0 0 42 42" aria-hidden="true">
      {[
        [45, 'var(--chart-1)', 25],
        [30, 'var(--chart-2)', 80],
        [25, 'var(--chart-3)', 50],
      ].map(([len, c, off]) => (
        <circle
          key={String(c)}
          cx="21"
          cy="21"
          r="15.9"
          fill="none"
          stroke={String(c)}
          strokeWidth="5"
          strokeDasharray={`${Number(len) - 1.5} ${101.5 - Number(len)}`}
          strokeDashoffset={Number(off)}
        />
      ))}
    </svg>
  ),
  gauge: (
    <svg width="130" height="74" viewBox="0 0 200 112" aria-hidden="true">
      <path d="M 7 100 A 93 93 0 0 1 193 100" fill="none" stroke="var(--surface-2)" strokeWidth="14" strokeLinecap="round" />
      <path d="M 7 100 A 93 93 0 0 1 160 35" fill="none" stroke="var(--chart-1)" strokeWidth="14" strokeLinecap="round" />
    </svg>
  ),
  heatmap: (
    <div className="pv-heat">
      {Array.from({ length: 32 }, (_, i) => (
        <i key={i} style={{ background: `color-mix(in oklab, var(--chart-seq) ${10 + ((i * 37) % 90)}%, var(--surface))` }} />
      ))}
    </div>
  ),
  'funnel-chart': (
    <div className="pv-funnel">
      {[100, 68, 44, 22].map((w) => (
        <i key={w} style={{ width: `${w}%` }} />
      ))}
    </div>
  ),
  sparkline: <Sparkline data={[3, 5, 4, 7, 6, 9, 8, 11]} width={140} height={40} />,
  /* Apps & advanced */
  select: (
    <span className="control select control-md pv-select" style={{ width: 150 }}>
      <span style={{ flex: 1 }}>Medium</span>
      <ChevronDown size={14} />
    </span>
  ),
  'mention-input': (
    <div className="pv-col" style={{ gap: 6, width: 170 }}>
      <div className="pv-card" style={{ padding: 4, gap: 2 }}>
        <span className="pv-row pv-tree-on" style={{ gap: 6, fontSize: 12 }}>
          <Avatar name="Amara Perera" size="xs" /> Amara Perera
        </span>
        <span className="pv-row" style={{ gap: 6, fontSize: 12 }}>
          <Avatar name="Alan Turing" size="xs" /> Alan Turing
        </span>
      </div>
      <span className="pv-input" style={{ fontSize: 12 }}>
        Thanks <b style={{ color: 'var(--brand)' }}>@Am</b>
      </span>
    </div>
  ),
  'code-block': (
    <div className="pv-code">
      <span>
        <i style={{ color: 'var(--chart-4)' }}>const</i> <i style={{ color: 'var(--chart-2)' }}>total</i> = sum(rows);
      </span>
      <span>
        <i style={{ color: 'var(--chart-4)' }}>return</i> <i style={{ color: 'var(--chart-3)' }}>'ok'</i>;
      </span>
      <Copy size={12} className="pv-code-copy" />
    </div>
  ),
  lightbox: (
    <div className="pv-lightbox">
      <span className="pv-lb-img" />
      <div className="pv-row" style={{ gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`pv-lb-thumb ${i === 1 ? 'is-on' : ''}`} />
        ))}
      </div>
    </div>
  ),
  'kanban-board': (
    <div className="pv-kanban">
      {[3, 2, 1].map((n, c) => (
        <div key={c}>
          {Array.from({ length: n }, (_, i) => (
            <span key={i} className={c === 1 && i === 0 ? 'is-lift' : ''}>
              <L w="70%" h={5} />
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
  scheduler: (
    <div className="pv-sched">
      {Array.from({ length: 21 }, (_, i) => (
        <i key={i} className={i === 9 ? 'is-today' : ''}>
          {[3, 9, 10, 16].includes(i) && <b style={{ background: `var(--chart-${(i % 5) + 1})` }} />}
        </i>
      ))}
    </div>
  ),
  'rich-text-editor': (
    <div className="pv-card" style={{ width: 180, padding: 0, gap: 0 }}>
      <div
        className="pv-row"
        style={{ gap: 8, padding: '6px 8px', borderBottom: '1px solid var(--line-2)', fontSize: 11, fontWeight: 700 }}
      >
        <span>B</span>
        <i>I</i>
        <u>U</u>
        <span className="muted">H2</span>
        <span className="muted">• —</span>
      </div>
      <div className="pv-col" style={{ gap: 5, padding: 8 }}>
        <L w="60%" h={8} tone="brand" />
        <L w="90%" h={5} />
        <L w="75%" h={5} />
      </div>
    </div>
  ),
  'notification-center': (
    <div className="pv-col" style={{ gap: 6, width: 170, alignItems: 'flex-end' }}>
      <span className="pv-bell">
        <Bell size={16} />
        <b>3</b>
      </span>
      <div className="pv-card" style={{ width: '100%', gap: 6 }}>
        {[0, 1].map((i) => (
          <span key={i} className="pv-row" style={{ gap: 6 }}>
            <span className="pv-dot" />
            <L w={i ? 80 : 110} h={6} />
          </span>
        ))}
      </div>
    </div>
  ),
  'chat-panel': (
    <div className="pv-chat">
      <span className="is-them">
        <L w={80} h={5} />
      </span>
      <span className="is-me">
        <L w={60} h={5} />
      </span>
      <span className="is-them">
        <L w={100} h={5} />
      </span>
    </div>
  ),
};

export const FALLBACK_PREVIEW = (
  <span className="pv-ico">
    <Plus size={16} />
  </span>
);
