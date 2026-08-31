import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as m from 'motion/react-m';
import { ArrowRight, Blocks, LayoutTemplate, Search, X } from 'lucide-react';
import { Badge, EmptyState, Kbd, Tag } from '@/components/kit';
import { rise, stagger } from '../lib/motion';
import { FALLBACK_PREVIEW, PREVIEWS } from './previews';
import { BLOCK_COUNT } from './kitCount';
import { GROUPS, registry, type ComponentEntry, type Group } from './registry';
import './showcase.css';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function KitCard({ c }: { c: ComponentEntry }) {
  return (
    <m.div variants={rise}>
      <Link to={`/ui/${c.slug}`} className="card kit-card is-link">
        <div className="kit-preview" inert aria-hidden="true">
          {PREVIEWS[c.slug] ?? FALLBACK_PREVIEW}
        </div>
        <div className="kit-card-text">
          <div className="kit-card-top">
            <h3>{c.name}</h3>
            {c.status === 'new' && (
              <Badge tone="ok" size="sm">
                New
              </Badge>
            )}
            {c.status === 'updated' && (
              <Badge tone="info" size="sm">
                Updated
              </Badge>
            )}
          </div>
          <p>{c.description}</p>
        </div>
      </Link>
    </m.div>
  );
}

export default function UiKitOverview() {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<Group | null>(null);
  const counts = useMemo(() => Object.fromEntries(GROUPS.map((g) => [g, registry.filter((c) => c.group === g).length])), []);
  const words = norm(q).split(/\s+/).filter(Boolean);
  const shown = registry.filter(
    (c) => (!group || c.group === group) && words.every((w) => norm(`${c.name} ${c.description} ${c.group}`).includes(w)),
  );
  const grouped = !q.trim() && !group;

  return (
    <>
      <div className="kit-hero">
        <div>
          <span className="kit-eyebrow">
            <Blocks size={15} /> Anjana Admin UI Kit
          </span>
          <h1 className="display">{registry.length} components, live.</h1>
          <p>
            Open any of them to try every variant and state, switch the preview to dark or right-to-left, and copy the exact code that runs.
            All of them read the design tokens, so the theme customizer restyles them at once.
          </p>
          <Link to="/ui/blocks" className="btn btn-sm kit-blocks-link">
            <LayoutTemplate size={15} /> Browse {BLOCK_COUNT} blocks <ArrowRight size={14} className="flip-rtl" />
          </Link>
        </div>
        <dl className="kit-stats">
          <div>
            <dt>Components</dt>
            <dd>{registry.length}</dd>
          </div>
          <div>
            <dt>New in this release</dt>
            <dd>{registry.filter((c) => c.status === 'new').length}</dd>
          </div>
          <div>
            <dt>Groups</dt>
            <dd>{GROUPS.length}</dd>
          </div>
        </dl>
      </div>

      <div className="kit-filter">
        <div className="input-wrap kit-search">
          <Search size={17} />
          <input
            className="input"
            placeholder="Search components"
            aria-label="Search components"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setQ('')}
          />
          {q ? (
            <button className="btn btn-ghost btn-icon btn-sm trail" onClick={() => setQ('')} aria-label="Clear search">
              <X size={15} />
            </button>
          ) : (
            <span className="trail kit-search-hint" aria-hidden="true">
              <Kbd>Esc</Kbd>
            </span>
          )}
        </div>
        <div className="kit-groups" role="group" aria-label="Filter by group">
          <Tag selected={!group} onClick={() => setGroup(null)} tone="brand">
            All {registry.length}
          </Tag>
          {GROUPS.map((g) => (
            <Tag key={g} selected={group === g} onClick={() => setGroup(group === g ? null : g)} tone="brand">
              {g} {counts[g]}
            </Tag>
          ))}
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {grouped ? '' : `${shown.length} ${shown.length === 1 ? 'component' : 'components'}`}
      </p>

      {shown.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Search size={22} />}
            title="No components match"
            description={`Nothing for “${q}”. Try a shorter word, like “menu” or “date”.`}
          />
        </div>
      ) : grouped ? (
        GROUPS.map((g) => (
          <section key={g} className="kit-section" aria-labelledby={`kit-g-${g}`}>
            <h2 id={`kit-g-${g}`}>
              {g} <span>{counts[g]}</span>
            </h2>
            <m.div className="kit-grid" variants={stagger(0.03)} initial="hidden" animate="show">
              {registry
                .filter((c) => c.group === g)
                .map((c) => (
                  <KitCard key={c.slug} c={c} />
                ))}
            </m.div>
          </section>
        ))
      ) : (
        <m.div className="kit-grid" key={`${group}-${q}`} variants={stagger(0.025)} initial="hidden" animate="show">
          {shown.map((c) => (
            <KitCard key={c.slug} c={c} />
          ))}
        </m.div>
      )}
    </>
  );
}
