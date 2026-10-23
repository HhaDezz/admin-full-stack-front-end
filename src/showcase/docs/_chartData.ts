/* Sample data shared by the chart docs pages. */
const day = (i: number) => new Date(Date.UTC(2026, 9, 1 + i));
export const shortDay = (v: unknown) =>
  new Date(String(v)).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
export const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export const TRAFFIC = Array.from({ length: 28 }, (_, i) => ({
  date: day(i).toISOString().slice(0, 10),
  visitors: Math.round(1800 + Math.sin(i / 3) * 420 + i * 38 + (i % 7 === 5 || i % 7 === 6 ? -380 : 0)),
  signups: Math.round(120 + Math.cos(i / 4) * 30 + i * 4.2 + (i % 7 === 5 || i % 7 === 6 ? -35 : 0)),
  trials: Math.round(64 + Math.sin(i / 5) * 18 + i * 2.1),
}));

export const REVENUE = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => ({
  month,
  subscriptions: 42000 + i * 3100 + (i % 3) * 900,
  services: 12000 + Math.round(Math.sin(i / 2) * 3000) + i * 400,
  marketplace: 5200 + i * 650,
}));

export const CHANNELS = [
  { channel: 'Organic search', revenue: 48200, orders: 612 },
  { channel: 'Direct', revenue: 35100, orders: 498 },
  { channel: 'Email', revenue: 21900, orders: 344 },
  { channel: 'Paid social', revenue: 15800, orders: 251 },
  { channel: 'Referral', revenue: 9400, orders: 132 },
];
