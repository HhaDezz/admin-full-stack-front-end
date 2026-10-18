/* Sample data for the app pages (Kanban, Calendar, Chat, Mail, Files, Invoices).
 * Dates are relative to today so the demo never looks stale. Replace with your API. */

export interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  online?: boolean;
}

export const ME: Person = { id: 'me', name: 'You', email: 'you@example.com', role: 'Owner', online: true };

export const TEAM: Person[] = [
  { id: 'ada', name: 'Ada Lovelace', email: 'ada@example.com', role: 'Design lead', online: true },
  { id: 'grace', name: 'Grace Hopper', email: 'grace@example.com', role: 'Engineering', online: true },
  { id: 'alan', name: 'Alan Turing', email: 'alan@example.com', role: 'Data' },
  { id: 'katherine', name: 'Katherine Johnson', email: 'katherine@example.com', role: 'Finance', online: true },
  { id: 'margaret', name: 'Margaret Hamilton', email: 'margaret@example.com', role: 'Support' },
  { id: 'dennis', name: 'Dennis Ritchie', email: 'dennis@example.com', role: 'Engineering' },
];
export const person = (id: string) => TEAM.find((p) => p.id === id) ?? ME;

/** A date-time `days` from today at `h:m`, as ISO. */
export const at = (days: number, h = 9, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
/** A date `days` from today as YYYY-MM-DD (local). */
export const ymd = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000).toISOString();

/* ── Kanban ── */
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export interface Task {
  id: string;
  column: string;
  title: string;
  description: string;
  tag: string;
  priority: Priority;
  owner: string;
  due?: string;
  comments: number;
  checklist?: [number, number];
}
export const BOARD_COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'var(--muted)' },
  { id: 'todo', title: 'To do', color: 'var(--chart-2)' },
  { id: 'doing', title: 'In progress', color: 'var(--chart-5)', limit: 4 },
  { id: 'review', title: 'Review', color: 'var(--chart-4)', limit: 3 },
  { id: 'done', title: 'Done', color: 'var(--chart-1)' },
];
export const TASKS: Task[] = [
  {
    id: 'AT-101',
    column: 'backlog',
    title: 'Gift cards at checkout',
    description: 'Let customers pay part or all of an order with a gift card code.',
    tag: 'Checkout',
    priority: 'Low',
    owner: 'grace',
    comments: 0,
  },
  {
    id: 'AT-102',
    column: 'backlog',
    title: 'Compare sizes across brands',
    description: 'A size guide that maps our sizes to the three biggest brands.',
    tag: 'Product',
    priority: 'Medium',
    owner: 'ada',
    comments: 2,
  },
  {
    id: 'AT-103',
    column: 'todo',
    title: 'Returns policy page',
    description: 'Write and publish the new 60-day returns policy.',
    tag: 'Content',
    priority: 'Medium',
    owner: 'margaret',
    due: ymd(4),
    comments: 3,
    checklist: [1, 4],
  },
  {
    id: 'AT-104',
    column: 'todo',
    title: 'Low-stock alerts by email',
    description: 'Email the buyer when a product drops below its reorder level.',
    tag: 'Inventory',
    priority: 'High',
    owner: 'alan',
    due: ymd(6),
    comments: 1,
  },
  {
    id: 'AT-105',
    column: 'todo',
    title: 'Photo shoot shortlist',
    description: 'Pick 40 shots for the lookbook from the two studio days.',
    tag: 'Design',
    priority: 'Low',
    owner: 'ada',
    comments: 5,
  },
  {
    id: 'AT-106',
    column: 'doing',
    title: 'Save card for later',
    description: 'Store payment methods with the provider and show them at checkout.',
    tag: 'Checkout',
    priority: 'Urgent',
    owner: 'grace',
    due: ymd(1),
    comments: 8,
    checklist: [3, 5],
  },
  {
    id: 'AT-107',
    column: 'doing',
    title: 'Q4 budget review',
    description: 'Go through spend by team and agree the Q4 numbers.',
    tag: 'Finance',
    priority: 'High',
    owner: 'katherine',
    due: ymd(2),
    comments: 4,
  },
  {
    id: 'AT-108',
    column: 'doing',
    title: 'Move images to the CDN',
    description: 'Serve product images in AVIF from the CDN with sizes per screen.',
    tag: 'Engineering',
    priority: 'Medium',
    owner: 'dennis',
    comments: 2,
    checklist: [6, 7],
  },
  {
    id: 'AT-109',
    column: 'review',
    title: 'Spring newsletter',
    description: 'Copy and layout for the spring launch email.',
    tag: 'Marketing',
    priority: 'Medium',
    owner: 'margaret',
    due: ymd(0),
    comments: 6,
  },
  {
    id: 'AT-110',
    column: 'review',
    title: 'Search: typo tolerance',
    description: 'Results for “jaket” should still find jackets.',
    tag: 'Engineering',
    priority: 'High',
    owner: 'alan',
    comments: 3,
  },
  {
    id: 'AT-111',
    column: 'done',
    title: 'New order confirmation email',
    description: 'Clearer layout with the delivery date at the top.',
    tag: 'Marketing',
    priority: 'Low',
    owner: 'ada',
    comments: 1,
  },
  {
    id: 'AT-112',
    column: 'done',
    title: 'Two-step sign-in for staff',
    description: 'Turn on authenticator codes for every staff account.',
    tag: 'Security',
    priority: 'Urgent',
    owner: 'dennis',
    comments: 2,
  },
];

/* ── Calendar ── */
export const CALENDARS = [
  { id: 'work', label: 'Work', color: 'var(--chart-1)' },
  { id: 'meetings', label: 'Meetings', color: 'var(--chart-2)' },
  { id: 'launch', label: 'Launches', color: 'var(--chart-3)' },
  { id: 'personal', label: 'Personal', color: 'var(--chart-4)' },
];
export interface AppEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  calendar: string;
  location?: string;
  notes?: string;
}
export const EVENTS: AppEvent[] = [
  { id: 'ev1', title: 'Stand-up', start: at(0, 9, 30), end: at(0, 9, 45), calendar: 'meetings', location: 'Zoom' },
  { id: 'ev2', title: 'Design review', start: at(0, 11), end: at(0, 12), calendar: 'meetings', location: 'Room 2' },
  { id: 'ev3', title: 'Supplier lunch', start: at(0, 11, 30), end: at(0, 13), calendar: 'work', location: 'Café Nero' },
  { id: 'ev4', title: 'Focus time', start: at(0, 14), end: at(0, 16), calendar: 'work' },
  { id: 'ev5', title: 'Stand-up', start: at(1, 9, 30), end: at(1, 9, 45), calendar: 'meetings', location: 'Zoom' },
  { id: 'ev6', title: 'Quarterly planning', start: at(1, 13), end: at(1, 15, 30), calendar: 'meetings', location: 'Boardroom' },
  { id: 'ev7', title: 'Spring launch', start: ymd(3), end: ymd(4), allDay: true, calendar: 'launch' },
  { id: 'ev8', title: 'Trade fair', start: ymd(8), end: ymd(11), allDay: true, calendar: 'work', location: 'Expo centre' },
  { id: 'ev9', title: 'Dentist', start: at(2, 17), end: at(2, 17, 45), calendar: 'personal' },
  { id: 'ev10', title: 'Payroll run', start: at(-2, 15), end: at(-2, 16), calendar: 'work' },
  { id: 'ev11', title: 'Photo shoot', start: at(5, 10), end: at(5, 15), calendar: 'launch', location: 'Studio B' },
  { id: 'ev12', title: '1:1 with Grace', start: at(-1, 10), end: at(-1, 10, 30), calendar: 'meetings' },
  { id: 'ev13', title: 'Yoga', start: at(-3, 7, 30), end: at(-3, 8, 30), calendar: 'personal' },
  { id: 'ev14', title: 'Board update', start: at(12, 16), end: at(12, 17), calendar: 'meetings' },
  { id: 'ev15', title: 'Holiday', start: ymd(16), end: ymd(19), allDay: true, calendar: 'personal' },
];

/* ── Chat ── */
export interface Conversation {
  id: string;
  name: string;
  members: string[];
  group?: boolean;
  unread: number;
  muted?: boolean;
}
export interface Msg {
  id: string;
  conv: string;
  author: string;
  text: string;
  at: string;
  attachments?: { name: string; size: string }[];
}
export const CONVERSATIONS: Conversation[] = [
  { id: 'c1', name: 'Spring launch', members: ['ada', 'grace', 'margaret'], group: true, unread: 2 },
  { id: 'c2', name: 'Grace Hopper', members: ['grace'], unread: 0 },
  { id: 'c3', name: 'Finance', members: ['katherine', 'alan'], group: true, unread: 0, muted: true },
  { id: 'c4', name: 'Ada Lovelace', members: ['ada'], unread: 1 },
  { id: 'c5', name: 'Dennis Ritchie', members: ['dennis'], unread: 0 },
];
export const MESSAGES: Msg[] = [
  { id: 'm1', conv: 'c1', author: 'ada', text: 'Morning! The lookbook photos are in the shared folder.', at: minutesAgo(60 * 26) },
  {
    id: 'm2',
    conv: 'c1',
    author: 'ada',
    text: 'Cover options are on page 3.',
    at: minutesAgo(60 * 26 - 1),
    attachments: [{ name: 'lookbook-v2.pdf', size: '4.2 MB' }],
  },
  { id: 'm3', conv: 'c1', author: 'me', text: 'Great, I’ll pick one after lunch.', at: minutesAgo(60 * 25) },
  { id: 'm4', conv: 'c1', author: 'grace', text: '@Ada Lovelace can you export them at 2x for the site?', at: minutesAgo(40) },
  {
    id: 'm5',
    conv: 'c1',
    author: 'margaret',
    text: 'Support is ready for launch day. FAQ is updated: https://example.com/help',
    at: minutesAgo(12),
  },
  { id: 'm6', conv: 'c1', author: 'ada', text: 'On it 👍', at: minutesAgo(11) },
  { id: 'm7', conv: 'c2', author: 'grace', text: 'The saved cards change is ready for review.', at: minutesAgo(180) },
  { id: 'm8', conv: 'c2', author: 'me', text: 'Thanks! I’ll look this afternoon.', at: minutesAgo(170) },
  { id: 'm9', conv: 'c3', author: 'katherine', text: 'Q4 numbers are in the sheet. Marketing is 8% over.', at: minutesAgo(60 * 50) },
  { id: 'm10', conv: 'c3', author: 'alan', text: 'Most of it is the photo shoot. Should even out in November.', at: minutesAgo(60 * 49) },
  { id: 'm11', conv: 'c4', author: 'ada', text: 'Do you have five minutes for the size guide?', at: minutesAgo(25) },
  { id: 'm12', conv: 'c5', author: 'dennis', text: 'CDN is live. Pages are about 40% lighter.', at: minutesAgo(60 * 72) },
];
export const REPLIES = ['Sounds good!', 'Thanks, I’ll take a look.', 'Agreed 👍', 'Let’s talk at stand-up.', 'Perfect, thank you.'];

/* ── Mail ── */
export type Folder = 'inbox' | 'starred' | 'sent' | 'drafts' | 'archive' | 'trash';
export interface Mail {
  id: string;
  folder: Exclude<Folder, 'starred'>;
  from: { name: string; email: string };
  to: string;
  subject: string;
  preview: string;
  body: string;
  at: string;
  read: boolean;
  starred: boolean;
  label?: 'Orders' | 'Team' | 'Finance' | 'Suppliers';
  attachments?: { name: string; size: string }[];
}
const p = (...lines: string[]) => lines.map((l) => `<p>${l}</p>`).join('');
export const MAIL: Mail[] = [
  {
    id: 'ml1',
    folder: 'inbox',
    from: { name: 'Katherine Johnson', email: 'katherine@example.com' },
    to: 'you@example.com',
    subject: 'Q4 budget: two questions',
    preview: 'Before Thursday, could you confirm the photo shoot spend and…',
    label: 'Finance',
    body: p(
      'Hi,',
      'Before Thursday, could you confirm the photo shoot spend and whether the November ads are still going ahead?',
      'Thanks,<br>Katherine',
    ),
    at: minutesAgo(18),
    read: false,
    starred: true,
    attachments: [{ name: 'q4-budget.xlsx', size: '86 KB' }],
  },
  {
    id: 'ml2',
    folder: 'inbox',
    from: { name: 'Northwind Fabrics', email: 'orders@northwind.example' },
    to: 'you@example.com',
    subject: 'Your linen order has shipped',
    preview: 'Order NW-88412 is on its way and should arrive by Friday.',
    label: 'Suppliers',
    body: p(
      'Hello,',
      'Order <b>NW-88412</b> (240 m of washed linen) is on its way and should arrive by Friday.',
      'Track it any time from your account.',
      'Northwind Fabrics',
    ),
    at: minutesAgo(95),
    read: false,
    starred: false,
  },
  {
    id: 'ml3',
    folder: 'inbox',
    from: { name: 'Ada Lovelace', email: 'ada@example.com' },
    to: 'you@example.com',
    subject: 'Lookbook cover options',
    preview: 'Three covers attached. My favourite is the second one, but…',
    label: 'Team',
    body: p('Three covers attached. My favourite is the second one, but the first works better on phones.', 'Ada'),
    at: minutesAgo(60 * 5),
    read: true,
    starred: false,
    attachments: [
      { name: 'cover-a.jpg', size: '1.2 MB' },
      { name: 'cover-b.jpg', size: '1.4 MB' },
    ],
  },
  {
    id: 'ml4',
    folder: 'inbox',
    from: { name: 'Shop notifications', email: 'no-reply@example.com' },
    to: 'you@example.com',
    subject: 'New order #1048 — $214.50',
    preview: 'Mei Chen ordered 3 items. Ship by tomorrow.',
    label: 'Orders',
    body: p('Mei Chen ordered 3 items for <b>$214.50</b>.', 'Ship by tomorrow to keep the next-day promise.'),
    at: minutesAgo(60 * 9),
    read: true,
    starred: false,
  },
  {
    id: 'ml5',
    folder: 'inbox',
    from: { name: 'Grace Hopper', email: 'grace@example.com' },
    to: 'you@example.com',
    subject: 'Re: Saved cards',
    preview: 'Ready for review. The provider handles the card details, so…',
    label: 'Team',
    body: p('Ready for review. The provider handles the card details, so we only keep a token and the last four digits.', 'Grace'),
    at: minutesAgo(60 * 28),
    read: true,
    starred: true,
  },
  {
    id: 'ml6',
    folder: 'inbox',
    from: { name: 'Contoso Logistics', email: 'billing@contoso.example' },
    to: 'you@example.com',
    subject: 'Invoice CL-2210 is due in 7 days',
    preview: 'Your invoice for October deliveries ($3,480.00) is due…',
    label: 'Finance',
    body: p('Your invoice for October deliveries (<b>$3,480.00</b>) is due on the 4th.', 'Contoso Logistics'),
    at: minutesAgo(60 * 52),
    read: true,
    starred: false,
    attachments: [{ name: 'CL-2210.pdf', size: '212 KB' }],
  },
  {
    id: 'ml7',
    folder: 'sent',
    from: { name: 'You', email: 'you@example.com' },
    to: 'margaret@example.com',
    subject: 'Launch day support rota',
    preview: 'Here’s the rota for launch day. Shout if anything clashes.',
    body: p('Here’s the rota for launch day. Shout if anything clashes.'),
    at: minutesAgo(60 * 30),
    read: true,
    starred: false,
  },
  {
    id: 'ml8',
    folder: 'drafts',
    from: { name: 'You', email: 'you@example.com' },
    to: 'press@example.com',
    subject: 'Spring collection press release',
    preview: 'Draft: Anjana’s spring collection brings six new colours…',
    body: p('Anjana’s spring collection brings six new colours…'),
    at: minutesAgo(60 * 6),
    read: true,
    starred: false,
  },
  {
    id: 'ml9',
    folder: 'archive',
    from: { name: 'Alan Turing', email: 'alan@example.com' },
    to: 'you@example.com',
    subject: 'September sales report',
    preview: 'Report attached. Returns are down 12% since the new size guide.',
    label: 'Team',
    body: p('Report attached. Returns are down 12% since the new size guide.'),
    at: minutesAgo(60 * 24 * 20),
    read: true,
    starred: false,
  },
];

/* ── Files ── */
export type FileKind = 'folder' | 'image' | 'pdf' | 'doc' | 'sheet' | 'video' | 'zip' | 'code';
export interface FileEntry {
  id: string;
  parent: string | null;
  name: string;
  kind: FileKind;
  size?: number;
  modified: string;
  owner: string;
  hue?: number;
  starred?: boolean;
}
const f = (
  id: string,
  parent: string | null,
  name: string,
  kind: FileKind,
  size: number | undefined,
  daysAgo: number,
  owner: string,
  hue?: number,
): FileEntry => ({
  id,
  parent,
  name,
  kind,
  size,
  modified: minutesAgo(daysAgo * 1440 + ((id.length * 37) % 600)),
  owner,
  hue,
});
export const FILES: FileEntry[] = [
  f('marketing', null, 'Marketing', 'folder', undefined, 1, 'ada'),
  f('finance', null, 'Finance', 'folder', undefined, 3, 'katherine'),
  f('product', null, 'Product photos', 'folder', undefined, 0, 'ada'),
  f('eng', null, 'Engineering', 'folder', undefined, 6, 'grace'),
  f('handbook', null, 'Staff handbook.pdf', 'pdf', 2_400_000, 40, 'margaret'),
  f('logo', null, 'logo.svg', 'image', 18_000, 90, 'ada', 160),
  f('lookbook', 'marketing', 'Lookbook spring.pdf', 'pdf', 14_200_000, 1, 'ada'),
  f('newsletter', 'marketing', 'Newsletter copy.docx', 'doc', 48_000, 2, 'margaret'),
  f('campaign', 'marketing', 'Campaign video.mp4', 'video', 182_000_000, 4, 'ada'),
  f('banners', 'marketing', 'Banners', 'folder', undefined, 5, 'ada'),
  f('banner-1', 'banners', 'banner-home.png', 'image', 820_000, 5, 'ada', 30),
  f('banner-2', 'banners', 'banner-sale.png', 'image', 790_000, 5, 'ada', 350),
  f('budget', 'finance', 'Q4 budget.xlsx', 'sheet', 86_000, 0, 'katherine'),
  f('invoices', 'finance', 'Invoices October.zip', 'zip', 5_400_000, 3, 'katherine'),
  f('payroll', 'finance', 'Payroll.xlsx', 'sheet', 64_000, 9, 'katherine'),
  f('p1', 'product', 'linen-shirt-sage.jpg', 'image', 2_100_000, 0, 'ada', 140),
  f('p2', 'product', 'linen-shirt-sand.jpg', 'image', 2_300_000, 0, 'ada', 38),
  f('p3', 'product', 'wool-coat-navy.jpg', 'image', 2_800_000, 1, 'ada', 220),
  f('p4', 'product', 'silk-scarf-rose.jpg', 'image', 1_600_000, 1, 'ada', 340),
  f('p5', 'product', 'denim-jacket.jpg', 'image', 2_500_000, 2, 'ada', 210),
  f('p6', 'product', 'canvas-tote.jpg', 'image', 1_200_000, 2, 'ada', 50),
  f('api', 'eng', 'api-spec.yaml', 'code', 34_000, 6, 'grace'),
  f('arch', 'eng', 'Architecture.pdf', 'pdf', 1_100_000, 12, 'dennis'),
  f('backup', 'eng', 'db-backup.zip', 'zip', 640_000_000, 1, 'dennis'),
];
export const STORAGE_LIMIT = 5_000_000_000;

/* ── Invoices ── */
export type InvoiceStatus = 'Paid' | 'Sent' | 'Overdue' | 'Draft';
export interface InvoiceLine {
  description: string;
  qty: number;
  price: number;
}
export interface Invoice {
  id: string;
  number: string;
  client: { name: string; email: string; address: string[] };
  issued: string;
  due: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  taxRate: number;
  notes?: string;
}
const CLIENTS = [
  { name: 'Northwind Traders', email: 'accounts@northwind.example', address: ['12 Harbour Road', 'Colombo 03', 'Sri Lanka'] },
  { name: 'Contoso Retail', email: 'ap@contoso.example', address: ['400 Market Street', 'San Francisco, CA 94105', 'United States'] },
  { name: 'Fabrikam Studio', email: 'hello@fabrikam.example', address: ['8 Rue des Arts', '75003 Paris', 'France'] },
  { name: 'Tailspin Boutique', email: 'finance@tailspin.example', address: ['77 King Street', 'Manchester M2 4LQ', 'United Kingdom'] },
  { name: 'Wingtip Outfitters', email: 'billing@wingtip.example', address: ['5 Galle Face Terrace', 'Colombo 02', 'Sri Lanka'] },
];
const LINES: InvoiceLine[][] = [
  [
    { description: 'Linen shirts, wholesale (sage)', qty: 40, price: 32 },
    { description: 'Linen shirts, wholesale (sand)', qty: 30, price: 32 },
    { description: 'Shipping and insurance', qty: 1, price: 180 },
  ],
  [
    { description: 'Wool coats, wholesale', qty: 12, price: 145 },
    { description: 'Gift boxes', qty: 12, price: 6.5 },
  ],
  [
    { description: 'Lookbook photography (2 days)', qty: 2, price: 1200 },
    { description: 'Retouching, per image', qty: 40, price: 18 },
  ],
  [{ description: 'Silk scarves, wholesale', qty: 60, price: 22 }],
  [
    { description: 'Denim jackets, wholesale', qty: 25, price: 68 },
    { description: 'Canvas totes', qty: 50, price: 9 },
    { description: 'Shipping', qty: 1, price: 95 },
  ],
];
const STATUSES: InvoiceStatus[] = [
  'Paid',
  'Sent',
  'Overdue',
  'Paid',
  'Draft',
  'Paid',
  'Sent',
  'Paid',
  'Overdue',
  'Paid',
  'Sent',
  'Paid',
  'Paid',
  'Draft',
];
export const INVOICES: Invoice[] = STATUSES.map((status, i) => {
  // Overdue ones were issued over 30 days ago, sent ones in the last month, paid ones over the last few months.
  const issuedAgo = status === 'Overdue' ? 38 + i * 3 : status === 'Sent' ? 3 + i * 2 : status === 'Draft' ? 1 + i : i * 6 + 2;
  return {
    id: `inv-${2041 - i}`,
    number: `INV-${2041 - i}`,
    client: CLIENTS[i % CLIENTS.length],
    issued: ymd(-issuedAgo),
    due: ymd(-issuedAgo + 30),
    status,
    lines: LINES[i % LINES.length],
    taxRate: i % 3 === 0 ? 0.08 : 0.1,
    notes: 'Payment by bank transfer within 30 days. Thank you for your business!',
  };
});
export const subtotal = (inv: Invoice) => inv.lines.reduce((a, l) => a + l.qty * l.price, 0);
export const total = (inv: Invoice) => subtotal(inv) * (1 + inv.taxRate);
export const usd = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
