import { lazy, type ComponentType } from 'react';

/* Every block, for the gallery at /ui/blocks. Each block is one file you can copy into a page. */

export const BLOCK_CATEGORIES = ['Stats', 'Charts', 'Lists', 'Forms', 'Marketing', 'Auth', 'Feedback'] as const;
export type BlockCategory = (typeof BLOCK_CATEGORIES)[number];

interface Meta {
  file: string;
  name: string;
  category: BlockCategory;
  description: string;
  /** How wide it shows in the gallery: full row, or about half (it still fills a phone). */
  width: 'full' | 'half';
}

const META: Meta[] = [
  {
    file: 'stats/StatRow',
    name: 'Stat row',
    category: 'Stats',
    width: 'full',
    description: 'Four KPI cards with change and a 7-day sparkline.',
  },
  {
    file: 'stats/StatHero',
    name: 'Hero metric',
    category: 'Stats',
    width: 'full',
    description: 'The one number a page leads with, its change and a 30-day chart.',
  },
  {
    file: 'stats/StatStrip',
    name: 'Stat strip',
    category: 'Stats',
    width: 'full',
    description: 'Five compact numbers in one card, for above a table.',
  },
  {
    file: 'stats/GoalProgress',
    name: 'Goal progress',
    category: 'Stats',
    width: 'half',
    description: 'Targets with progress that turns amber when behind pace.',
  },
  {
    file: 'stats/HealthGauges',
    name: 'Health gauges',
    category: 'Stats',
    width: 'half',
    description: 'Three gauges with good, warning and critical bands.',
  },
  {
    file: 'charts/RevenueCard',
    name: 'Revenue chart',
    category: 'Charts',
    width: 'full',
    description: 'Area chart with a 7/30/90-day switch, total and change.',
  },
  {
    file: 'charts/YearCompareCard',
    name: 'Year on year',
    category: 'Charts',
    width: 'full',
    description: 'Monthly bars against last year, or stacked by channel.',
  },
  {
    file: 'charts/SourcesCard',
    name: 'Traffic sources',
    category: 'Charts',
    width: 'half',
    description: 'Donut with each source’s visits and share.',
  },
  {
    file: 'charts/FunnelCard',
    name: 'Checkout funnel',
    category: 'Charts',
    width: 'half',
    description: 'Steps with conversion and drop-off.',
  },
  {
    file: 'charts/BusyHoursCard',
    name: 'Busy hours',
    category: 'Charts',
    width: 'full',
    description: 'Heatmap of orders by weekday and hour.',
  },
  {
    file: 'lists/RecentOrders',
    name: 'Recent orders',
    category: 'Lists',
    width: 'full',
    description: 'Compact table with status badges and links.',
  },
  {
    file: 'lists/TopProducts',
    name: 'Top products',
    category: 'Lists',
    width: 'half',
    description: 'Best sellers with units, revenue and a trend line.',
  },
  {
    file: 'lists/TeamMembers',
    name: 'Team members',
    category: 'Lists',
    width: 'half',
    description: 'People with roles, a role menu and an invite button.',
  },
  {
    file: 'lists/ActivityFeed',
    name: 'Activity feed',
    category: 'Lists',
    width: 'half',
    description: 'Recent events with icons, newest first.',
  },
  {
    file: 'lists/ProjectsProgress',
    name: 'Projects',
    category: 'Lists',
    width: 'half',
    description: 'Progress, due date, status and team per project.',
  },
  {
    file: 'forms/ProfileForm',
    name: 'Profile form',
    category: 'Forms',
    width: 'full',
    description: 'Photo upload, name, title, email and bio with validation and an unsaved-changes guard.',
  },
  {
    file: 'forms/NotificationMatrix',
    name: 'Notification matrix',
    category: 'Forms',
    width: 'full',
    description: 'A switch per event and channel, with save and discard.',
  },
  {
    file: 'forms/InviteMembers',
    name: 'Invite people',
    category: 'Forms',
    width: 'half',
    description: 'Paste emails, pick a role, add a note.',
  },
  {
    file: 'forms/BillingDetails',
    name: 'Billing details',
    category: 'Forms',
    width: 'half',
    description: 'Company, tax number and address in a two-column grid.',
  },
  {
    file: 'forms/DangerZone',
    name: 'Danger zone',
    category: 'Forms',
    width: 'full',
    description: 'Irreversible actions behind confirmations.',
  },
  {
    file: 'marketing/PricingTiers',
    name: 'Pricing tiers',
    category: 'Marketing',
    width: 'full',
    description: 'Three plans with a monthly/yearly switch.',
  },
  {
    file: 'marketing/PlanComparison',
    name: 'Plan comparison',
    category: 'Marketing',
    width: 'full',
    description: 'Every feature against every plan, grouped.',
  },
  {
    file: 'marketing/FaqSection',
    name: 'FAQ',
    category: 'Marketing',
    width: 'full',
    description: 'Questions in an accordion with a contact prompt.',
  },
  {
    file: 'marketing/FeatureGrid',
    name: 'Feature grid',
    category: 'Marketing',
    width: 'full',
    description: 'Six features with an icon and one line each.',
  },
  {
    file: 'auth/SignInCard',
    name: 'Sign-in card',
    category: 'Auth',
    width: 'half',
    description: 'Email, password, remember me and single sign-on.',
  },
  {
    file: 'auth/VerifyCodeCard',
    name: 'Code check',
    category: 'Auth',
    width: 'half',
    description: 'Six boxes that submit themselves, with a resend timer.',
  },
  {
    file: 'auth/InviteCard',
    name: 'Invitation',
    category: 'Auth',
    width: 'half',
    description: 'Who invited you, with which role, and join or decline.',
  },
  {
    file: 'feedback/EmptyProjects',
    name: 'First-run empty state',
    category: 'Feedback',
    width: 'half',
    description: 'What goes here and two ways to start.',
  },
  {
    file: 'feedback/UpgradeBanner',
    name: 'Upgrade prompt',
    category: 'Feedback',
    width: 'full',
    description: 'A usage meter near a plan limit, with the next plan.',
  },
  {
    file: 'feedback/FilterBar',
    name: 'Filter bar',
    category: 'Feedback',
    width: 'full',
    description: 'Search, status, owner and date range with removable chips.',
  },
];

const modules = import.meta.glob<{ default: ComponentType }>('./*/*.tsx');
const sources = import.meta.glob<string>('./*/*.tsx', { query: '?raw', import: 'default' });

export interface BlockEntry extends Meta {
  slug: string;
  Component: ComponentType;
  /** The block's source file, loaded when the Code tab opens. */
  source: () => Promise<string>;
}

export const blocks: BlockEntry[] = META.map((m) => {
  const load = modules[`./${m.file}.tsx`];
  const raw = sources[`./${m.file}.tsx`];
  if (!load || !raw) throw new Error(`Blocks: no file for ${m.file}`);
  return {
    ...m,
    slug: m.file
      .split('/')[1]
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase(),
    Component: lazy(load),
    source: raw,
  };
});

/** Block files on disk (for the test that keeps this list complete). */
export const blockFiles = Object.keys(modules).map((p) => p.slice(2, -4));
