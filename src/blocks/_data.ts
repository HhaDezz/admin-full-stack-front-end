/* Sample data for the blocks and dashboards. Swap these for your API calls. */

export const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
export const moneyK = (n: number) => (Math.abs(n) >= 1000 ? `$${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}K` : money(n));
export const pct = (n: number) => `${Math.round(n * 10) / 10}%`;

const DAY = 86_400_000;
const now = new Date();
const start = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - 179 * DAY;
/** 180 days of shop numbers, ending today. */
export const DAILY = Array.from({ length: 180 }, (_, i) => {
  const dow = new Date(start + i * DAY).getUTCDay();
  const weekend = dow === 0 || dow === 6 ? 0.78 : 1;
  const trend = 1 + i / 320;
  const wave = 1 + Math.sin(i / 6) * 0.08;
  const visitors = Math.round(4200 * trend * wave * weekend);
  const orders = Math.round(visitors * (0.031 + Math.sin(i / 11) * 0.003));
  return {
    date: new Date(start + i * DAY).toISOString().slice(0, 10),
    visitors,
    sessions: Math.round(visitors * 1.38),
    orders,
    revenue: Math.round(orders * (68 + Math.cos(i / 9) * 6)),
    refunds: Math.round(orders * 0.018 * (1 + Math.sin(i / 5))),
  };
});

export const shortDate = (v: unknown) =>
  new Date(String(v)).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHLY = MONTHS.map((month, i) => ({
  month,
  thisYear: i < 10 ? Math.round(96_000 + i * 7_400 + Math.sin(i) * 6_000) : null,
  lastYear: Math.round(84_000 + i * 5_100 + Math.cos(i) * 5_000),
  online: Math.round(58_000 + i * 4_800),
  retail: Math.round(31_000 + i * 1_900 + Math.sin(i / 2) * 3_000),
  wholesale: Math.round(12_000 + i * 700),
}));

export const SOURCES = [
  { label: 'Organic search', value: 38_420 },
  { label: 'Direct', value: 24_910 },
  { label: 'Email', value: 14_380 },
  { label: 'Paid social', value: 11_760 },
  { label: 'Referral', value: 6_240 },
];

export const PRODUCTS = [
  { id: 'p1', name: 'Linen overshirt', sku: 'LN-2041', sold: 412, revenue: 32_548, trend: [12, 14, 13, 18, 17, 21, 24] },
  { id: 'p2', name: 'Merino crew', sku: 'MR-1180', sold: 356, revenue: 31_684, trend: [20, 19, 22, 21, 24, 23, 26] },
  { id: 'p3', name: 'Canvas tote', sku: 'CV-0312', sold: 588, revenue: 17_052, trend: [30, 28, 31, 27, 26, 29, 25] },
  { id: 'p4', name: 'Selvedge denim', sku: 'SD-7720', sold: 121, revenue: 15_609, trend: [8, 9, 11, 10, 12, 14, 15] },
  { id: 'p5', name: 'Wool beanie', sku: 'WB-0045', sold: 402, revenue: 11_256, trend: [6, 9, 12, 15, 18, 22, 27] },
];

export const PEOPLE = [
  { name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner' },
  { name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin' },
  { name: 'Alan Turing', email: 'alan@example.com', role: 'Member' },
  { name: 'Katherine Johnson', email: 'katherine@example.com', role: 'Member' },
  { name: 'Margaret Hamilton', email: 'margaret@example.com', role: 'Viewer' },
  { name: 'Dennis Ritchie', email: 'dennis@example.com', role: 'Member' },
];

export const ORDERS = [
  { id: 1048, customer: 'Mei Chen', items: 3, total: 214.5, status: 'Paid', placed: '2026-10-27T09:42:00Z' },
  { id: 1047, customer: 'Lucas Silva', items: 1, total: 89, status: 'Pending', placed: '2026-10-27T08:15:00Z' },
  { id: 1046, customer: 'Sofia Rossi', items: 2, total: 156, status: 'Paid', placed: '2026-10-26T18:03:00Z' },
  { id: 1045, customer: 'Noah Becker', items: 5, total: 402.2, status: 'Refunded', placed: '2026-10-26T14:27:00Z' },
  { id: 1044, customer: 'Amara Nwosu', items: 1, total: 64, status: 'Paid', placed: '2026-10-26T11:50:00Z' },
  { id: 1043, customer: 'Kenji Watanabe', items: 2, total: 133.8, status: 'Shipped', placed: '2026-10-25T20:11:00Z' },
] as const;

export const PROJECTS = [
  {
    id: 'atlas',
    name: 'Atlas redesign',
    client: 'Northwind',
    progress: 72,
    due: '2026-11-14',
    status: 'On track',
    team: ['Ada Lovelace', 'Grace Hopper', 'Alan Turing'],
  },
  {
    id: 'beacon',
    name: 'Beacon mobile app',
    client: 'Contoso',
    progress: 41,
    due: '2026-12-02',
    status: 'At risk',
    team: ['Katherine Johnson', 'Dennis Ritchie'],
  },
  {
    id: 'cobalt',
    name: 'Cobalt data import',
    client: 'Fabrikam',
    progress: 93,
    due: '2026-10-30',
    status: 'On track',
    team: ['Margaret Hamilton', 'Ada Lovelace'],
  },
  {
    id: 'delta',
    name: 'Delta billing',
    client: 'Initech',
    progress: 18,
    due: '2027-01-20',
    status: 'Behind',
    team: ['Grace Hopper', 'Alan Turing', 'Dennis Ritchie', 'Katherine Johnson'],
  },
];
