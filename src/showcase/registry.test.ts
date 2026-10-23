import { describe, expect, it } from 'vitest';
import type { DocComponent } from './doc';
import { KIT_COUNT, nameFromSlug } from './kitCount';
import { GROUPS, registry } from './registry';

const docs = import.meta.glob<{ default: DocComponent }>('./docs/*.tsx', { eager: true });

describe('UI Kit registry', () => {
  it('lists every docs file exactly once', () => {
    const files = Object.keys(docs)
      .map((p) => p.replace('./docs/', '').replace('.tsx', ''))
      .sort();
    const listed = registry
      .map((r) => r.file)
      .filter((f) => f !== 'search-select')
      .sort();
    expect(listed).toEqual(files);
  });

  it('keeps the sidebar count and slug-to-name mapping in sync', () => {
    expect(KIT_COUNT).toBe(registry.length);
    for (const r of registry) expect(nameFromSlug(r.slug)).toBe(r.name);
  });

  it('has unique slugs and known groups', () => {
    expect(new Set(registry.map((r) => r.slug)).size).toBe(registry.length);
    for (const r of registry) expect(GROUPS).toContain(r.group);
  });

  it('matches the name, group and status declared in each docs page', () => {
    for (const r of registry.filter((x) => x.file !== 'search-select')) {
      const spec = docs[`./docs/${r.file}.tsx`].default.spec;
      expect({ name: r.name, group: r.group, status: r.status, description: r.description }).toEqual({
        name: spec.name,
        group: spec.group,
        status: spec.status ?? 'stable',
        description: spec.description,
      });
    }
  });

  it('has a code region for every example', () => {
    for (const [path, mod] of Object.entries(docs)) {
      const { raw, examples } = mod.default.spec;
      for (const e of examples) expect(raw, `${path} → ${e.id}`).toContain(`// #region ${e.id}\n`);
    }
  });
});
