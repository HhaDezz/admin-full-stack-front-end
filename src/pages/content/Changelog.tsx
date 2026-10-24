import { useState } from 'react';
import { Badge, PageHeader, Timeline, ToggleGroup, type BadgeTone } from '../../components/kit';

/* Changelog: releases newest first, each with tagged changes. Edit RELEASES as you ship. */

type Kind = 'New' | 'Improved' | 'Fixed';
const TONE: Record<Kind, BadgeTone> = { New: 'brand', Improved: 'info', Fixed: 'neutral' };

const RELEASES: { version: string; date: string; title: string; changes: [Kind, string][] }[] = [
  {
    version: '1.0.0',
    date: '2026-10-28',
    title: 'First public release',
    changes: [
      ['New', 'A one-file demo (anjana-admin-demo.html) that opens with a double-click: no install, no API.'],
      ['New', 'Hosted demo setup for Netlify and Vercel.'],
      [
        'Improved',
        'Text and status colours meet WCAG AA contrast in light and dark mode; heading levels fixed on the dashboard, roles and settings pages.',
      ],
      ['Improved', 'Code examples in the UI Kit are syntax-highlighted.'],
      ['Improved', 'The API is now atelier-api (package com.atelier.api), version 1.0.0.'],
    ],
  },
  {
    version: '0.5.0',
    date: '2026-10-28',
    title: 'Apps and motion',
    changes: [
      ['New', 'Kanban, Calendar, Chat, Mail, Files and Invoices app pages.'],
      [
        'New',
        'KanbanBoard, Scheduler, RichTextEditor, CodeBlock, NotificationCenter, ChatPanel, MentionInput, Lightbox and Select components.',
      ],
      ['New', 'A motion gallery with all 16 animations, and a circular reveal when switching theme.'],
      ['Improved', 'Toasts can be swiped away; form errors shake once; checkbox ticks draw in.'],
    ],
  },
  {
    version: '0.4.0',
    date: '2026-10-27',
    title: 'Dashboards, charts and blocks',
    changes: [
      ['New', 'Analytics, Sales and Projects dashboards.'],
      ['New', 'Charts kit: line, area, bar, donut, gauge, heatmap and funnel, themed for light and dark.'],
      ['New', '30 ready-made blocks, from stat rows to pricing tables.'],
      ['New', 'TreeView and Timeline components.'],
      ['Improved', 'DataTable: pinned and resizable columns, expandable rows, server mode and virtual rows.'],
    ],
  },
  {
    version: '0.3.0',
    date: '2026-10-27',
    title: 'Accounts and security',
    changes: [
      ['New', 'Sign-up with email confirmation, password reset and two-step sign-in with recovery codes.'],
      ['New', 'Settings, signed-in devices, notifications and My activity.'],
      ['New', 'Forms, date and time pickers, command palette and 16 more components.'],
      ['Fixed', 'Unlocking the lock screen returns to the page you were on.'],
    ],
  },
  {
    version: '0.2.0',
    date: '2026-10-26',
    title: 'The UI Kit',
    changes: [
      ['New', '52 components with live docs, playgrounds and dark, right-to-left and phone previews.'],
      ['New', 'Theme customizer with presets, brand colour and CSS export.'],
      ['Improved', 'The first screen loads under 150 kB.'],
    ],
  },
  {
    version: '0.1.0',
    date: '2026-10-25',
    title: 'First preview',
    changes: [['New', 'Users, roles, permissions, dashboard and audit log on React and Spring Boot.']],
  },
];
const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

export default function Changelog() {
  const [kind, setKind] = useState<'All' | Kind>('All');
  const shown = RELEASES.map((r) => ({ ...r, changes: r.changes.filter(([k]) => kind === 'All' || k === kind) })).filter(
    (r) => r.changes.length,
  );
  return (
    <div className="content-page content-narrow">
      <PageHeader title="Changelog" description="What’s new in Anjana Admin, release by release." />
      <div className="changelog-filter">
        <ToggleGroup
          size="sm"
          aria-label="Show"
          value={kind}
          onChange={setKind}
          items={(['All', 'New', 'Improved', 'Fixed'] as const).map((k) => ({ value: k, label: k }))}
        />
      </div>
      <Timeline
        aria-label="Releases"
        items={shown.map((r, i) => ({
          id: r.version,
          tone: i === 0 ? 'brand' : undefined,
          title: (
            <span className="changelog-title">
              <span className="mono changelog-version">v{r.version}</span> {r.title} {i === 0 && <Badge tone="brand">Latest</Badge>}
            </span>
          ),
          time: longDate(r.date),
          dateTime: r.date,
          content: (
            <ul className="changelog-list">
              {r.changes.map(([k, text]) => (
                <li key={text}>
                  <Badge tone={TONE[k]} size="sm">
                    {k}
                  </Badge>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          ),
        }))}
      />
    </div>
  );
}
